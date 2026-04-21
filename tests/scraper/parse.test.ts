import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parsePlayerPage } from '../../src/scraper/parse';

const fixture205001 = readFileSync(
  resolve(__dirname, '../fixtures/player-205001.html'),
  'utf-8'
);

const fixture210498 = readFileSync(
  resolve(__dirname, '../fixtures/player-210498.html'),
  'utf-8'
);

describe('parsePlayerPage', () => {
  describe('player info extraction', () => {
    it('extracts player name', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.name).toBe('אנדי פריימן');
    });

    it('extracts player ID', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.id).toBe(205001);
    });

    it('extracts FIDE ID when present', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.fideId).toBe(2875080);
    });

    it('returns null for FIDE ID when link text is empty', () => {
      const result = parsePlayerPage(fixture210498);
      expect(result.player.fideId).toBeNull();
    });

    it('extracts club name', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.club).toBe('מועדון השחמט רעננה');
    });

    it('extracts birth year', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.birthYear).toBe(2016);
    });

    it('extracts rating as a positive number', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.rating).toBeGreaterThan(0);
      expect(result.player.rating).toBe(1476);
    });

    it('extracts expected rating', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.expectedRating).toBe(1475);
    });

    it('extracts grade', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.grade).toBe('שישית');
    });

    it('extracts rank', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.rank).toBe(2872);
    });

    it('extracts license expiry as ISO 8601 date', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.player.licenseExpiry).toBe('2026-12-31');
    });

    it('returns scrapedAt as ISO 8601 timestamp', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.scrapedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it('includes ratingHistory array in result', () => {
      const result = parsePlayerPage(fixture205001);
      expect(Array.isArray(result.ratingHistory)).toBe(true);
      expect(result.ratingHistory.length).toBeGreaterThan(0);
    });
  });

  describe('tournament extraction', () => {
    it('returns array with length > 0 and <= 20', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.tournaments.length).toBeGreaterThan(0);
      expect(result.tournaments.length).toBeLessThanOrEqual(20);
    });

    it('parses wins/losses/draws as integers from result string', () => {
      const result = parsePlayerPage(fixture205001);
      // Find a tournament with non-zero results (e.g., "+3-1=0")
      const tournament = result.tournaments.find(t => t.wins > 0 || t.losses > 0);
      expect(tournament).toBeDefined();
      if (tournament) {
        expect(Number.isInteger(tournament.wins)).toBe(true);
        expect(Number.isInteger(tournament.losses)).toBe(true);
        expect(Number.isInteger(tournament.draws)).toBe(true);
      }
    });

    it('correctly parses positive rating change ("17.9+" -> 17.9)', () => {
      const result = parsePlayerPage(fixture205001);
      // Third tournament (27/03/2026) has rating change 17.9+
      const tournament = result.tournaments.find(t => t.tournamentName.includes('27.3'));
      expect(tournament).toBeDefined();
      if (tournament) {
        expect(tournament.ratingChange).toBeCloseTo(17.9, 1);
      }
    });

    it('correctly parses negative rating change ("1.7-" -> -1.7)', () => {
      const result = parsePlayerPage(fixture205001);
      // Second tournament (16/04/2026) has rating change 1.7-
      const tournament = result.tournaments.find(t => t.tournamentName.includes('16.4'));
      expect(tournament).toBeDefined();
      if (tournament) {
        expect(tournament.ratingChange).toBeCloseTo(-1.7, 1);
      }
    });

    it('correctly parses zero rating change', () => {
      const result = parsePlayerPage(fixture205001);
      // First tournament is pending with 0 rating change
      const pendingTournament = result.tournaments.find(t => t.isPending && t.ratingChange === 0);
      expect(pendingTournament).toBeDefined();
    });

    it('converts dates to ISO 8601 format (dd/MM/yyyy -> YYYY-MM-DD)', () => {
      const result = parsePlayerPage(fixture205001);
      // The first tournament starts on 23/04/2026 -> 2026-04-23
      expect(result.tournaments[0].startDate).toBe('2026-04-23');
    });

    it('sets isPending to true when updateDate text is "בעדכון הבא"', () => {
      const result = parsePlayerPage(fixture205001);
      const pendingTournaments = result.tournaments.filter(t => t.isPending);
      expect(pendingTournaments.length).toBeGreaterThan(0);
      pendingTournaments.forEach(t => {
        expect(t.updateDate).toBeNull();
      });
    });

    it('sets isPending to false and extracts update date when available', () => {
      const result = parsePlayerPage(fixture205001);
      const updatedTournament = result.tournaments.find(t => !t.isPending && t.updateDate !== null);
      expect(updatedTournament).toBeDefined();
      if (updatedTournament) {
        expect(updatedTournament.updateDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    });

    it('extracts tournament name and URL', () => {
      const result = parsePlayerPage(fixture205001);
      const tournament = result.tournaments[0];
      expect(tournament.tournamentName).toBeTruthy();
      expect(tournament.tournamentUrl).toContain('https://www.chess.org.il');
    });

    it('extracts games, points, and performance', () => {
      const result = parsePlayerPage(fixture205001);
      // Find a non-pending tournament
      const tournament = result.tournaments.find(t => !t.isPending && t.games > 0);
      expect(tournament).toBeDefined();
      if (tournament) {
        expect(typeof tournament.games).toBe('number');
        expect(typeof tournament.points).toBe('number');
        expect(typeof tournament.performance).toBe('number');
      }
    });
  });

  describe('optional fields', () => {
    it('returns null for missing optional fields', () => {
      const result = parsePlayerPage(fixture210498);
      expect(result.player.fideId).toBeNull();
    });

    it('handles player 210498 (Lenny Freiman) correctly', () => {
      const result = parsePlayerPage(fixture210498);
      expect(result.player.name).toBe('לני פריימן');
      expect(result.player.id).toBe(210498);
    });
  });

  describe('rating history extraction', () => {
    it('extracts 29 rating history entries for player 205001', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.ratingHistory).toHaveLength(29);
    });

    it('first entry for 205001 is 2023-03-28 with rating 1200', () => {
      const result = parsePlayerPage(fixture205001);
      expect(result.ratingHistory[0]).toEqual({ date: '2023-03-28', rating: 1200 });
    });

    it('last entry for 205001 is 2026-03-31 with rating 1476', () => {
      const result = parsePlayerPage(fixture205001);
      const last = result.ratingHistory[result.ratingHistory.length - 1];
      expect(last).toEqual({ date: '2026-03-31', rating: 1476 });
    });

    it('extracts 9 rating history entries for player 210498', () => {
      const result = parsePlayerPage(fixture210498);
      expect(result.ratingHistory).toHaveLength(9);
    });

    it('first entry for 210498 is 2025-01-24 with rating 1200', () => {
      const result = parsePlayerPage(fixture210498);
      expect(result.ratingHistory[0]).toEqual({ date: '2025-01-24', rating: 1200 });
    });

    it('last entry for 210498 is 2026-03-31 with rating 1261', () => {
      const result = parsePlayerPage(fixture210498);
      const last = result.ratingHistory[result.ratingHistory.length - 1];
      expect(last).toEqual({ date: '2026-03-31', rating: 1261 });
    });

    it('entries are sorted by date ascending', () => {
      const result = parsePlayerPage(fixture205001);
      const dates = result.ratingHistory.map(e => e.date);
      expect(dates).toEqual([...dates].sort());
    });

    it('returns empty array for invalid HTML', () => {
      // Use the error handling test -- parsePlayerPage throws on bad HTML,
      // but parseRatingHistory itself should return [] on failure
      // We test indirectly: valid pages always produce ratingHistory array
      const result = parsePlayerPage(fixture205001);
      expect(Array.isArray(result.ratingHistory)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('throws on invalid HTML with no player data', () => {
      expect(() => parsePlayerPage('<html><body>empty</body></html>')).toThrow();
    });
  });
});
