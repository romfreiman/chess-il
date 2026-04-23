import { useState, useEffect, useCallback, useRef } from 'react';
import type { ApiResponse, ApiError } from '@shared/types';

interface UsePlayerResult {
  data: ApiResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function usePlayer(id: string): UsePlayerResult {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchPlayer = useCallback(async (force = false) => {
    if (!id) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const url = `/api/player/${id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) {
        const err: ApiError = await res.json();
        throw new Error(err.message);
      }

      const json: ApiResponse = await res.json();
      setData(json);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') {
        return; // Ignore aborted requests
      }
      setError(e instanceof Error ? e.message : '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPlayer();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlayer]);

  const refresh = useCallback(() => fetchPlayer(true), [fetchPlayer]);

  return { data, loading, error, refresh };
}
