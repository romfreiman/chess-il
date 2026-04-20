import axios from 'axios';

const BASE_URL = 'https://www.chess.org.il/Players/Player.aspx';
const USER_AGENT = 'ChessIL-Dashboard/1.0 (community project)';

/**
 * Fetch a player page HTML from chess.org.il.
 *
 * Uses validateStatus: () => true to handle HTTP 500 without axios throwing,
 * so we can detect the "Runtime Error" page for non-existent players.
 */
export async function fetchPlayerPage(id: number): Promise<string> {
  try {
    const response = await axios.get(`${BASE_URL}?Id=${id}`, {
      headers: {
        'User-Agent': USER_AGENT,
      },
      timeout: 15000,
      responseType: 'text',
      validateStatus: () => true, // Don't throw on non-2xx
    });

    // Detect non-existent player: chess.org.il returns HTTP 500 with "Runtime Error" page
    if (response.status === 500) {
      const body = typeof response.data === 'string' ? response.data : '';
      if (body.includes('Runtime Error')) {
        throw new Error(`PLAYER_NOT_FOUND: No player found with ID ${id}`);
      }
      throw new Error(`Server error (HTTP 500) when fetching player ${id}`);
    }

    if (response.status !== 200) {
      throw new Error(`Unexpected HTTP ${response.status} when fetching player ${id}`);
    }

    return response.data as string;
  } catch (error) {
    // Re-throw our own errors (PLAYER_NOT_FOUND, etc.)
    if (error instanceof Error && (error.message.includes('PLAYER_NOT_FOUND') || error.message.includes('Server error') || error.message.includes('Unexpected HTTP'))) {
      throw error;
    }
    // Network error or other axios error
    throw new Error(`Failed to fetch player ${id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}
