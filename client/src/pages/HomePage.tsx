import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroSearch } from '../components/search/HeroSearch';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { EmptyState } from '../components/players/EmptyState';
import { useSavedPlayersContext } from '../context/SavedPlayersContext';

export function HomePage() {
  const { savedPlayers, removePlayer } = useSavedPlayersContext();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  // Clear selected IDs that are no longer in savedPlayers
  useEffect(() => {
    const playerIds = new Set(savedPlayers.map((p) => p.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => playerIds.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [savedPlayers]);

  const handleToggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCompare = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length === 2) {
      navigate(`/compare?a=${ids[0]}&b=${ids[1]}`);
    }
  }, [selectedIds, navigate]);

  const showCompareMode = savedPlayers.length >= 2;

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-12 mb-8">
        <HeroSearch />
      </div>
      {savedPlayers.length > 0 ? (
        <PlayerGrid
          players={savedPlayers}
          onRemove={removePlayer}
          selectedIds={showCompareMode ? selectedIds : undefined}
          onToggleSelect={showCompareMode ? handleToggleSelect : undefined}
        />
      ) : (
        <EmptyState />
      )}
      {selectedIds.size === 2 && (
        <button
          onClick={handleCompare}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#378ADD] text-white rounded-full px-8 py-3 shadow-lg hover:bg-blue-600 transition-all duration-300 font-medium text-lg animate-[bounce_0.5s_ease-in-out_1]"
        >
          השוואה
        </button>
      )}
    </div>
  );
}
