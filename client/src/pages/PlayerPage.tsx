import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import { useSavedPlayersContext } from '../context/SavedPlayersContext';
import { PlayerHeader } from '../components/dashboard/PlayerHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RatingChart } from '../components/dashboard/RatingChart';
import { WinLossChart } from '../components/dashboard/WinLossChart';
import { TournamentList } from '../components/dashboard/TournamentList';
import { Toast } from '../components/feedback/Toast';
import { PlayerHeaderSkeleton } from '../components/dashboard/skeletons/PlayerHeaderSkeleton';
import { MetricCardsSkeleton } from '../components/dashboard/skeletons/MetricCardsSkeleton';
import { RatingChartSkeleton } from '../components/dashboard/skeletons/RatingChartSkeleton';
import { WinLossChartSkeleton } from '../components/dashboard/skeletons/WinLossChartSkeleton';
import { TournamentListSkeleton } from '../components/dashboard/skeletons/TournamentListSkeleton';
import { ErrorState } from '../components/feedback/ErrorState';

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = usePlayer(id || '');
  const { isSaved, isFull, savePlayer, removePlayer } = useSavedPlayersContext();
  const [showToast, setShowToast] = useState(false);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <PlayerHeaderSkeleton />
        <MetricCardsSkeleton />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-[65%]">
            <RatingChartSkeleton />
          </div>
          <div className="w-full md:w-[35%]">
            <WinLossChartSkeleton />
          </div>
        </div>
        <TournamentListSkeleton />
      </div>
    );
  }

  if (error) {
    const errorType = error.toLowerCase().includes('not found') || error.includes('\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0')
      ? 'not-found' as const
      : 'network' as const;
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <ErrorState errorType={errorType} onRetry={refresh} />
      </div>
    );
  }

  if (!data) return null;

  const handleSave = () => {
    if (isFull) {
      setShowToast(true);
      return;
    }
    savePlayer({
      id: data.player.id,
      name: data.player.name,
      rating: data.player.rating,
      club: data.player.club,
    });
  };

  const handleUnsave = () => {
    removePlayer(data.player.id);
  };

  const totalWins = data.tournaments.reduce((sum, t) => sum + t.wins, 0);
  const totalDraws = data.tournaments.reduce((sum, t) => sum + t.draws, 0);
  const totalLosses = data.tournaments.reduce((sum, t) => sum + t.losses, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <PlayerHeader
        player={data.player}
        onRefresh={refresh}
        isRefreshing={loading}
        isSaved={isSaved(data.player.id)}
        isFull={isFull}
        onSave={handleSave}
        onUnsave={handleUnsave}
      />
      <MetricCards player={data.player} tournaments={data.tournaments} />
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-[65%]">
          <RatingChart tournaments={data.tournaments} currentRating={data.player.rating} />
        </div>
        <div className="w-full md:w-[35%]">
          <WinLossChart wins={totalWins} draws={totalDraws} losses={totalLosses} />
        </div>
      </div>
      <TournamentList tournaments={data.tournaments} />
      <Toast
        message="ניתן לשמור עד 10 שחקנים"
        visible={showToast}
        onDismiss={() => setShowToast(false)}
      />
    </div>
  );
}
