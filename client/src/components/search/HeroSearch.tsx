import { useState, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { RecentSuggestions } from './RecentSuggestions';
import { SearchResults } from './SearchResults';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { usePlayerSearch } from '../../hooks/usePlayerSearch';

export function HeroSearch() {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const { searches, addSearch } = useRecentSearches();
  const containerRef = useRef<HTMLDivElement>(null);

  const isIdMode = /^\d+$/.test(query);
  const isNameMode = query.length > 0 && !isIdMode;
  const isValid = isIdMode && parseInt(query, 10) > 0;

  const { results, loading: searchLoading } = usePlayerSearch(query);

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

  const handleSearchSelect = (id: number) => {
    const idStr = String(id);
    setQuery(idStr);
    setShowSuggestions(false);
    addSearch(idStr);
    navigate(`/player/${id}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => {
            // Delay to allow click on suggestion
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          placeholder={"\u05D7\u05E4\u05E9\u05D5 \u05DC\u05E4\u05D9 \u05E9\u05DD \u05D0\u05D5 \u05DE\u05E1\u05E4\u05E8 \u05E9\u05D7\u05E7\u05DF"}
          className="flex-1 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 text-lg text-start focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="submit"
          disabled={!isValid}
          className="px-6 py-3 rounded-xl bg-primary text-white font-normal disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          {"\u05D7\u05E4\u05E9"}
        </button>
      </form>
      <SearchResults
        results={results}
        loading={searchLoading}
        visible={isNameMode && showSuggestions}
        onSelect={handleSearchSelect}
      />
      <RecentSuggestions
        suggestions={searches}
        onSelect={handleSelect}
        visible={showSuggestions && query === ''}
      />
    </div>
  );
}
