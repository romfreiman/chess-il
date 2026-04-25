import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateCsvContent, generateFilename } from './exportCsv';
import type { ClubSearchResult } from '@shared/types';

describe('generateCsvContent', () => {
  const singlePlayer: ClubSearchResult[] = [
    { id: 205001, name: 'אנדי פריימן', rating: 1476, club: 'מכבי ירושלים', birthYear: 1985 },
  ];

  it('returns string starting with UTF-8 BOM', () => {
    const csv = generateCsvContent(singlePlayer);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
  });

  it('first line after BOM is Hebrew header row', () => {
    const csv = generateCsvContent(singlePlayer);
    const lines = csv.split('\r\n');
    // Remove BOM from first line
    const header = lines[0].replace(/^﻿/, '');
    expect(header).toBe('שם,מספר שחקן,דירוג,מועדון,גיל,מיקום');
  });

  it('data rows contain correct values with calculated age and 1-based rank', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));

    const csv = generateCsvContent(singlePlayer);
    const lines = csv.split('\r\n');
    const dataRow = lines[1];
    // age = 2026 - 1985 = 41, rank = 1
    expect(dataRow).toBe('אנדי פריימן,205001,1476,מכבי ירושלים,41,1');

    vi.useRealTimers();
  });

  it('null rating renders as empty string (not "null" or dash)', () => {
    const players: ClubSearchResult[] = [
      { id: 100, name: 'שחקן', rating: null, club: 'מועדון', birthYear: 2000 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));

    const csv = generateCsvContent(players);
    const lines = csv.split('\r\n');
    const dataRow = lines[1];
    // rating is empty between commas: name,id,,club,age,rank
    expect(dataRow).toBe('שחקן,100,,מועדון,26,1');

    vi.useRealTimers();
  });

  it('null birthYear renders age as empty string', () => {
    const players: ClubSearchResult[] = [
      { id: 100, name: 'שחקן', rating: 1500, club: 'מועדון', birthYear: null },
    ];

    const csv = generateCsvContent(players);
    const lines = csv.split('\r\n');
    const dataRow = lines[1];
    // age is empty between commas: name,id,rating,club,,rank
    expect(dataRow).toBe('שחקן,100,1500,מועדון,,1');
  });

  it('field containing comma is wrapped in double quotes', () => {
    const players: ClubSearchResult[] = [
      { id: 100, name: 'שחקן', rating: 1500, club: 'מכבי תל אביב, סניף צפון', birthYear: 2000 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));

    const csv = generateCsvContent(players);
    const lines = csv.split('\r\n');
    const dataRow = lines[1];
    expect(dataRow).toContain('"מכבי תל אביב, סניף צפון"');

    vi.useRealTimers();
  });

  it('field containing double quote has internal quotes doubled and field wrapped (RFC 4180)', () => {
    const players: ClubSearchResult[] = [
      { id: 100, name: 'שחקן "טוב"', rating: 1500, club: 'מועדון', birthYear: 2000 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));

    const csv = generateCsvContent(players);
    const lines = csv.split('\r\n');
    const dataRow = lines[1];
    expect(dataRow).toMatch(/^"שחקן ""טוב"""/);

    vi.useRealTimers();
  });

  it('multiple players produce multiple data rows with sequential rank', () => {
    const players: ClubSearchResult[] = [
      { id: 1, name: 'אחד', rating: 1500, club: 'מועדון', birthYear: 2000 },
      { id: 2, name: 'שניים', rating: 1400, club: 'מועדון', birthYear: 1990 },
      { id: 3, name: 'שלוש', rating: 1300, club: 'מועדון', birthYear: 1980 },
    ];

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));

    const csv = generateCsvContent(players);
    const lines = csv.split('\r\n');
    // Header + 3 data rows + trailing empty string after final \r\n
    expect(lines.length).toBeGreaterThanOrEqual(4);
    expect(lines[1]).toContain(',1'); // rank 1 at end
    expect(lines[2]).toContain(',2'); // rank 2 at end
    expect(lines[3]).toContain(',3'); // rank 3 at end

    // Verify exact rank values at end of each line
    expect(lines[1].endsWith(',1')).toBe(true);
    expect(lines[2].endsWith(',2')).toBe(true);
    expect(lines[3].endsWith(',3')).toBe(true);

    vi.useRealTimers();
  });
});

describe('generateFilename', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-25T14:30:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns format {clubName}-YYYY-MM-DD-HHmm.csv', () => {
    const filename = generateFilename('אליצור ירושלים');
    expect(filename).toBe('אליצור ירושלים-2026-04-25-1430.csv');
  });
});
