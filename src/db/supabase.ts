import { createClient } from '@supabase/supabase-js';
import type { PlayerData, ClubInfo } from '../../packages/shared/types.js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Module-scope: reused across warm serverless invocations (per D-15)
export const supabase = createClient(supabaseUrl, supabaseKey);

const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

/**
 * Checks whether cached data is older than 24 hours.
 */
export function isStale(updatedAt: string): boolean {
  const cacheAge = Date.now() - new Date(updatedAt).getTime();
  return cacheAge > TWENTY_FOUR_HOURS;
}

export interface CachedPlayerRow {
  player_id: number;
  data: PlayerData;
  updated_at: string;
}

/**
 * Retrieves cached player data from Supabase.
 * Returns the row if found, null otherwise.
 */
export async function getCachedPlayer(playerId: number): Promise<CachedPlayerRow | null> {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('player_id', playerId)
    .single();

  if (error || !data) return null;
  return data as CachedPlayerRow;
}

/**
 * Stores or updates player data in Supabase.
 * Uses upsert with onConflict on player_id for idempotent writes.
 */
export async function upsertPlayer(playerId: number, data: PlayerData): Promise<void> {
  const { error } = await supabase
    .from('players')
    .upsert(
      {
        player_id: playerId,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'player_id' }
    );

  if (error) throw error;
}

export interface CachedClubsRow {
  id: number;
  data: ClubInfo[];
  updated_at: string;
}

/**
 * Retrieves cached club list from Supabase.
 * Returns the single row (id=1) if found, null otherwise.
 */
export async function getCachedClubs(): Promise<CachedClubsRow | null> {
  const { data, error } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', 1)
    .single();
  if (error || !data) return null;
  return data as CachedClubsRow;
}

/**
 * Stores or updates the club list in Supabase.
 * Uses upsert with onConflict on id for idempotent writes.
 */
export async function upsertClubs(clubs: ClubInfo[]): Promise<void> {
  const { error } = await supabase
    .from('clubs')
    .upsert(
      { id: 1, data: clubs, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );
  if (error) throw error;
}
