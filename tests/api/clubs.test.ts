import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../../src/scraper/clubs.js', () => ({
  scrapeClubList: vi.fn(),
  searchClubPlayers: vi.fn(),
}));

vi.mock('../../src/db/index.js', () => ({
  getCachedClubs: vi.fn(),
  upsertClubs: vi.fn(),
  isClubsCacheStale: vi.fn(),
}));

import { scrapeClubList, searchClubPlayers } from '../../src/scraper/clubs.js';
import { getCachedClubs, upsertClubs, isClubsCacheStale } from '../../src/db/index.js';

const mockScrapeClubList = vi.mocked(scrapeClubList);
const mockSearchClubPlayers = vi.mocked(searchClubPlayers);
const mockGetCachedClubs = vi.mocked(getCachedClubs);
const mockUpsertClubs = vi.mocked(upsertClubs);
const mockIsClubsCacheStale = vi.mocked(isClubsCacheStale);

const testClubs = [
  { id: 6, name: 'אליצור ירושלים' },
  { id: 24, name: 'מכבי ראשון לציון' },
];

const testSearchResults = [
  { id: 205001, name: 'אנדי פריימן', rating: 1800, club: 'אליצור ירושלים', birthYear: 1983 },
  { id: 210498, name: 'לני פריימן', rating: 1253, club: 'אליצור ירושלים', birthYear: 2015 },
];

async function createApp() {
  const { clubsRouter } = await import('../../src/api/routes/clubs.js');
  const app = express();
  app.use('/api/clubs', clubsRouter);
  return app;
}

describe('GET /api/clubs', () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createApp();
  });

  it('returns cached clubs when cache is fresh', async () => {
    const cachedRow = {
      id: 1,
      data: testClubs,
      updated_at: new Date().toISOString(),
    };
    mockGetCachedClubs.mockResolvedValue(cachedRow);
    mockIsClubsCacheStale.mockReturnValue(false);

    const res = await request(app).get('/api/clubs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(testClubs);
    expect(mockScrapeClubList).not.toHaveBeenCalled();
  });

  it('scrapes when cache is stale', async () => {
    const staleRow = {
      id: 1,
      data: testClubs,
      updated_at: '2026-04-01T00:00:00.000Z',
    };
    mockGetCachedClubs.mockResolvedValue(staleRow);
    mockIsClubsCacheStale.mockReturnValue(true);
    mockScrapeClubList.mockResolvedValue(testClubs);
    mockUpsertClubs.mockResolvedValue(undefined);

    const res = await request(app).get('/api/clubs');

    expect(res.status).toBe(200);
    expect(mockScrapeClubList).toHaveBeenCalled();
    expect(mockUpsertClubs).toHaveBeenCalledWith(testClubs);
  });

  it('scrapes when no cache exists', async () => {
    mockGetCachedClubs.mockResolvedValue(null);
    mockScrapeClubList.mockResolvedValue(testClubs);
    mockUpsertClubs.mockResolvedValue(undefined);

    const res = await request(app).get('/api/clubs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(testClubs);
    expect(mockScrapeClubList).toHaveBeenCalled();
    expect(mockUpsertClubs).toHaveBeenCalledWith(testClubs);
  });

  it('force=true bypasses cache', async () => {
    mockScrapeClubList.mockResolvedValue(testClubs);
    mockUpsertClubs.mockResolvedValue(undefined);

    const res = await request(app).get('/api/clubs?force=true');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(testClubs);
    expect(mockScrapeClubList).toHaveBeenCalled();
    expect(mockGetCachedClubs).not.toHaveBeenCalled();
  });

  it('returns empty array on scrape failure with no cache', async () => {
    mockGetCachedClubs.mockResolvedValueOnce(null);
    mockScrapeClubList.mockResolvedValue([]);
    // getCachedClubs called again in fallback
    mockGetCachedClubs.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/clubs');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});

describe('GET /api/clubs/search', () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await createApp();
  });

  it('returns results for valid club param', async () => {
    mockSearchClubPlayers.mockResolvedValue(testSearchResults);

    const res = await request(app).get('/api/clubs/search?club=6');

    expect(res.status).toBe(200);
    expect(res.body).toEqual(testSearchResults);
    expect(mockSearchClubPlayers).toHaveBeenCalledWith(6, undefined, undefined);
  });

  it('returns 400 without club param', async () => {
    const res = await request(app).get('/api/clubs/search');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_CLUB');
    expect(res.body.statusCode).toBe(400);
  });

  it('returns 400 for non-numeric club param', async () => {
    const res = await request(app).get('/api/clubs/search?club=abc');

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_CLUB');
  });

  it('passes age params to scraper', async () => {
    mockSearchClubPlayers.mockResolvedValue(testSearchResults);

    const res = await request(app).get('/api/clubs/search?club=6&minAge=8&maxAge=14');

    expect(res.status).toBe(200);
    expect(mockSearchClubPlayers).toHaveBeenCalledWith(6, 8, 14);
  });

  it('returns empty array on scrape failure', async () => {
    mockSearchClubPlayers.mockRejectedValue(new Error('Network error'));

    const res = await request(app).get('/api/clubs/search?club=6');

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });
});
