import type { RecentSearch } from '../../hooks/useRecentSearches';

interface RecentSuggestionsProps {
  suggestions: RecentSearch[];
  onSelect: (id: string) => void;
  visible: boolean;
}

export function RecentSuggestions({ suggestions, onSelect, visible }: RecentSuggestionsProps) {
  if (!visible || suggestions.length === 0) return null;

  return (
    <div className="absolute inset-x-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10">
      <div className="px-3 py-1 text-sm text-gray-500">חיפושים אחרונים</div>
      {suggestions.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onSelect(s.id)}
          className="w-full text-start px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
        >
          {s.id}
        </button>
      ))}
    </div>
  );
}
