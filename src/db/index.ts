import type { CachedPlayerRow, CachedClubsRow } from './supabase.js';
import type { PlayerData, ClubInfo } from '../../packages/shared/types.js';

export type { CachedPlayerRow, CachedClubsRow };

const useSupabase = !!process.env.SUPABASE_URL;

let _mod: {
  getCachedPlayer: Function;
  isStale: Function;
  upsertPlayer: Function;
  getCachedClubs: Function;
  upsertClubs: Function;
} | null = null;

async function getModule() {
  if (!_mod) {
    _mod = useSupabase
      ? await import('./supabase.js')
      : await import('./sqlite.js');
  }
  return _mod;
}

export async function getCachedPlayer(playerId: number): Promise<CachedPlayerRow | null> {
  const m = await getModule();
  return m.getCachedPlayer(playerId);
}

export function isStale(updatedAt: string): boolean {
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  return Date.now() - new Date(updatedAt).getTime() > TWENTY_FOUR_HOURS;
}

export async function upsertPlayer(playerId: number, data: PlayerData): Promise<void> {
  const m = await getModule();
  return m.upsertPlayer(playerId, data);
}

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export function isClubsCacheStale(updatedAt: string): boolean {
  return Date.now() - new Date(updatedAt).getTime() > SEVEN_DAYS;
}

export async function getCachedClubs(): Promise<CachedClubsRow | null> {
  const m = await getModule();
  return m.getCachedClubs();
}

export async function upsertClubs(clubs: ClubInfo[]): Promise<void> {
  const m = await getModule();
  return m.upsertClubs(clubs);
}
