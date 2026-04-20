import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useDarkMode } from '../../hooks/useDarkMode';

export function AppLayout() {
  const { theme, toggle } = useDarkMode();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar savedCount={0} theme={theme} onThemeToggle={toggle} />
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
