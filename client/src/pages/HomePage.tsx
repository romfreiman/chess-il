import { HeroSearch } from '../components/search/HeroSearch';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { EmptyState } from '../components/players/EmptyState';
import { useSavedPlayersContext } from '../context/SavedPlayersContext';

export function HomePage() {
  const { savedPlayers, removePlayer } = useSavedPlayersContext();

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-12 mb-8">
        <HeroSearch />
      </div>
      {savedPlayers.length > 0 ? (
        <PlayerGrid players={savedPlayers} onRemove={removePlayer} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
