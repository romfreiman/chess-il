import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { ClubSearchResult } from '../../../../packages/shared/types';

function calculateAge(birthYear: number | null): number | null {
  if (birthYear === null) return null;
  return new Date().getFullYear() - birthYear;
}

interface ClubResultsTableProps {
  results: ClubSearchResult[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
}

export function ClubResultsTable({ results, selected, onToggle, onToggleAll }: ClubResultsTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selected.size > 0 && selected.size < results.length;
    }
  }, [selected.size, results.length]);

  return (
    <div className="hidden sm:block w-full bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700/50">
            <th className="w-10 px-4 py-3">
              <input
                type="checkbox"
                ref={selectAllRef}
                checked={selected.size === results.length && results.length > 0}
                onChange={onToggleAll}
                aria-label="בחר הכל"
                className="w-4 h-4 rounded accent-[#378ADD]"
              />
            </th>
            <th className="text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start">שם</th>
            <th className="text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start w-20">מס' שחקן</th>
            <th className="text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start w-16">דירוג</th>
            <th className="text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start">מועדון</th>
            <th className="text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start w-12">גיל</th>
          </tr>
        </thead>
        <tbody>
          {results.map((player) => (
            <tr
              key={player.id}
              className={
                selected.has(player.id)
                  ? 'bg-blue-50 dark:bg-blue-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
              }
            >
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <input
                  type="checkbox"
                  checked={selected.has(player.id)}
                  onChange={() => onToggle(player.id)}
                  aria-label={`בחר ${player.name}`}
                  className="w-4 h-4 rounded accent-[#378ADD]"
                />
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                <Link
                  to={`/player/${player.id}`}
                  className="text-sm font-bold text-primary hover:underline"
                >
                  {player.name}
                </Link>
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                {player.id}
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                {player.rating ?? '—'}
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                {player.club}
              </td>
              <td className="text-sm text-gray-700 dark:text-gray-300 px-4 py-3 border-t border-gray-100 dark:border-gray-700">
                {calculateAge(player.birthYear) ?? '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
