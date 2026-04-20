import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to define mocks that are available when vi.mock factory runs
const { mockSingle, mockEq, mockSelect, mockUpsert, mockFrom } = vi.hoisted(() => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockUpsert = vi.fn();
  const mockFrom = vi.fn((_table: string) => ({
    select: mockSelect,
    upsert: mockUpsert,
  }));
  return { mockSingle, mockEq, mockSelect, mockUpsert, mockFrom };
});

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockFrom,
  })),
}));

// Set env vars before import
process.env.SUPABASE_URL = 'https://test-project.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

import { isStale, getCachedPlayer, upsertPlayer } from '../../src/db/supabase.js';
import type { PlayerData } from '../../packages/shared/types.js';

const mockPlayerData: PlayerData = {
  player: {
    name: 'אנדי פריימן',
    id: 205001,
    fideId: 2875080,
    club: 'מועדון השחמט רעננה',
    birthYear: 2016,
    rating: 1476,
    expectedRating: 1475,
    grade: 'שישית',
    rank: 2872,
    licenseExpiry: '2026-12-31',
  },
  tournaments: [],
  scrapedAt: '2026-04-19T10:00:00.000Z',
};

describe('isStale', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns true for data older than 24 hours', () => {
    // Set current time to 2026-04-19T11:00:00Z
    vi.setSystemTime(new Date('2026-04-19T11:00:00Z'));
    // Data updated at 2026-04-18T10:00:00Z (25 hours ago)
    expect(isStale('2026-04-18T10:00:00Z')).toBe(true);
  });

  it('returns false for data within 24 hours', () => {
    // Set current time to 2026-04-19T11:00:00Z
    vi.setSystemTime(new Date('2026-04-19T11:00:00Z'));
    // Data updated at 2026-04-19T10:00:00Z (1 hour ago)
    expect(isStale('2026-04-19T10:00:00Z')).toBe(false);
  });
});

describe('getCachedPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns data object when Supabase returns a row', async () => {
    const mockRow = {
      player_id: 205001,
      data: mockPlayerData,
      updated_at: '2026-04-19T10:00:00Z',
    };

    mockSingle.mockResolvedValueOnce({ data: mockRow, error: null });

    const result = await getCachedPlayer(205001);

    expect(mockFrom).toHaveBeenCalledWith('players');
    expect(mockSelect).toHaveBeenCalledWith('*');
    expect(mockEq).toHaveBeenCalledWith('player_id', 205001);
    expect(result).toEqual(mockRow);
  });

  it('returns null when Supabase returns no row', async () => {
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST116' },
    });

    const result = await getCachedPlayer(999999);

    expect(mockFrom).toHaveBeenCalledWith('players');
    expect(mockEq).toHaveBeenCalledWith('player_id', 999999);
    expect(result).toBeNull();
  });
});

describe('upsertPlayer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls supabase upsert with correct data and onConflict', async () => {
    mockUpsert.mockResolvedValueOnce({ error: null });

    await upsertPlayer(205001, mockPlayerData);

    expect(mockFrom).toHaveBeenCalledWith('players');
    expect(mockUpsert).toHaveBeenCalledWith(
      {
        player_id: 205001,
        data: mockPlayerData,
        updated_at: expect.any(String),
      },
      { onConflict: 'player_id' }
    );
  });

  it('throws on upsert error', async () => {
    const mockError = { message: 'Database error', code: '42P01' };
    mockUpsert.mockResolvedValueOnce({ error: mockError });

    await expect(upsertPlayer(205001, mockPlayerData)).rejects.toEqual(mockError);
  });
});
