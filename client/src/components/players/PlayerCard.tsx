import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { SavedPlayer } from '../../lib/types';

interface PlayerCardProps {
  player: SavedPlayer;
  onRemove?: (id: number) => void;
  isSelected?: boolean;
  onToggleSelect?: (id: number) => void;
  selectionDisabled?: boolean;
}

export function PlayerCard({ player, onRemove, isSelected, onToggleSelect, selectionDisabled }: PlayerCardProps) {
  return (
    <Link
      to={`/player/${player.id}`}
      className={`relative block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border transition-colors duration-150 min-h-[80px] ${
        isSelected ? 'border-[#378ADD] ring-1 ring-[#378ADD]' : 'border-transparent hover:border-primary'
      }`}
    >
      {onRemove && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(player.id);
          }}
          aria-label="הסר שחקן"
          className="absolute top-3 end-3 text-gray-400 hover:text-negative transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-center gap-2">
        {onToggleSelect && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!(selectionDisabled && !isSelected)) {
                onToggleSelect(player.id);
              }
            }}
            disabled={selectionDisabled && !isSelected}
            aria-label={`בחר ${player.name} להשוואה`}
            className={`flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200 ${
              isSelected
                ? 'bg-[#378ADD] border-[#378ADD]'
                : 'border-gray-300 dark:border-gray-600 hover:border-[#378ADD]'
            } ${selectionDisabled && !isSelected ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            {isSelected && (
              <svg className="w-full h-full text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}
        <span className="text-base font-bold text-gray-900 dark:text-gray-50">
          {player.name}
        </span>
        <span
          className="text-xs text-gray-400 dark:text-gray-500 select-all cursor-text"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          {player.id}
        </span>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        דירוג נוכחי: {player.rating}
      </div>

      {player.club && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {player.club}
        </div>
      )}
    </Link>
  );
}
