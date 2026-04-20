import { RefreshCw, ExternalLink } from 'lucide-react';
import type { PlayerInfo } from '@shared/types';

interface PlayerHeaderProps {
  player: PlayerInfo;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function PlayerHeader({ player, onRefresh, isRefreshing }: PlayerHeaderProps) {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      {/* Refresh button - top end corner (RTL-safe) */}
      <button
        onClick={onRefresh}
        aria-label={'\u05E8\u05E2\u05E0\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD'}
        className="absolute top-4 end-4 text-gray-400 hover:text-primary transition-colors"
      >
        <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>

      {/* Line 1: Name + grade badge */}
      <div className="flex items-center flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
          {player.name}
        </h1>
        <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
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
            {'\u05E9\u05E0\u05EA \u05DC\u05D9\u05D3\u05D4: '}{player.birthYear}
          </span>
        )}
      </div>

      {/* Line 3: FIDE link (only if fideId exists) */}
      {player.fideId !== null && (
        <div className="mt-2">
          <a
            href={`https://ratings.fide.com/profile/${player.fideId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            FIDE
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
