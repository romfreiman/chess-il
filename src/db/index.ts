import type { CachedPlayerRow } from './supabase.js';
import type { PlayerData } from '../../packages/shared/types.js';

export type { CachedPlayerRow };

const useSupabase = !!process.env.SUPABASE_URL;

let _mod: { getCachedPlayer: Function; isStale: Function; upsertPlayer: Function } | null = null;

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
