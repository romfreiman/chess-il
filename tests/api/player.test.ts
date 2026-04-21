import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { PlayerData } from '../../packages/shared/types.js';

vi.mock('../../src/scraper/index.js', () => ({
  scrapePlayer: vi.fn(),
}));

vi.mock('../../src/db/supabase.js', () => ({
  getCachedPlayer: vi.fn(),
  isStale: vi.fn(),
  upsertPlayer: vi.fn(),
}));

import { scrapePlayer } from '../../src/scraper/index.js';
import { getCachedPlayer, isStale, upsertPlayer } from '../../src/db/supabase.js';

const mockScrapePlayer = vi.mocked(scrapePlayer);
const mockGetCachedPlayer = vi.mocked(getCachedPlayer);
const mockIsStale = vi.mocked(isStale);
const mockUpsertPlayer = vi.mocked(upsertPlayer);

const mockPlayerData: PlayerData = {
  player: {
    name: 'אנדי פריימן',
    id: 205001,
    fideId: 2875080,
    club: 'מכבי ראשון לציון',
    birthYear: 1983,
    rating: 1800,
    expectedRating: 1820,
    grade: 'דרגה א',
    rank: 500,
    licenseExpiry: '2026-12-31',
  },
  tournaments: [],
  ratingHistory: [],
  scrapedAt: '2026-04-20T10:00:00.000Z',
};

async function createApp() {
  const { playerRouter } = await import('../../src/api/routes/player.js');
  const app = express();
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  app.use('/api/player', playerRouter);
  return app;
}

describe('GET /api/player/:id', () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createApp();
  });

  it('returns cached data for fresh cache', async () => {
    const cachedRow = {
      player_id: 205001,
      data: mockPlayerData,
      updated_at: '2026-04-20T09:00:00.000Z',
    };
    mockGetCachedPlayer.mockResolvedValue(cachedRow);
    mockIsStale.mockReturnValue(false);

    const res = await request(app).get('/api/player/205001');

    expect(res.status).toBe(200);
    expect(res.body.player.name).toBe('אנדי פריימן');
    expect(res.body.meta.cached).toBe(true);
    expect(res.body.meta.stale).toBe(false);
    expect(mockScrapePlayer).not.toHaveBeenCalled();
  });

  it('scrapes on cache miss', async () => {
    mockGetCachedPlayer.mockResolvedValue(null);
    mockScrapePlayer.mockResolvedValue(mockPlayerData);
    mockUpsertPlayer.mockResolvedValue(undefined);

    const res = await request(app).get('/api/player/205001');

    expect(res.status).toBe(200);
    expect(res.body.meta.cached).toBe(false);
    expect(mockScrapePlayer).toHaveBeenCalledWith(205001);
    expect(mockUpsertPlayer).toHaveBeenCalledWith(205001, mockPlayerData);
  });

  it('scrapes on stale cache', async () => {
    const staleRow = {
      player_id: 205001,
      data: mockPlayerData,
      updated_at: '2026-04-18T10:00:00.000Z',
    };
    mockGetCachedPlayer.mockResolvedValue(staleRow);
    mockIsStale.mockReturnValue(true);
    mockScrapePlayer.mockResolvedValue(mockPlayerData);
    mockUpsertPlayer.mockResolvedValue(undefined);

    const res = await request(app).get('/api/player/205001');

    expect(res.status).toBe(200);
    expect(res.body.meta.cached).toBe(false);
    expect(mockScrapePlayer).toHaveBeenCalledWith(205001);
  });

  it('returns stale data when scrape fails', async () => {
    const staleRow = {
      player_id: 205001,
      data: mockPlayerData,
      updated_at: '2026-04-18T10:00:00.000Z',
    };
    mockGetCachedPlayer.mockResolvedValueOnce(staleRow);
    mockIsStale.mockReturnValue(true);
    mockScrapePlayer.mockRejectedValue(new Error('Network error'));
    mockGetCachedPlayer.mockResolvedValueOnce(staleRow);

    const res = await request(app).get('/api/player/205001');

    expect(res.status).toBe(200);
    expect(res.body.meta.cached).toBe(true);
    expect(res.body.meta.stale).toBe(true);
  });

  it('returns 404 when scrape fails and no cache', async () => {
    mockGetCachedPlayer.mockResolvedValue(null);
    mockScrapePlayer.mockRejectedValue(new Error('PLAYER_NOT_FOUND'));

    const res = await request(app).get('/api/player/205001');

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('PLAYER_NOT_FOUND');
    expect(res.body.statusCode).toBe(404);
  });

  it('force=true skips cache', async () => {
    mockScrapePlayer.mockResolvedValue(mockPlayerData);
    mockUpsertPlayer.mockResolvedValue(undefined);

    const res = await request(app).get('/api/player/205001?force=true');

    expect(res.status).toBe(200);
    expect(res.body.meta.cached).toBe(false);
    expect(mockScrapePlayer).toHaveBeenCalledWith(205001);
  });

  it('rejects invalid ID (non-numeric)', async () => {
    const res = await request(app).get('/api/player/abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ID');
    expect(res.body.message).toContain('positive integer');
  });

  it('rejects invalid ID (negative)', async () => {
    const res = await request(app).get('/api/player/-5');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ID');
  });

  it('rejects invalid ID (zero)', async () => {
    const res = await request(app).get('/api/player/0');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ID');
  });

  it('includes CORS headers', async () => {
    mockGetCachedPlayer.mockResolvedValue(null);
    mockScrapePlayer.mockResolvedValue(mockPlayerData);
    mockUpsertPlayer.mockResolvedValue(undefined);

    const res = await request(app).get('/api/player/205001');

    expect(res.headers['access-control-allow-origin']).toBe('*');
  });
});
