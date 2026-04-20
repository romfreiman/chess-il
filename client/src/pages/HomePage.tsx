import { HeroSearch } from '../components/search/HeroSearch';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { EmptyState } from '../components/players/EmptyState';
import type { SavedPlayer } from '../lib/types';

export function HomePage() {
  // Phase 4 will wire this to localStorage via useSavedPlayers hook
  const savedPlayers: SavedPlayer[] = [];

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-12 mb-8">
        <HeroSearch />
      </div>
      {savedPlayers.length > 0 ? (
        <PlayerGrid players={savedPlayers} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
