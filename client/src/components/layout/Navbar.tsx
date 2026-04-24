import { Link } from 'react-router-dom';
import { Home, BarChart3, Building2 } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  savedCount: number;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
}

export function Navbar({ savedCount, theme, onThemeToggle }: NavbarProps) {
  const compareDisabled = savedCount < 2;

  return (
    <nav className="fixed top-0 inset-x-0 z-50 h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-5xl mx-auto h-full px-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-primary">
          <span>&#9823;</span>
          <span>Chess IL</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="דף הבית"
          >
            <Home className="h-5 w-5" />
          </Link>
          <Link
            to="/?tab=clubs"
            className="text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="חיפוש מועדון"
          >
            <Building2 className="h-5 w-5" />
          </Link>
          <Link
            to="/compare"
            className={`text-gray-600 dark:text-gray-300 p-2 rounded-lg ${
              compareDisabled
                ? 'opacity-40 cursor-not-allowed pointer-events-none'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-disabled={compareDisabled}
            aria-label="השוואת שחקנים"
            title={compareDisabled ? 'שמרו לפחות 2 שחקנים כדי להשוות' : undefined}
            tabIndex={compareDisabled ? -1 : undefined}
          >
            <BarChart3 className="h-5 w-5" />
          </Link>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </nav>
  );
}
