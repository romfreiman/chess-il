import { createContext, useContext, type ReactNode } from 'react';
import { useSavedPlayers, type UseSavedPlayersResult } from '../hooks/useSavedPlayers';

const SavedPlayersContext = createContext<UseSavedPlayersResult | null>(null);

export function SavedPlayersProvider({ children }: { children: ReactNode }) {
  const value = useSavedPlayers();
  return (
    <SavedPlayersContext.Provider value={value}>
      {children}
    </SavedPlayersContext.Provider>
  );
}

export function useSavedPlayersContext(): UseSavedPlayersResult {
  const ctx = useContext(SavedPlayersContext);
  if (!ctx) throw new Error('useSavedPlayersContext must be used within SavedPlayersProvider');
  return ctx;
}
