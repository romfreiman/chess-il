import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ClubSearchResult } from '../../../../packages/shared/types';

function calculateAge(birthYear: number | null): number | null {
  if (birthYear === null) return null;
  return new Date().getFullYear() - birthYear;
}

interface ClubResultsCardsProps {
  results: ClubSearchResult[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
}

export function ClubResultsCards({ results, selected, onToggle, onToggleAll }: ClubResultsCardsProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selected.size > 0 && selected.size < results.length;
    }
  }, [selected.size, results.length]);

  return (
    <div className="sm:hidden">
      {/* Select-all row */}
      <div className="flex items-center gap-2 py-2 px-1 mb-3">
        <input
          type="checkbox"
          ref={selectAllRef}
          checked={selected.size === results.length && results.length > 0}
          onChange={onToggleAll}
          aria-label="בחר הכל"
          className="w-4 h-4 rounded accent-[#378ADD]"
        />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          בחר הכל ({results.length})
        </span>
      </div>

      {/* Player cards */}
      <div className="space-y-3">
        {results.map((player) => (
          <div
            key={player.id}
            className={`p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors duration-150 ${
              selected.has(player.id)
                ? 'border-[#378ADD] ring-1 ring-[#378ADD] bg-blue-50 dark:bg-blue-900/20'
                : 'border-transparent'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={selected.has(player.id)}
                onChange={() => onToggle(player.id)}
                aria-label={`בחר ${player.name}`}
                className="w-4 h-4 mt-1 rounded accent-[#378ADD]"
              />
              <div className="flex-1">
                <Link
                  to={`/player/${player.id}`}
                  className="text-base font-bold text-primary hover:underline"
                >
                  {player.name}
                </Link>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  דירוג: {player.rating ?? '—'} | גיל: {calculateAge(player.birthYear) ?? '—'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {player.club}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
