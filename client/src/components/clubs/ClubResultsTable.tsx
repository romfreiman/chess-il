import { useRef, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { ClubSearchResult } from '../../../../packages/shared/types';

function calculateAge(birthYear: number | null): number | null {
  if (birthYear === null) return null;
  return new Date().getFullYear() - birthYear;
}

type SortKey = 'name' | 'id' | 'rating' | 'club' | 'age';
type SortDir = 'asc' | 'desc';

function sortResults(results: ClubSearchResult[], key: SortKey, dir: SortDir): ClubSearchResult[] {
  const sorted = [...results].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'name':
        cmp = a.name.localeCompare(b.name, 'he');
        break;
      case 'id':
        cmp = a.id - b.id;
        break;
      case 'rating': {
        const ra = a.rating ?? -1;
        const rb = b.rating ?? -1;
        cmp = ra - rb;
        break;
      }
      case 'club':
        cmp = a.club.localeCompare(b.club, 'he');
        break;
      case 'age': {
        const aa = calculateAge(a.birthYear) ?? 999;
        const ab = calculateAge(b.birthYear) ?? 999;
        cmp = aa - ab;
        break;
      }
    }
    return cmp;
  });
  return dir === 'desc' ? sorted.reverse() : sorted;
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronDown className="inline h-3 w-3 opacity-0 group-hover:opacity-40" />;
  return dir === 'asc'
    ? <ChevronUp className="inline h-3 w-3 text-primary" />
    : <ChevronDown className="inline h-3 w-3 text-primary" />;
}

interface ClubResultsTableProps {
  results: ClubSearchResult[];
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
}

export function ClubResultsTable({ results, selected, onToggle, onToggleAll }: ClubResultsTableProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const [sortKey, setSortKey] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = selected.size > 0 && selected.size < results.length;
    }
  }, [selected.size, results.length]);

  const sorted = useMemo(() => sortResults(results, sortKey, sortDir), [results, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'rating' ? 'desc' : 'asc');
    }
  };

  const thClass = 'text-xs font-bold text-gray-500 dark:text-gray-400 px-4 py-3 text-start cursor-pointer select-none group hover:text-gray-700 dark:hover:text-gray-200 transition-colors';

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
            <th className={thClass} onClick={() => handleSort('name')}>
              שם <SortIcon active={sortKey === 'name'} dir={sortDir} />
            </th>
            <th className={`${thClass} w-20`} onClick={() => handleSort('id')}>
              מס' שחקן <SortIcon active={sortKey === 'id'} dir={sortDir} />
            </th>
            <th className={`${thClass} w-16`} onClick={() => handleSort('rating')}>
              דירוג <SortIcon active={sortKey === 'rating'} dir={sortDir} />
            </th>
            <th className={thClass} onClick={() => handleSort('club')}>
              מועדון <SortIcon active={sortKey === 'club'} dir={sortDir} />
            </th>
            <th className={`${thClass} w-12`} onClick={() => handleSort('age')}>
              גיל <SortIcon active={sortKey === 'age'} dir={sortDir} />
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player) => (
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
