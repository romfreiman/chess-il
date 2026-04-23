import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import type { SavedPlayer } from '../../lib/types';

interface PlayerCardProps {
  player: SavedPlayer;
  onRemove?: (id: number) => void;
}

export function PlayerCard({ player, onRemove }: PlayerCardProps) {
  return (
    <Link
      to={`/player/${player.id}`}
      className="relative block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent hover:border-primary transition-colors duration-150 min-h-[80px]"
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
