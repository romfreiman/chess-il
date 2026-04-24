import type { SavedPlayer } from '../../lib/types';
import { PlayerCard } from './PlayerCard';

interface PlayerGridProps {
  players: SavedPlayer[];
  onRemove?: (id: number) => void;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}

export function PlayerGrid({ players, onRemove, selectedIds, onToggleSelect }: PlayerGridProps) {
  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-4">
        שחקנים שמורים
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {players.map((player) => (
          <PlayerCard
            key={player.id}
            player={player}
            onRemove={onRemove}
            isSelected={selectedIds?.has(player.id)}
            onToggleSelect={onToggleSelect}
            selectionDisabled={!!selectedIds && selectedIds.size >= 2 && !selectedIds.has(player.id)}
          />
        ))}
      </div>
    </section>
  );
}
