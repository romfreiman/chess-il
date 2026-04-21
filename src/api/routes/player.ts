import { Router } from 'express';
import type { Request, Response } from 'express';
import type { ApiResponse, ApiError } from '../../../packages/shared/types.js';
import { scrapePlayer } from '../../scraper/index.js';
import { getCachedPlayer, isStale, upsertPlayer } from '../../db/index.js';

export const playerRouter = Router();

playerRouter.get('/:id', async (req: Request, res: Response) => {
  const idParam = req.params.id as string;
  const id = parseInt(idParam, 10);

  if (isNaN(id) || id <= 0 || !/^\d+$/.test(idParam)) {
    const error: ApiError = {
      error: 'INVALID_ID',
      message: 'Player ID must be a positive integer',
      statusCode: 400,
    };
    return res.status(400).json(error);
  }

  const forceRefresh = String(req.query.force) === 'true';

  if (!forceRefresh) {
    const cached = await getCachedPlayer(id);
    if (cached && !isStale(cached.updated_at)) {
      const response: ApiResponse = {
        player: cached.data.player,
        tournaments: cached.data.tournaments,
        meta: {
          cached: true,
          stale: false,
          scrapedAt: cached.data.scrapedAt,
          cachedAt: cached.updated_at,
        },
      };
      return res.json(response);
    }
  }

  try {
    const data = await scrapePlayer(id);
    await upsertPlayer(id, data);
    const response: ApiResponse = {
      player: data.player,
      tournaments: data.tournaments,
      meta: {
        cached: false,
        stale: false,
        scrapedAt: data.scrapedAt,
        cachedAt: new Date().toISOString(),
      },
    };
    return res.json(response);
  } catch {
    const staleCache = await getCachedPlayer(id);
    if (staleCache) {
      const response: ApiResponse = {
        player: staleCache.data.player,
        tournaments: staleCache.data.tournaments,
        meta: {
          cached: true,
          stale: true,
          scrapedAt: staleCache.data.scrapedAt,
          cachedAt: staleCache.updated_at,
        },
      };
      return res.json(response);
    }

    const error: ApiError = {
      error: 'PLAYER_NOT_FOUND',
      message: `No player found with ID ${id}`,
      statusCode: 404,
    };
    return res.status(404).json(error);
  }
});
