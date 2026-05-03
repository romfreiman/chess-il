import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiError } from '../../../packages/shared/types.js';
import { scrapeClubList, searchClubPlayers, searchMultipleClubPlayers } from '../../scraper/clubs.js';
import { getCachedClubs, upsertClubs, isClubsCacheStale } from '../../db/index.js';

export const clubsRouter = Router();

// Search route MUST be before any parameterized route to prevent Express matching "search" as a param
clubsRouter.get('/search', async (req: Request, res: Response) => {
  const clubParam = req.query.club;
  let clubIds: number[];

  if (Array.isArray(clubParam)) {
    clubIds = clubParam.map((v) => parseInt(String(v), 10));
  } else if (typeof clubParam === 'string') {
    if (clubParam.includes(',')) {
      clubIds = clubParam.split(',').map((v) => parseInt(v, 10));
    } else {
      clubIds = [parseInt(clubParam, 10)];
    }
  } else {
    const error: ApiError = {
      error: 'INVALID_CLUB',
      message: 'club query parameter must be a positive integer',
      statusCode: 400,
    };
    return res.status(400).json(error);
  }

  if (clubIds.some((id) => isNaN(id) || id <= 0)) {
    const error: ApiError = {
      error: 'INVALID_CLUB',
      message: 'club query parameter must be a positive integer',
      statusCode: 400,
    };
    return res.status(400).json(error);
  }

  if (clubIds.length > 5) {
    const error: ApiError = {
      error: 'TOO_MANY_CLUBS',
      message: 'Max 5 clubs allowed',
      statusCode: 400,
    };
    return res.status(400).json(error);
  }

  const minAgeParam = req.query.minAge as string | undefined;
  const maxAgeParam = req.query.maxAge as string | undefined;
  const minAge = minAgeParam ? parseInt(minAgeParam, 10) : undefined;
  const maxAge = maxAgeParam ? parseInt(maxAgeParam, 10) : undefined;

  try {
    const results = await searchMultipleClubPlayers(
      clubIds,
      minAge !== undefined && !isNaN(minAge) ? minAge : undefined,
      maxAge !== undefined && !isNaN(maxAge) ? maxAge : undefined
    );
    return res.json(results);
  } catch {
    return res.json([]);
  }
});

clubsRouter.get('/', async (req: Request, res: Response) => {
  const forceRefresh = String(req.query.force) === 'true';

  try {
    if (!forceRefresh) {
      const cached = await getCachedClubs();
      if (cached && !isClubsCacheStale(cached.updated_at)) {
        return res.json(cached.data);
      }
    }

    const clubs = await scrapeClubList();

    if (clubs.length > 0) {
      await upsertClubs(clubs);
      return res.json(clubs);
    }

    // Scrape returned empty — try stale cache as fallback
    const staleCache = await getCachedClubs();
    if (staleCache) {
      return res.json(staleCache.data);
    }

    return res.json([]);
  } catch {
    // On unexpected error, try stale cache fallback
    try {
      const staleCache = await getCachedClubs();
      if (staleCache) {
        return res.json(staleCache.data);
      }
    } catch {
      // ignore secondary error
    }
    return res.json([]);
  }
});
