import Database from 'better-sqlite3';
import path from 'path';
import type { PlayerData, ClubInfo } from '../../packages/shared/types.js';

export interface CachedPlayerRow {
  player_id: number;
  data: PlayerData;
  updated_at: string;
}

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

const dbPath = path.resolve(process.cwd(), 'chess-cache.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    player_id INTEGER PRIMARY KEY,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);
db.exec(`
  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY DEFAULT 1,
    data TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

export function isStale(updatedAt: string): boolean {
  const cacheAge = Date.now() - new Date(updatedAt).getTime();
  return cacheAge > TWENTY_FOUR_HOURS;
}

export async function getCachedPlayer(playerId: number): Promise<CachedPlayerRow | null> {
  const row = db.prepare('SELECT * FROM players WHERE player_id = ?').get(playerId) as
    | { player_id: number; data: string; updated_at: string }
    | undefined;
  if (!row) return null;
  return {
    player_id: row.player_id,
    data: JSON.parse(row.data),
    updated_at: row.updated_at,
  };
}

export async function upsertPlayer(playerId: number, data: PlayerData): Promise<void> {
  db.prepare(
    'INSERT OR REPLACE INTO players (player_id, data, updated_at) VALUES (?, ?, ?)'
  ).run(playerId, JSON.stringify(data), new Date().toISOString());
}

export interface CachedClubsRow {
  id: number;
  data: ClubInfo[];
  updated_at: string;
}

export async function getCachedClubs(): Promise<CachedClubsRow | null> {
  const row = db.prepare('SELECT * FROM clubs WHERE id = 1').get() as
    | { id: number; data: string; updated_at: string }
    | undefined;
  if (!row) return null;
  return {
    id: row.id,
    data: JSON.parse(row.data),
    updated_at: row.updated_at,
  };
}

export async function upsertClubs(clubs: ClubInfo[]): Promise<void> {
  db.prepare(
    'INSERT OR REPLACE INTO clubs (id, data, updated_at) VALUES (1, ?, ?)'
  ).run(JSON.stringify(clubs), new Date().toISOString());
}
