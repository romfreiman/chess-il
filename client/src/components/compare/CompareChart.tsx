import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { RatingHistoryEntry } from '@shared/types';
import { COLORS } from '../../lib/constants';
import { formatMonthYear } from '../dashboard/RatingChart';

export interface CompareChartPoint {
  date: string;
  ratingA: number | null;
  ratingB: number | null;
}

export function mergeRatingHistories(
  historyA: RatingHistoryEntry[],
  historyB: RatingHistoryEntry[],
): CompareChartPoint[] {
  const dateMap = new Map<string, CompareChartPoint>();

  for (const entry of historyA) {
    dateMap.set(entry.date, { date: entry.date, ratingA: entry.rating, ratingB: null });
  }
  for (const entry of historyB) {
    const existing = dateMap.get(entry.date);
    if (existing) {
      existing.ratingB = entry.rating;
    } else {
      dateMap.set(entry.date, { date: entry.date, ratingA: null, ratingB: entry.rating });
    }
  }

  return [...dateMap.values()].sort((a, b) => a.date.localeCompare(b.date));
}

interface CompareChartTooltipProps {
  active?: boolean;
  payload?: any[];
  playerAName: string;
  playerBName: string;
}

function CompareChartTooltip({ active, payload, playerAName, playerBName }: CompareChartTooltipProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as CompareChartPoint;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
        {formatMonthYear(point.date)}
      </div>
      {point.ratingA !== null && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{playerAName}</span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-50 ms-auto">{point.ratingA}</span>
        </div>
      )}
      {point.ratingB !== null && (
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
          <span className="text-sm text-gray-600 dark:text-gray-400">{playerBName}</span>
          <span className="text-base font-bold text-gray-900 dark:text-gray-50 ms-auto">{point.ratingB}</span>
        </div>
      )}
    </div>
  );
}

interface CompareChartProps {
  playerAName: string;
  playerBName: string;
  dataA: RatingHistoryEntry[];
  dataB: RatingHistoryEntry[];
}

export function CompareChart({ playerAName, playerBName, dataA, dataB }: CompareChartProps) {
  const mergedData = mergeRatingHistories(dataA, dataB);

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4"
      aria-label={`השוואת דירוג בין ${playerAName} ל${playerBName}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          השוואת דירוג
        </h2>
        <div className="flex justify-end gap-4 mb-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS.primary }} />
            <span className="text-sm">{playerAName}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#A855F7' }} />
            <span className="text-sm">{playerBName}</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={mergedData}>
          <defs>
            <linearGradient id="ratingGradientA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.2} />
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ratingGradientB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#A855F7" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#A855F7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            className="stroke-gray-200 dark:stroke-gray-700"
          />
          <XAxis
            dataKey="date"
            tickFormatter={formatMonthYear}
            tick={{ fontSize: 14 }}
          />
          <YAxis
            domain={['dataMin - 50', 'dataMax + 50']}
            tick={{ fontSize: 14 }}
          />
          <Tooltip
            content={
              <CompareChartTooltip
                playerAName={playerAName}
                playerBName={playerBName}
              />
            }
          />
          <Area
            type="monotone"
            dataKey="ratingA"
            stroke={COLORS.primary}
            fill="url(#ratingGradientA)"
            strokeWidth={2}
            dot={{ fill: COLORS.primary, r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
          <Area
            type="monotone"
            dataKey="ratingB"
            stroke="#A855F7"
            fill="url(#ratingGradientB)"
            strokeWidth={2}
            dot={{ fill: '#A855F7', r: 4 }}
            activeDot={{ r: 6 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
