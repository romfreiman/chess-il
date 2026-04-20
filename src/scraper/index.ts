import { fetchPlayerPage } from './fetch.js';
import { parsePlayerPage } from './parse.js';
import { validatePlayerData } from './validate.js';
import type { PlayerData } from '../../packages/shared/types.js';

/**
 * Scrape a player page from chess.org.il and return structured data.
 * Orchestrates: fetch -> parse -> validate
 */
export async function scrapePlayer(id: number): Promise<PlayerData> {
  const html = await fetchPlayerPage(id);
  const data = parsePlayerPage(html);
  return validatePlayerData(data);
}

// Re-export for direct access
export { fetchPlayerPage } from './fetch.js';
export { parsePlayerPage } from './parse.js';
export { validatePlayerData } from './validate.js';
