import { useParams } from 'react-router-dom';
import { usePlayer } from '../hooks/usePlayer';
import { PlayerHeader } from '../components/dashboard/PlayerHeader';
import { MetricCards } from '../components/dashboard/MetricCards';
import { RatingChart } from '../components/dashboard/RatingChart';
import { WinLossChart } from '../components/dashboard/WinLossChart';
import { TournamentList } from '../components/dashboard/TournamentList';

export function PlayerPage() {
  const { id } = useParams<{ id: string }>();
  const { data, loading, error, refresh } = usePlayer(id || '');

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">טוען נתוני שחקן...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          לא הצלחנו לטעון את נתוני השחקן. נסו שוב מאוחר יותר.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const totalWins = data.tournaments.reduce((sum, t) => sum + t.wins, 0);
  const totalDraws = data.tournaments.reduce((sum, t) => sum + t.draws, 0);
  const totalLosses = data.tournaments.reduce((sum, t) => sum + t.losses, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <PlayerHeader player={data.player} onRefresh={refresh} isRefreshing={loading} />
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
    </div>
  );
}
