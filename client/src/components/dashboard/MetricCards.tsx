import { TrendingUp, TrendingDown, Medal, Calendar, ArrowUpDown } from 'lucide-react';
import type { PlayerInfo, TournamentEntry } from '@shared/types';

interface MetricCardsProps {
  player: PlayerInfo;
  tournaments: TournamentEntry[];
}

export function MetricCards({ player, tournaments }: MetricCardsProps) {
  const confirmed = tournaments.filter((t) => !t.isPending);
  const cumulativeChange = confirmed.reduce((sum, t) => sum + t.ratingChange, 0);

  const oldestStartDate = tournaments.length > 0
    ? tournaments.reduce((oldest, t) => t.startDate < oldest ? t.startDate : oldest, tournaments[0].startDate)
    : null;
  const dateLabel = oldestStartDate
    ? `מאז ${oldestStartDate.split('-')[1]}/${oldestStartDate.split('-')[0]}`
    : null;

  const rounded = Math.round(cumulativeChange);

  const formattedChange =
    rounded > 0
      ? `+${rounded}`
      : rounded < 0
        ? String(rounded)
        : '0';

  const changeColorClass =
    cumulativeChange > 0
      ? 'text-positive'
      : cumulativeChange < 0
        ? 'text-negative'
        : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Current Rating */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <TrendingUp className="w-5 h-5 text-primary" />
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2">
          {player.rating}
        </div>
        {player.expectedRating !== null && (
          <div className={`text-sm ${
            player.expectedRating > player.rating
              ? 'text-positive'
              : player.expectedRating < player.rating
                ? 'text-negative'
                : 'text-gray-500 dark:text-gray-400'
          }`}>
            {'\u05E6\u05E4\u05D5\u05D9: '}{player.expectedRating}
          </div>
        )}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {'\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E0\u05D5\u05DB\u05D7\u05D9'}
        </div>
      </div>

      {/* National Rank */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <Medal className="w-5 h-5 text-primary" />
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2">
          {player.rank !== null ? `#${player.rank}` : '\u2014'}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {'\u05D3\u05D9\u05E8\u05D5\u05D2 \u05D0\u05E8\u05E6\u05D9'}
        </div>
      </div>

      {/* Tournament Count */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <Calendar className="w-5 h-5 text-primary" />
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-50 mt-2">
          {tournaments.length}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {'\u05D8\u05D5\u05E8\u05E0\u05D9\u05E8\u05D9\u05DD'}
        </div>
        {dateLabel && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {dateLabel}
          </div>
        )}
      </div>

      {/* Cumulative Change */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <ArrowUpDown className="w-5 h-5 text-primary" />
        <div className="flex items-center gap-1 mt-2">
          <span className={`text-2xl font-bold ${changeColorClass}`}>
            {formattedChange}
          </span>
          {cumulativeChange > 0 && (
            <TrendingUp className="w-3.5 h-3.5 text-positive" />
          )}
          {cumulativeChange < 0 && (
            <TrendingDown className="w-3.5 h-3.5 text-negative" />
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {'\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05E6\u05D8\u05D1\u05E8'}
        </div>
        {dateLabel && (
          <div className="text-xs text-gray-400 dark:text-gray-500">
            {dateLabel}
          </div>
        )}
      </div>
    </div>
  );
}
