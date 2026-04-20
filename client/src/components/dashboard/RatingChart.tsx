import { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { LineChart as LineChartIcon, BarChart3 } from 'lucide-react';
import type { TournamentEntry } from '@shared/types';
import { COLORS } from '../../lib/constants';

interface ChartDataPoint {
  date: string;
  rating: number;
  tournament: string;
}

const HEBREW_MONTHS = [
  'ינו',
  'פבר',
  'מרץ',
  'אפר',
  'מאי',
  'יונ',
  'יול',
  'אוג',
  'ספט',
  'אוק',
  'נוב',
  'דצמ',
];

export function formatMonthYear(dateStr: string): string {
  const d = new Date(dateStr);
  return `${HEBREW_MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
}

export function buildChartData(
  tournaments: TournamentEntry[],
  currentRating: number,
): ChartDataPoint[] {
  const sorted = [...tournaments].sort((a, b) =>
    a.startDate.localeCompare(b.startDate),
  );

  // Calculate starting rating by subtracting all non-pending changes from current rating
  let startingRating = currentRating;
  for (const t of sorted) {
    if (!t.isPending) {
      startingRating -= t.ratingChange;
    }
  }

  // Walk forward, accumulating ratings
  let runningRating = startingRating;
  const points: ChartDataPoint[] = [];

  for (const t of sorted) {
    if (!t.isPending) {
      runningRating += t.ratingChange;
    }
    points.push({
      date: t.startDate,
      rating: Math.round(runningRating),
      tournament: t.tournamentName,
    });
  }

  return points;
}

function ChartTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as ChartDataPoint;
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-3 border border-gray-200 dark:border-gray-700">
      <div className="text-base font-bold text-gray-900 dark:text-gray-50">
        {data.rating}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {formatMonthYear(data.date)}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {data.tournament}
      </div>
    </div>
  );
}

interface RatingChartProps {
  tournaments: TournamentEntry[];
  currentRating: number;
}

export function RatingChart({ tournaments, currentRating }: RatingChartProps) {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const chartData = buildChartData(tournaments, currentRating);

  if (tournaments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          היסטוריית דירוג
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          אין נתוני טורנירים
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          היסטוריית דירוג
        </h2>
        <div className="flex gap-1">
          <button
            aria-label="תצוגת קו"
            onClick={() => setChartType('line')}
            className={
              chartType === 'line'
                ? 'text-primary bg-primary/10 rounded-lg p-2'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2'
            }
          >
            <LineChartIcon size={18} />
          </button>
          <button
            aria-label="תצוגת עמודות"
            onClick={() => setChartType('bar')}
            className={
              chartType === 'bar'
                ? 'text-primary bg-primary/10 rounded-lg p-2'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2'
            }
          >
            <BarChart3 size={18} />
          </button>
        </div>
      </div>

      {chartType === 'line' ? (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient
                id="ratingGradient"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={COLORS.primary}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={COLORS.primary}
                  stopOpacity={0}
                />
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
              className="text-gray-500"
            />
            <YAxis
              domain={['dataMin - 50', 'dataMax + 50']}
              tick={{ fontSize: 14 }}
              className="text-gray-500"
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="rating"
              stroke={COLORS.primary}
              fill="url(#ratingGradient)"
              strokeWidth={2}
              dot={{ fill: COLORS.primary, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
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
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="rating"
              fill={COLORS.primary}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
