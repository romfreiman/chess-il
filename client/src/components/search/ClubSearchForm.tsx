import { useState, FormEvent } from 'react';
import { Search } from 'lucide-react';
import type { ClubInfo } from '@shared/types';
import { ClubCombobox } from './ClubCombobox';

interface ClubSearchFormProps {
  clubs: ClubInfo[];
  clubsLoading: boolean;
  onSearch: (clubId: number, maxAge: number | null) => void;
}

export function ClubSearchForm({ clubs, clubsLoading, onSearch }: ClubSearchFormProps) {
  const [selectedClub, setSelectedClub] = useState<ClubInfo | null>(null);
  const [maxAge, setMaxAge] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClub) return;
    onSearch(selectedClub.id, maxAge ? parseInt(maxAge, 10) : null);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 mb-6">
      {/* Desktop layout: single row */}
      <div className="hidden sm:flex items-end gap-3">
        <ClubCombobox
          clubs={clubs}
          value={selectedClub}
          onChange={setSelectedClub}
        />
        <div>
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
            {'עד גיל'}
          </label>
          <input
            type="number"
            min="1"
            max="99"
            value={maxAge}
            onChange={(e) => setMaxAge(e.target.value)}
            placeholder="14"
            className="w-20 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 text-base text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={selectedClub === null || clubsLoading}
          className="px-6 py-3 rounded-xl bg-primary text-white font-normal text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Search className="h-5 w-5" />
          {'חיפוש'}
        </button>
      </div>

      {/* Mobile layout: stacked */}
      <div className="sm:hidden flex flex-col gap-4">
        <ClubCombobox
          clubs={clubs}
          value={selectedClub}
          onChange={setSelectedClub}
        />
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              {'עד גיל'}
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
              placeholder="14"
              className="w-20 px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 text-base text-center focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={selectedClub === null || clubsLoading}
            className="px-6 py-3 rounded-xl bg-primary text-white font-normal text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            {'חיפוש'}
          </button>
        </div>
      </div>
    </form>
  );
}
