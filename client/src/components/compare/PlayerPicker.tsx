import type { SavedPlayer } from '../../lib/types';

interface PlayerPickerProps {
  label: string;
  selectedId: string;
  excludeId: string;
  savedPlayers: SavedPlayer[];
  onChange: (id: string) => void;
}

export function PlayerPicker({
  label,
  selectedId,
  excludeId,
  savedPlayers,
  onChange,
}: PlayerPickerProps) {
  const selectId = `player-picker-${label}`;
  const filteredPlayers = savedPlayers.filter(
    (player) => player.id.toString() !== excludeId,
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <label
        htmlFor={selectId}
        className="block text-sm font-bold text-gray-500 dark:text-gray-400 mb-2"
      >
        {label}
      </label>
      <select
        id={selectId}
        value={selectedId}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 text-base"
      >
        <option value="" disabled>
          -- בחרו שחקן --
        </option>
        {filteredPlayers.map((player) => (
          <option key={player.id} value={player.id.toString()}>
            {player.name} ({player.rating})
          </option>
        ))}
      </select>
    </div>
  );
}
