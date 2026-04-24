import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { SavedPlayer } from '../../lib/types';

interface CompareSelectorProps {
  players: SavedPlayer[];
}

export function CompareSelector({ players }: CompareSelectorProps) {
  const navigate = useNavigate();
  const [selectedA, setSelectedA] = useState<string>('');
  const [selectedB, setSelectedB] = useState<string>('');

  if (players.length < 2) return null;

  const playersForA = players.filter(
    (p) => p.id.toString() !== selectedB,
  );
  const playersForB = players.filter(
    (p) => p.id.toString() !== selectedA,
  );

  const canCompare = selectedA !== '' && selectedB !== '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-50 mb-4">
        {'השוואת שחקנים'}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <select
          value={selectedA}
          onChange={(e) => setSelectedA(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 text-base"
        >
          <option value="" disabled>
            -- בחרו שחקן --
          </option>
          {playersForA.map((player) => (
            <option key={player.id} value={player.id.toString()}>
              {player.name} ({player.rating})
            </option>
          ))}
        </select>
        <select
          value={selectedB}
          onChange={(e) => setSelectedB(e.target.value)}
          className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-50 text-base"
        >
          <option value="" disabled>
            -- בחרו שחקן --
          </option>
          {playersForB.map((player) => (
            <option key={player.id} value={player.id.toString()}>
              {player.name} ({player.rating})
            </option>
          ))}
        </select>
      </div>
      <div className="mt-4 text-center">
        <button
          disabled={!canCompare}
          onClick={() => navigate(`/compare?a=${selectedA}&b=${selectedB}`)}
          className="bg-[#378ADD] text-white rounded-xl px-6 py-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {'השוואה'}
        </button>
      </div>
    </div>
  );
}
