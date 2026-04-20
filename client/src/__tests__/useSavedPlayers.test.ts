import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useSavedPlayers } from '../hooks/useSavedPlayers';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useSavedPlayers', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('returns empty array when localStorage is empty', () => {
    const { result } = renderHook(() => useSavedPlayers());
    expect(result.current.savedPlayers).toEqual([]);
  });

  it('savePlayer adds a player with savedAt timestamp', () => {
    const { result } = renderHook(() => useSavedPlayers());
    act(() => {
      result.current.savePlayer({ id: 205001, name: 'Test', rating: 1500, club: null });
    });
    expect(result.current.savedPlayers).toHaveLength(1);
    expect(result.current.savedPlayers[0].id).toBe(205001);
    expect(result.current.savedPlayers[0].savedAt).toBeDefined();
  });

  it('savePlayer persists to localStorage', () => {
    const { result } = renderHook(() => useSavedPlayers());
    act(() => {
      result.current.savePlayer({ id: 205001, name: 'Test', rating: 1500, club: null });
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'chess-il-saved-players',
      expect.stringContaining('205001'),
    );
  });

  it('removePlayer removes a player by id', () => {
    const { result } = renderHook(() => useSavedPlayers());
    act(() => {
      result.current.savePlayer({ id: 1, name: 'A', rating: 1000, club: null });
    });
    act(() => {
      result.current.savePlayer({ id: 2, name: 'B', rating: 1100, club: null });
    });
    act(() => {
      result.current.removePlayer(1);
    });
    expect(result.current.savedPlayers).toHaveLength(1);
    expect(result.current.savedPlayers[0].id).toBe(2);
  });

  it('isSaved returns true for saved player', () => {
    const { result } = renderHook(() => useSavedPlayers());
    act(() => {
      result.current.savePlayer({ id: 205001, name: 'Test', rating: 1500, club: null });
    });
    expect(result.current.isSaved(205001)).toBe(true);
    expect(result.current.isSaved(999999)).toBe(false);
  });

  it('isFull is true when 10 players are saved', () => {
    const { result } = renderHook(() => useSavedPlayers());
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.savePlayer({ id: i, name: `P${i}`, rating: 1000 + i, club: null });
      });
    }
    expect(result.current.isFull).toBe(true);
    expect(result.current.savedPlayers).toHaveLength(10);
  });

  it('does not add 11th player when full', () => {
    const { result } = renderHook(() => useSavedPlayers());
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.savePlayer({ id: i, name: `P${i}`, rating: 1000, club: null });
      });
    }
    act(() => {
      result.current.savePlayer({ id: 99, name: 'Extra', rating: 2000, club: null });
    });
    expect(result.current.savedPlayers).toHaveLength(10);
    expect(result.current.isSaved(99)).toBe(false);
  });

  it('does not add duplicate player', () => {
    const { result } = renderHook(() => useSavedPlayers());
    act(() => {
      result.current.savePlayer({ id: 1, name: 'A', rating: 1000, club: null });
    });
    act(() => {
      result.current.savePlayer({ id: 1, name: 'A', rating: 1000, club: null });
    });
    expect(result.current.savedPlayers).toHaveLength(1);
  });

  it('loads saved players from localStorage on init', () => {
    const existing = [{ id: 1, name: 'A', rating: 1000, club: null, savedAt: '2026-01-01' }];
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(existing));
    const { result } = renderHook(() => useSavedPlayers());
    expect(result.current.savedPlayers).toHaveLength(1);
    expect(result.current.savedPlayers[0].id).toBe(1);
  });
});
