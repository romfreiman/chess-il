import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { COLORS } from '../../lib/constants';

const DONUT_COLORS = [COLORS.positive, '#9CA3AF', COLORS.negative];
const LABELS = ['ניצחונות', 'תיקו', 'הפסדים'];

interface WinLossChartProps {
  wins: number;
  draws: number;
  losses: number;
}

export function WinLossChart({ wins, draws, losses }: WinLossChartProps) {
  const data = [
    { name: 'ניצחונות', value: wins },
    { name: 'תיקו', value: draws },
    { name: 'הפסדים', value: losses },
  ];
  const total = wins + draws + losses;

  if (total === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          ניצחונות / תיקו / הפסדים
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          אין נתוני טורנירים
        </p>
      </div>
    );
  }

  const values = [wins, draws, losses];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
        ניצחונות / תיקו / הפסדים
      </h2>

      <div className="relative">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={DONUT_COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900 dark:text-gray-50">
            {total}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-6 mt-4">
        {LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: DONUT_COLORS[i] }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {label} {total > 0 ? Math.round((values[i] / total) * 100) : 0}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
