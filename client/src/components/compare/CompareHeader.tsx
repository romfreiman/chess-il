import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ApiResponse } from '@shared/types';
import { PlayerHeader } from '../dashboard/PlayerHeader';
import { MetricCards } from '../dashboard/MetricCards';
import { PlayerHeaderSkeleton } from '../dashboard/skeletons/PlayerHeaderSkeleton';
import { MetricCardsSkeleton } from '../dashboard/skeletons/MetricCardsSkeleton';
import { ErrorState } from '../feedback/ErrorState';

interface CompareHeaderProps {
  // Player A
  playerAData: ApiResponse | null;
  playerALoading: boolean;
  playerAError: string | null;
  playerARefresh: () => void;
  // Player B
  playerBData: ApiResponse | null;
  playerBLoading: boolean;
  playerBError: string | null;
  playerBRefresh: () => void;
  // Shared
  isSaved: (id: number) => boolean;
  isFull: boolean;
  onSave: (player: { id: number; name: string; rating: number; club: string | null }) => void;
  onUnsave: (id: number) => void;
  // Selection state (for tab labels)
  selectedA: string;
  selectedB: string;
}

function renderPlayerContent(
  data: ApiResponse | null,
  loading: boolean,
  error: string | null,
  refresh: () => void,
  isSelected: boolean,
  isSaved: (id: number) => boolean,
  isFull: boolean,
  onSave: (player: { id: number; name: string; rating: number; club: string | null }) => void,
  onUnsave: (id: number) => void,
): JSX.Element | null {
  if (!isSelected) return null;
  if (loading) {
    return (
      <>
        <PlayerHeaderSkeleton />
        <MetricCardsSkeleton />
      </>
    );
  }
  if (error) {
    const errorType = error.toLowerCase().includes('not found') || error.includes('\u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0')
      ? 'not-found' as const
      : 'network' as const;
    return <ErrorState errorType={errorType} onRetry={refresh} />;
  }
  if (data) {
    return (
      <>
        <PlayerHeader
          player={data.player}
          onRefresh={refresh}
          isSaved={isSaved(data.player.id)}
          isFull={isFull}
          onSave={() => onSave({ id: data.player.id, name: data.player.name, rating: data.player.rating, club: data.player.club })}
          onUnsave={() => onUnsave(data.player.id)}
        />
        <MetricCards player={data.player} tournaments={data.tournaments} />
        <Link
          to={`/player/${data.player.id}`}
          className="block text-center text-sm text-primary hover:underline dark:text-blue-400"
        >
          {"צפה בדף השחקן המלא"}
        </Link>
      </>
    );
  }
  return null;
}

export function CompareHeader({
  playerAData,
  playerALoading,
  playerAError,
  playerARefresh,
  playerBData,
  playerBLoading,
  playerBError,
  playerBRefresh,
  isSaved,
  isFull,
  onSave,
  onUnsave,
  selectedA,
  selectedB,
}: CompareHeaderProps) {
  const [activeTab, setActiveTab] = useState<'a' | 'b'>('a');

  return (
    <>
      {/* Desktop layout: two columns side by side */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {/* Column A */}
        <div className="space-y-4">
          {renderPlayerContent(
            playerAData, playerALoading, playerAError, playerARefresh,
            !!selectedA, isSaved, isFull, onSave, onUnsave,
          )}
        </div>
        {/* Column B */}
        <div className="space-y-4">
          {renderPlayerContent(
            playerBData, playerBLoading, playerBError, playerBRefresh,
            !!selectedB, isSaved, isFull, onSave, onUnsave,
          )}
        </div>
      </div>

      {/* Mobile layout: tab UI */}
      <div className="md:hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'a'}
            className={`flex-1 py-3 text-center text-base ${
              activeTab === 'a'
                ? 'text-primary border-b-[3px] border-primary font-bold'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('a')}
          >
            {playerAData?.player.name || '\u05E9\u05D7\u05E7\u05DF A'}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'b'}
            className={`flex-1 py-3 text-center text-base ${
              activeTab === 'b'
                ? 'text-primary border-b-[3px] border-primary font-bold'
                : 'text-gray-500 dark:text-gray-400'
            }`}
            onClick={() => setActiveTab('b')}
          >
            {playerBData?.player.name || '\u05E9\u05D7\u05E7\u05DF B'}
          </button>
        </div>
        <div role="tabpanel" className="mt-4 space-y-4">
          {activeTab === 'a'
            ? renderPlayerContent(
                playerAData, playerALoading, playerAError, playerARefresh,
                !!selectedA, isSaved, isFull, onSave, onUnsave,
              )
            : renderPlayerContent(
                playerBData, playerBLoading, playerBError, playerBRefresh,
                !!selectedB, isSaved, isFull, onSave, onUnsave,
              )
          }
        </div>
      </div>
    </>
  );
}
