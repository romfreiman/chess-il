import { useState, useRef, useEffect } from 'react';
import type { ClubInfo } from '@shared/types';

interface ClubMultiComboboxProps {
  clubs: ClubInfo[];
  selected: ClubInfo[];
  onChange: (clubs: ClubInfo[]) => void;
  maxSelect?: number;
}

export function ClubMultiCombobox({ clubs, selected, onChange, maxSelect = 5 }: ClubMultiComboboxProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedIds = new Set(selected.map((c) => c.id));
  const filtered = clubs.filter(
    (c) => !selectedIds.has(c.id) && c.name.includes(query)
  );

  const handleAdd = (club: ClubInfo) => {
    if (selected.length >= maxSelect) return;
    onChange([...selected, club]);
    setQuery('');
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleRemove = (clubId: number) => {
    onChange(selected.filter((c) => c.id !== clubId));
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleBlur = () => {
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
          handleAdd(filtered[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  useEffect(() => {
    if (activeIndex >= 0 && listboxRef.current) {
      const activeEl = listboxRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  return (
    <div className="flex-1 min-w-[280px] relative">
      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
        {'מועדונים'}
      </label>
      <div
        className="min-h-[48px] px-2 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 flex flex-wrap gap-1 items-center cursor-text focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent"
        onClick={() => {
          handleFocus();
          inputRef.current?.focus();
        }}
      >
        {selected.map((club) => (
          <span
            key={club.id}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 rounded-lg text-sm"
          >
            {club.name}
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(club.id);
              }}
              className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
            >
              {'\u00D7'}
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? 'הקלידו שם מועדון...' : ''}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-base text-start dark:text-gray-100 dark:placeholder-gray-400"
        />
      </div>
      {isOpen && filtered.length > 0 && selected.length < maxSelect && (
        <div
          ref={listboxRef}
          id="club-multi-listbox"
          role="listbox"
          className="absolute inset-x-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 z-10 max-h-64 overflow-y-auto"
        >
          {filtered.map((club, idx) => (
            <button
              key={club.id}
              id={`club-multi-option-${idx}`}
              role="option"
              aria-selected={idx === activeIndex}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleAdd(club)}
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
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        {selected.length < maxSelect
          ? `${selected.length}/${maxSelect} מועדונים נבחרו`
          : null}
      </p>
      {selected.length >= maxSelect && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
          {'מקסימום'} {maxSelect} {'מועדונים!'}
        </p>
      )}
    </div>
  );
}
