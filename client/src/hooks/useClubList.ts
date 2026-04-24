import { useState, useEffect } from 'react';
import type { ClubInfo } from '@shared/types';

interface UseClubListResult {
  clubs: ClubInfo[];
  loading: boolean;
  error: string | null;
}

export function useClubList(): UseClubListResult {
  const [clubs, setClubs] = useState<ClubInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchClubs() {
      try {
        const res = await fetch('/api/clubs');

        if (!res.ok) {
          throw new Error('Failed to fetch clubs');
        }

        const data: ClubInfo[] = await res.json();

        if (!cancelled) {
          setClubs(data);
        }
      } catch {
        if (!cancelled) {
          setError('שגיאה בטעינת רשימת המועדונים');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchClubs();

    return () => {
      cancelled = true;
    };
  }, []);

  return { clubs, loading, error };
}
