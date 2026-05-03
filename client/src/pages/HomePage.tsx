import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HeroSearch } from '../components/search/HeroSearch';
import { PlayerGrid } from '../components/players/PlayerGrid';
import { EmptyState } from '../components/players/EmptyState';
import { useSavedPlayersContext } from '../context/SavedPlayersContext';
import { useClubList } from '../hooks/useClubList';
import { useClubSearch } from '../hooks/useClubSearch';
import { ClubSearchForm } from '../components/search/ClubSearchForm';
import { ClubResultsTable } from '../components/clubs/ClubResultsTable';
import { ClubResultsCards } from '../components/clubs/ClubResultsCards';
import { ClubResultsEmpty, ClubResultsInitial } from '../components/clubs/ClubResultsEmpty';
import { ClubFloatingBar } from '../components/clubs/ClubFloatingBar';
import { ErrorState } from '../components/feedback/ErrorState';
import { exportPlayersCsv } from '../utils/exportCsv';

export function HomePage() {
  const { savedPlayers, removePlayer } = useSavedPlayersContext();
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('tab') || 'player') as 'player' | 'clubs';
  const urlClubParam = searchParams.get('club');
  const urlMaxAge = searchParams.get('maxAge');

  const { clubs, loading: clubsLoading } = useClubList();

  const [searchClubIds, setSearchClubIds] = useState<number[]>([]);
  const [searchMaxAge, setSearchMaxAge] = useState<number | null>(
    urlMaxAge ? parseInt(urlMaxAge, 10) : null
  );
  const { results, loading: searchLoading, error: searchError, search } = useClubSearch(searchClubIds, searchMaxAge);

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [hasSearched, setHasSearched] = useState(false);

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

  const handleClubSearch = useCallback((clubIds: number[], maxAge: number | null) => {
    setSearchClubIds(clubIds);
    setSearchMaxAge(maxAge);
    setHasSearched(true);
    setSelected(new Set());
    const params: Record<string, string> = { tab: 'clubs', club: clubIds.join(',') };
    if (maxAge !== null) params.maxAge = String(maxAge);
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (activeTab === 'clubs' && urlClubParam && !hasSearched) {
      const clubIds = urlClubParam.split(',').map((s) => parseInt(s, 10)).filter((id) => !isNaN(id) && id > 0);
      if (clubIds.length > 0) {
        setSearchClubIds(clubIds);
        setSearchMaxAge(urlMaxAge ? parseInt(urlMaxAge, 10) : null);
        setHasSearched(true);
      }
    }
  }, [activeTab, urlClubParam, urlMaxAge, hasSearched]);

  useEffect(() => {
    if (searchClubIds.length > 0 && hasSearched) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchClubIds, searchMaxAge, hasSearched]);

  const toggleOne = useCallback((id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === results.length ? new Set() : new Set(results.map((r) => r.id))
    );
  }, [results]);

  const handleExport = useCallback(() => {
    const clubNames = searchClubIds
      .map((id) => clubs.find((c) => c.id === id)?.name ?? '')
      .filter(Boolean);
    exportPlayersCsv(results, selected, clubNames);
  }, [results, selected, clubs, searchClubIds]);

  const handleTabSwitch = useCallback((tab: 'player' | 'clubs') => {
    if (tab === 'player') {
      setSearchParams({}, { replace: true });
    } else {
      const params: Record<string, string> = { tab: 'clubs' };
      if (searchClubIds.length > 0) params.club = searchClubIds.join(',');
      if (searchMaxAge !== null) params.maxAge = String(searchMaxAge);
      setSearchParams(params, { replace: true });
    }
  }, [setSearchParams, searchClubIds, searchMaxAge]);

  const subtitleClubs = searchClubIds
    .map((id) => clubs.find((c) => c.id === id)?.name ?? '')
    .filter(Boolean)
    .join(' + ');

  return (
    <div className="max-w-5xl mx-auto px-4">
      <div className="mt-8 flex border-b border-gray-200 dark:border-gray-700" role="tablist">
        <button
          id="player-tab"
          role="tab"
          aria-selected={activeTab === 'player'}
          onClick={() => handleTabSwitch('player')}
          className={`flex-1 py-3 text-center text-base transition-colors ${
            activeTab === 'player'
              ? 'text-[#378ADD] border-b-[3px] border-[#378ADD] font-bold'
              : 'text-gray-500 dark:text-gray-400 font-normal'
          }`}
        >
          חיפוש שחקן
        </button>
        <button
          id="clubs-tab"
          role="tab"
          aria-selected={activeTab === 'clubs'}
          onClick={() => handleTabSwitch('clubs')}
          className={`flex-1 py-3 text-center text-base transition-colors ${
            activeTab === 'clubs'
              ? 'text-[#378ADD] border-b-[3px] border-[#378ADD] font-bold'
              : 'text-gray-500 dark:text-gray-400 font-normal'
          }`}
        >
          חיפוש מועדון
        </button>
      </div>

      {activeTab === 'player' && (
        <div role="tabpanel" aria-labelledby="player-tab">
          <div className="mt-8 mb-8">
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
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#378ADD] text-white rounded-full px-8 py-3 shadow-lg hover:bg-blue-600 transition-all duration-300 font-medium text-lg animate-[bounce_0.5s_ease-in-out_1]}"
            >
              השוואה
            </button>
          )}
        </div>
      )}

      {activeTab === 'clubs' && (
        <div role="tabpanel" aria-labelledby="clubs-tab" className="mt-8">
          <ClubSearchForm
            clubs={clubs}
            clubsLoading={clubsLoading}
            onSearch={handleClubSearch}
            initialClubIds={urlClubParam ? urlClubParam.split(',').map((s) => parseInt(s, 10)).filter((id) => !isNaN(id) && id > 0) : []}
            initialMaxAge={urlMaxAge ? parseInt(urlMaxAge, 10) : null}
          />

          {searchLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }, (_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : searchError ? (
            <ErrorState errorType="club-search" onRetry={search} />
          ) : !hasSearched ? (
            <ClubResultsInitial />
          ) : hasSearched && results.length === 0 ? (
            <ClubResultsEmpty />
          ) : (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                נמצאו <span className="font-bold">{results.length}</span> שחקנים
                {subtitleClubs && <span className="mr-1">ב{subtitleClubs}</span>}
              </p>
              <ClubResultsTable
                results={results}
                selected={selected}
                onToggle={toggleOne}
                onToggleAll={toggleAll}
              />
              <ClubResultsCards
                results={results}
                selected={selected}
                onToggle={toggleOne}
                onToggleAll={toggleAll}
              />
            </>
          )}

          <ClubFloatingBar count={selected.size} onExport={handleExport} />
        </div>
      )}
    </div>
  );
}
