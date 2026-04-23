import { useState } from 'react';
import { usePlayer } from '../hooks/usePlayer';
import { useSavedPlayersContext } from '../context/SavedPlayersContext';
import { PlayerPicker } from '../components/compare/PlayerPicker';
import { CompareHeader } from '../components/compare/CompareHeader';
import { CompareChart } from '../components/compare/CompareChart';
import { RatingChartSkeleton } from '../components/dashboard/skeletons/RatingChartSkeleton';
import { buildChartData } from '../components/dashboard/RatingChart';
import type { ApiResponse, RatingHistoryEntry } from '@shared/types';

function resolveChartData(data: ApiResponse): RatingHistoryEntry[] {
  if (data.ratingHistory && data.ratingHistory.length > 0) {
    return data.ratingHistory;
  }
  // Fallback: compute from tournaments
  const computed = buildChartData(data.tournaments, data.player.rating);
  return computed.map(p => ({ date: p.date, rating: p.rating }));
}

export function ComparePage() {
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');
  const playerA = usePlayer(selectedA);
  const playerB = usePlayer(selectedB);
  const { savedPlayers, isSaved, isFull, savePlayer, removePlayer } = useSavedPlayersContext();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Page heading */}
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">
        {'\u05D4\u05E9\u05D5\u05D5\u05D0\u05EA \u05E9\u05D7\u05E7\u05E0\u05D9\u05DD'}
      </h1>

      {/* Guard: not enough saved players */}
      {savedPlayers.length < 2 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {savedPlayers.length === 0
              ? '\u05D0\u05D9\u05DF \u05E9\u05D7\u05E7\u05E0\u05D9\u05DD \u05E9\u05DE\u05D5\u05E8\u05D9\u05DD. \u05E9\u05DE\u05E8\u05D5 \u05DC\u05E4\u05D7\u05D5\u05EA 2 \u05E9\u05D7\u05E7\u05E0\u05D9\u05DD \u05DE\u05D3\u05E4\u05D9 \u05D4\u05E9\u05D7\u05E7\u05E0\u05D9\u05DD \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E9\u05D5\u05D5\u05EA.'
              : '\u05E9\u05DE\u05E8\u05D5 \u05E2\u05D5\u05D3 \u05E9\u05D7\u05E7\u05DF \u05D0\u05D7\u05D3 \u05DB\u05D3\u05D9 \u05DC\u05D4\u05E9\u05D5\u05D5\u05EA'}
          </p>
        </div>
      ) : (
        <>
          {/* Pickers row -- desktop: side by side, mobile: stacked */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlayerPicker
              label={'\u05E9\u05D7\u05E7\u05DF A'}
              selectedId={selectedA}
              excludeId={selectedB}
              savedPlayers={savedPlayers}
              onChange={setSelectedA}
            />
            <PlayerPicker
              label={'\u05E9\u05D7\u05E7\u05DF B'}
              selectedId={selectedB}
              excludeId={selectedA}
              savedPlayers={savedPlayers}
              onChange={setSelectedB}
            />
          </div>

          {/* CompareHeader: headers + metrics in columns/tabs */}
          {(selectedA || selectedB) && (
            <CompareHeader
              playerAData={playerA.data}
              playerALoading={playerA.loading}
              playerAError={playerA.error}
              playerARefresh={playerA.refresh}
              playerBData={playerB.data}
              playerBLoading={playerB.loading}
              playerBError={playerB.error}
              playerBRefresh={playerB.refresh}
              isSaved={isSaved}
              isFull={isFull}
              onSave={(p) => savePlayer(p)}
              onUnsave={(id) => removePlayer(id)}
              selectedA={selectedA}
              selectedB={selectedB}
            />
          )}

          {/* Combined chart -- only when both selected */}
          {selectedA && selectedB && (
            playerA.loading || playerB.loading ? (
              <RatingChartSkeleton />
            ) : playerA.data && playerB.data ? (
              <CompareChart
                playerAName={playerA.data.player.name}
                playerBName={playerB.data.player.name}
                dataA={resolveChartData(playerA.data)}
                dataB={resolveChartData(playerB.data)}
              />
            ) : null
          )}
        </>
      )}
    </div>
  );
}
