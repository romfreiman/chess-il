import type { SearchResult } from '@shared/types';
import { COLORS } from '../../lib/constants';

interface SearchResultsProps {
  results: SearchResult[];
  loading: boolean;
  visible: boolean;
  onSelect: (id: number) => void;
}

export function SearchResults({ results, loading, visible, onSelect }: SearchResultsProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10 max-h-64 overflow-y-auto">
      <div className="px-3 py-1 text-sm text-gray-500">
        {"\u05EA\u05D5\u05E6\u05D0\u05D5\u05EA \u05D7\u05D9\u05E4\u05D5\u05E9"}
      </div>
      {loading && (
        <div className="px-3 py-3 text-sm text-gray-500 text-center">
          {"\u05DE\u05D7\u05E4\u05E9..."}
        </div>
      )}
      {!loading && results.length === 0 && (
        <div className="px-3 py-3 text-sm text-gray-500 text-center">
          {"\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0\u05D5 \u05EA\u05D5\u05E6\u05D0\u05D5\u05EA"}
        </div>
      )}
      {!loading && results.map((result) => (
        <button
          key={result.id}
          type="button"
          onClick={() => onSelect(result.id)}
          className="w-full text-start px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-center"
        >
          <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
            {result.name}
          </span>
          <span className="flex gap-2 items-center">
            <span className="text-xs text-gray-500">#{result.id}</span>
            {result.rating != null && (
              <span className="text-xs" style={{ color: COLORS.primary }}>
                {result.rating}
              </span>
            )}
            {result.club && (
              <span className="text-xs text-gray-400">{result.club}</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
