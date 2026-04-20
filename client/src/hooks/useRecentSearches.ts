import { useState, useCallback } from 'react';
import { STORAGE_KEYS, MAX_RECENT_SEARCHES } from '../lib/constants';

export interface RecentSearch {
  id: string;
  timestamp: number;
}

export function useRecentSearches() {
  const [searches, setSearches] = useState<RecentSearch[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.recentSearches);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const addSearch = useCallback((id: string) => {
    setSearches(prev => {
      const filtered = prev.filter(s => s.id !== id);
      const updated = [{ id, timestamp: Date.now() }, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(STORAGE_KEYS.recentSearches, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearSearches = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.recentSearches);
    setSearches([]);
  }, []);

  return { searches, addSearch, clearSearches };
}
