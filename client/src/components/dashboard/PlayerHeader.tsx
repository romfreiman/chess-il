import { RefreshCw, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import type { PlayerInfo } from '@shared/types';

interface PlayerHeaderProps {
  player: PlayerInfo;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isSaved: boolean;
  isFull: boolean;
  onSave: () => void;
  onUnsave: () => void;
}

export function PlayerHeader({ player, onRefresh, isRefreshing, isSaved, isFull, onSave, onUnsave }: PlayerHeaderProps) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      {/* Action buttons - top end corner (RTL-safe) */}
      <div className="absolute top-4 end-4 flex gap-2">
        <button
          onClick={isSaved ? onUnsave : onSave}
          aria-label={isSaved ? 'הסר שמירה' : 'שמור שחקן'}
          className={
            isSaved
              ? 'text-primary transition-colors'
              : isFull
                ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed transition-colors'
                : 'text-gray-400 hover:text-primary transition-colors'
          }
        >
          {isSaved ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
        </button>
        <button
          onClick={onRefresh}
          aria-label="רענן נתונים"
          className="text-gray-400 hover:text-primary transition-colors"
        >
          <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Line 1: Name + ID + grade badge */}
      <div className="flex items-center flex-wrap gap-3 pe-14">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {player.name}
        </h1>
        <span className="text-sm text-gray-400 dark:text-gray-500">
          #{player.id}
        </span>
        <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-full whitespace-nowrap shrink-0">
          {player.grade}
        </span>
      </div>

      {/* Line 2: Club + birth year */}
      <div className="flex items-center flex-wrap gap-3 mt-1">
        {player.club && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {player.club}
          </span>
        )}
        {player.birthYear !== null && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            שנת לידה: {player.birthYear}
          </span>
        )}
      </div>

      {/* Line 3: External links */}
      <div className="flex items-center gap-4 mt-2">
        <a
          href={`https://www.chess.org.il/Players/Player.aspx?Id=${player.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          chess.org.il
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        {player.fideId !== null && (
          <a
            href={`https://ratings.fide.com/profile/${player.fideId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            FIDE
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
