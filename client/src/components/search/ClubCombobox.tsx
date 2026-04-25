import { useState, useRef, useEffect } from 'react';
import type { ClubInfo } from '@shared/types';

interface ClubComboboxProps {
  clubs: ClubInfo[];
  value: ClubInfo | null;
  onChange: (club: ClubInfo | null) => void;
}

export function ClubCombobox({ clubs, value, onChange }: ClubComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Sync input text with selected value
  useEffect(() => {
    if (value) {
      setQuery(value.name);
    }
  }, [value]);

  const filtered = query && value?.name !== query
    ? clubs.filter((c) => c.name.includes(query))
    : clubs;

  const handleInputChange = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    setActiveIndex(-1);

    if (text === '') {
      onChange(null);
    }
  };

  const handleSelect = (club: ClubInfo) => {
    onChange(club);
    setQuery(club.name);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown item to register
    blurTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveIndex(-1);
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) =>
          prev < filtered.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex-1 relative">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        {'מועדון'}
      </label>
      <input
        type="text"
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls="club-listbox"
        aria-activedescendant={
          activeIndex >= 0 ? `club-option-${activeIndex}` : undefined
        }
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={'הקלידו שם מועדון'}
        className="w-full px-3 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400 text-base text-start focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      {isOpen && (
        <div
          ref={listboxRef}
          id="club-listbox"
          role="listbox"
          className="absolute inset-x-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10 max-h-64 overflow-y-auto"
        >
          {filtered.length === 0 && (
            <div className="px-3 py-3 text-sm text-gray-500 text-center">
              {'לא נמצאו מועדונים'}
            </div>
          )}
          {filtered.map((club, idx) => (
            <button
              key={club.id}
              id={`club-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              type="button"
              onMouseDown={(e) => {
                // Prevent blur from firing before click
                e.preventDefault();
              }}
              onClick={() => handleSelect(club)}
              className={`w-full text-start px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm ${
                idx === activeIndex
                  ? 'bg-gray-100 dark:bg-gray-700 font-bold'
                  : ''
              }`}
            >
              {club.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
