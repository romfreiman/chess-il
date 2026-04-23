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

  describe('cross-tab and visibility sync', () => {
    it('updates state when storage event fires for saved players key', () => {
      const { result } = renderHook(() => useSavedPlayers());
      expect(result.current.savedPlayers).toEqual([]);

      const newPlayers = [
        { id: 42, name: 'Cross-Tab', rating: 1800, club: 'Club A', savedAt: '2026-04-23' },
      ];

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'chess-il-saved-players',
            newValue: JSON.stringify(newPlayers),
          }),
        );
      });

      expect(result.current.savedPlayers).toEqual(newPlayers);
    });

    it('ignores storage events for other keys', () => {
      const { result } = renderHook(() => useSavedPlayers());
      act(() => {
        result.current.savePlayer({ id: 1, name: 'A', rating: 1000, club: null });
      });
      const before = result.current.savedPlayers;

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'theme',
            newValue: 'dark',
          }),
        );
      });

      expect(result.current.savedPlayers).toBe(before);
    });

    it('resets to empty array when storage event has null newValue', () => {
      const { result } = renderHook(() => useSavedPlayers());
      act(() => {
        result.current.savePlayer({ id: 1, name: 'A', rating: 1000, club: null });
      });
      expect(result.current.savedPlayers).toHaveLength(1);

      act(() => {
        window.dispatchEvent(
          new StorageEvent('storage', {
            key: 'chess-il-saved-players',
            newValue: null,
          }),
        );
      });

      expect(result.current.savedPlayers).toEqual([]);
    });

    it('re-reads localStorage when document becomes visible', () => {
      const { result } = renderHook(() => useSavedPlayers());
      expect(result.current.savedPlayers).toEqual([]);

      // Simulate another tab writing to localStorage directly
      const updatedPlayers = [
        { id: 99, name: 'BackNav', rating: 1600, club: null, savedAt: '2026-04-23' },
      ];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(updatedPlayers));

      // Simulate tab becoming visible (e.g., back/forward navigation)
      act(() => {
        Object.defineProperty(document, 'visibilityState', {
          value: 'visible',
          writable: true,
          configurable: true,
        });
        document.dispatchEvent(new Event('visibilitychange'));
      });

      expect(result.current.savedPlayers).toEqual(updatedPlayers);
    });

    it('cleans up event listeners on unmount', () => {
      const addWindowSpy = vi.spyOn(window, 'addEventListener');
      const removeWindowSpy = vi.spyOn(window, 'removeEventListener');
      const addDocSpy = vi.spyOn(document, 'addEventListener');
      const removeDocSpy = vi.spyOn(document, 'removeEventListener');

      const { unmount } = renderHook(() => useSavedPlayers());

      expect(addWindowSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(addDocSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

      unmount();

      expect(removeWindowSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      expect(removeDocSpy).toHaveBeenCalledWith('visibilitychange', expect.any(Function));

      addWindowSpy.mockRestore();
      removeWindowSpy.mockRestore();
      addDocSpy.mockRestore();
      removeDocSpy.mockRestore();
    });
  });
});
