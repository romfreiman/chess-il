import { useState, useEffect, useRef } from 'react';
import type { SearchResult } from '@shared/types';

interface UsePlayerSearchResult {
  results: SearchResult[];
  loading: boolean;
  error: string | null;
}

export function usePlayerSearch(query: string): UsePlayerSearchResult {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If query is empty, pure digits (ID mode), or too short, return empty results
    if (!query || /^\d+$/.test(query) || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Debounce: wait 300ms before fetching
    const timer = setTimeout(async () => {
      // Abort any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/player/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          throw new Error('Search request failed');
        }

        const data: SearchResult[] = await res.json();
        setResults(data);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          return; // Ignore aborted requests
        }
        setError(e instanceof Error ? e.message : '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D7\u05D9\u05E4\u05D5\u05E9');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query]);

  return { results, loading, error };
}
