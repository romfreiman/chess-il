import type { PlayerData } from '../../packages/shared/types.js';

/**
 * Validate parsed player data for correctness.
 * Throws if data is invalid; returns data unchanged if valid.
 */
export function validatePlayerData(data: PlayerData): PlayerData {
  if (!data.player.name || typeof data.player.name !== 'string') {
    throw new Error('Invalid player data: name is required');
  }

  if (!Number.isInteger(data.player.id) || data.player.id <= 0) {
    throw new Error('Invalid player data: id must be a positive integer');
  }

  if (typeof data.player.rating !== 'number' || data.player.rating <= 0 || isNaN(data.player.rating)) {
    throw new Error('Invalid player data: rating must be a positive number');
  }

  if (!Array.isArray(data.tournaments)) {
    throw new Error('Invalid player data: tournaments must be an array');
  }

  return data;
}
