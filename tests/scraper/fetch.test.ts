import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchPlayerPage } from '../../src/scraper/fetch';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('fetchPlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends GET request to correct URL with User-Agent header', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: '<html>player page</html>',
    });

    await fetchPlayerPage(205001);

    expect(mockedAxios.get).toHaveBeenCalledWith(
      'https://www.chess.org.il/Players/Player.aspx?Id=205001',
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': 'ChessIL-Dashboard/1.0 (community project)',
        }),
        timeout: 15000,
        responseType: 'text',
      })
    );
  });

  it('returns HTML string on success', async () => {
    const html = '<html><body>player data</body></html>';
    mockedAxios.get.mockResolvedValue({
      status: 200,
      data: html,
    });

    const result = await fetchPlayerPage(205001);
    expect(result).toBe(html);
  });

  it('throws PLAYER_NOT_FOUND for HTTP 500 with Runtime Error', async () => {
    mockedAxios.get.mockResolvedValue({
      status: 500,
      data: '<html><head><title>Runtime Error</title></head><body>Server Error</body></html>',
    });

    await expect(fetchPlayerPage(999999)).rejects.toThrow('PLAYER_NOT_FOUND');
  });

  it('throws descriptive error on network failure', async () => {
    mockedAxios.get.mockRejectedValue(new Error('Network Error'));

    await expect(fetchPlayerPage(205001)).rejects.toThrow(/205001/);
  });
});
