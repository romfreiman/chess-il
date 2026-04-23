import { useState, useCallback, useEffect } from 'react';
import { STORAGE_KEYS, MAX_SAVED_PLAYERS } from '../lib/constants';
import type { SavedPlayer } from '../lib/types';

export interface UseSavedPlayersResult {
  savedPlayers: SavedPlayer[];
  savePlayer: (player: Omit<SavedPlayer, 'savedAt'>) => boolean;
  removePlayer: (id: number) => void;
  isSaved: (id: number) => boolean;
  isFull: boolean;
}

function readSavedPlayers(): SavedPlayer[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.savedPlayers);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useSavedPlayers(): UseSavedPlayersResult {
  const [savedPlayers, setSavedPlayers] = useState<SavedPlayer[]>(readSavedPlayers);

  // Sync across browser tabs via storage event, and on back/forward navigation via visibilitychange
  useEffect(() => {
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEYS.savedPlayers) return;
      if (e.newValue === null) {
        setSavedPlayers([]);
      } else {
        try {
          setSavedPlayers(JSON.parse(e.newValue));
        } catch {
          // ignore malformed JSON
        }
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setSavedPlayers(prev => {
          const stored = readSavedPlayers();
          const prevJson = JSON.stringify(prev);
          const storedJson = JSON.stringify(stored);
          return prevJson === storedJson ? prev : stored;
        });
      }
    };

    window.addEventListener('storage', handleStorageEvent);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const savePlayer = useCallback((player: Omit<SavedPlayer, 'savedAt'>): boolean => {
    let saved = false;
    setSavedPlayers(prev => {
      if (prev.length >= MAX_SAVED_PLAYERS) return prev;
      if (prev.some(p => p.id === player.id)) return prev;
      const entry: SavedPlayer = { ...player, savedAt: new Date().toISOString() };
      const updated = [...prev, entry];
      localStorage.setItem(STORAGE_KEYS.savedPlayers, JSON.stringify(updated));
      saved = true;
      return updated;
    });
    return saved;
  }, []);

  const removePlayer = useCallback((id: number) => {
    setSavedPlayers(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEYS.savedPlayers, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isSaved = useCallback((id: number) => {
    return savedPlayers.some(p => p.id === id);
  }, [savedPlayers]);

  const isFull = savedPlayers.length >= MAX_SAVED_PLAYERS;

  return { savedPlayers, savePlayer, removePlayer, isSaved, isFull };
}
