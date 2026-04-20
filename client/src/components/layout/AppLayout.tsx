import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useDarkMode } from '../../hooks/useDarkMode';
import { SavedPlayersProvider, useSavedPlayersContext } from '../../context/SavedPlayersContext';

function AppLayoutInner() {
  const { theme, toggle } = useDarkMode();
  const { savedPlayers } = useSavedPlayersContext();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar savedCount={savedPlayers.length} theme={theme} onThemeToggle={toggle} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export function AppLayout() {
  return (
    <SavedPlayersProvider>
      <AppLayoutInner />
    </SavedPlayersProvider>
  );
}
