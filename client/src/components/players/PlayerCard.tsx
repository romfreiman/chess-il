import { Link } from 'react-router-dom';
import type { SavedPlayer } from '../../lib/types';

interface PlayerCardProps {
  player: SavedPlayer;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link
      to={`/player/${player.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-transparent hover:border-primary transition-colors duration-150 min-h-[80px]"
    >
      <div className="text-base font-bold text-gray-900 dark:text-gray-50">
        {player.name}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {player.rating}
      </div>
      {player.club && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {player.club}
        </div>
      )}
    </Link>
  );
}
