import { useState, useRef, useCallback } from 'react';
import type { ClubSearchResult } from '@shared/types';

interface UseClubSearchResult {
  results: ClubSearchResult[];
  loading: boolean;
  error: string | null;
  search: () => void;
}

export function useClubSearch(clubId: number | null, maxAge: number | null): UseClubSearchResult {
  const [results, setResults] = useState<ClubSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const search = useCallback(async () => {
    if (clubId === null) return;

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const params = new URLSearchParams();
      params.set('club', String(clubId));

      if (maxAge !== null) {
        params.set('minAge', '0');
        params.set('maxAge', String(maxAge));
      }

      const res = await fetch(`/api/clubs/search?${params.toString()}`, {
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error('Search request failed');
      }

      const data: ClubSearchResult[] = await res.json();
      setResults(data);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      setError('שגיאה בחיפוש');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [clubId, maxAge]);

  return { results, loading, error, search };
}
