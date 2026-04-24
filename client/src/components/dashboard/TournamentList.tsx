import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { TournamentEntry } from '@shared/types';

const ITEMS_PER_PAGE = 10;

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = String(d.getFullYear()).slice(2);
  return `${dd}/${mm}/${yy}`;
}

function RatingChangeBadge({
  change,
  isPending,
  isFirst,
}: {
  change: number;
  isPending: boolean;
  isFirst: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {isFirst && (
        <span className="text-sm font-bold bg-primary/10 text-primary px-2 py-1 rounded-full">
          חדש
        </span>
      )}
      {isPending ? (
        <span className="text-sm font-bold bg-pending/10 text-pending px-2 py-1 rounded-full">
          בעדכון הבא
        </span>
      ) : change > 0 ? (
        <span className="inline-flex items-center gap-0.5 text-sm font-bold text-positive">
          <TrendingUp className="w-3.5 h-3.5" />+{change}
        </span>
      ) : change < 0 ? (
        <span className="inline-flex items-center gap-0.5 text-sm font-bold text-negative">
          <TrendingDown className="w-3.5 h-3.5" />{change}
        </span>
      ) : (
        <span className="text-sm font-bold text-gray-500 dark:text-gray-400">0</span>
      )}
    </span>
  );
}

function WDLChips({
  wins,
  draws,
  losses,
}: {
  wins: number;
  draws: number;
  losses: number;
}) {
  return (
    <div className="flex gap-1.5">
      <span className="text-xs font-bold bg-positive/10 text-positive px-1.5 py-0.5 rounded">
        {wins}
      </span>
      <span className="text-xs font-bold bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded">
        {draws}
      </span>
      <span className="text-xs font-bold bg-negative/10 text-negative px-1.5 py-0.5 rounded">
        {losses}
      </span>
    </div>
  );
}

interface TournamentListProps {
  tournaments: TournamentEntry[];
}

export function TournamentList({ tournaments }: TournamentListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when tournaments data changes (Pitfall 5)
  useEffect(() => {
    setCurrentPage(1);
  }, [tournaments]);

  if (tournaments.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50">
          תוצאות טורנירים
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          אין נתוני טורנירים
        </p>
      </div>
    );
  }

  const totalPages = Math.ceil(tournaments.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageItems = tournaments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function renderTournamentLink(t: TournamentEntry) {
    if (t.tournamentUrl) {
      return (
        <a
          href={t.tournamentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:underline"
        >
          {t.tournamentName}
        </a>
      );
    }
    return <span className="text-sm text-gray-600 dark:text-gray-400">{t.tournamentName}</span>;
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 p-4 pb-0">
          תוצאות טורנירים
        </h2>
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-sm font-bold text-gray-500 dark:text-gray-400 text-start p-4 pb-2">
                תאריך
              </th>
              <th className="text-sm font-bold text-gray-500 dark:text-gray-400 text-start p-4 pb-2">
                טורניר
              </th>
              <th className="text-sm font-bold text-gray-500 dark:text-gray-400 text-center p-4 pb-2">
                משחקים
              </th>
              <th className="text-sm font-bold text-gray-500 dark:text-gray-400 text-center p-4 pb-2">
                נ/ת/ה
              </th>
              <th className="text-sm font-bold text-gray-500 dark:text-gray-400 text-end p-4 pb-2">
                שינוי
              </th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((t, index) => (
              <tr
                key={`${t.startDate}-${t.tournamentName}`}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="text-sm text-gray-600 dark:text-gray-400 py-3 px-4">
                  {formatDate(t.startDate)}
                </td>
                <td className="py-3 px-4">
                  {renderTournamentLink(t)}
                </td>
                <td className="text-sm text-gray-600 dark:text-gray-400 py-3 px-4 text-center">
                  {t.games}
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex justify-center">
                    <WDLChips wins={t.wins} draws={t.draws} losses={t.losses} />
                  </div>
                </td>
                <td className="py-3 px-4 text-end">
                  <RatingChangeBadge
                    change={t.ratingChange}
                    isPending={t.isPending}
                    isFirst={startIndex + index === 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Desktop pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="text-sm text-primary hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
            >
              הקודם
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="text-sm text-primary hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
            >
              הבא
            </button>
          </div>
        )}
      </div>

      {/* Mobile cards */}
      <div className="block md:hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 p-4 pb-0">
          תוצאות טורנירים
        </h2>
        <div>
          {pageItems.map((t, index) => (
            <div
              key={`${t.startDate}-${t.tournamentName}-mobile`}
              className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
            >
              {/* Row 1: Tournament name + rating change */}
              <div className="flex items-center justify-between">
                {renderTournamentLink(t)}
                <RatingChangeBadge
                  change={t.ratingChange}
                  isPending={t.isPending}
                  isFirst={startIndex + index === 0}
                />
              </div>
              {/* Row 2: Date + W/D/L */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(t.startDate)}
                </span>
                <WDLChips wins={t.wins} draws={t.draws} losses={t.losses} />
              </div>
              {/* Row 3: Games count */}
              <div className="mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t.games} משחקים
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 p-4">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="text-sm text-primary hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
            >
              הקודם
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              עמוד {currentPage} מתוך {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="text-sm text-primary hover:underline disabled:text-gray-400 dark:disabled:text-gray-500 disabled:no-underline disabled:cursor-not-allowed"
            >
              הבא
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
