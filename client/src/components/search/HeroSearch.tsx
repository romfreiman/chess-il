import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RecentSuggestions } from './RecentSuggestions';
import { useRecentSearches } from '../../hooks/useRecentSearches';

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { searches, addSearch } = useRecentSearches();
  const containerRef = useRef<HTMLDivElement>(null);

  const isValid = /^\d+$/.test(query) && parseInt(query, 10) > 0;
  const hasNonNumeric = query.length > 0 && !/^\d+$/.test(query);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    addSearch(query);
    navigate(`/player/${query}`);
  };

  const handleSelect = (id: string) => {
    setQuery(id);
    setShowSuggestions(false);
    addSearch(id);
    navigate(`/player/${id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          inputMode="numeric"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder="הזינו מספר שחקן"
          className="flex-1 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 text-lg text-start focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-3 rounded-xl bg-primary text-white font-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          חפש
        </button>
      </form>
      {hasNonNumeric && (
        <p className="text-sm text-red-500 dark:text-red-400 mt-2 text-start" role="alert">
          מספר שחקן חייב להכיל ספרות בלבד
        </p>
      )}
      <RecentSuggestions
        suggestions={searches}
        onSelect={handleSelect}
        visible={showSuggestions && query === ''}
      />
    </div>
  );
}
