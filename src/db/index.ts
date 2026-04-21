export type { CachedPlayerRow } from './supabase.js';

const useSupabase = !!process.env.SUPABASE_URL;

const mod = useSupabase
  ? await import('./supabase.js')
  : await import('./sqlite.js');

export const getCachedPlayer = mod.getCachedPlayer;
export const isStale = mod.isStale;
export const upsertPlayer = mod.upsertPlayer;
