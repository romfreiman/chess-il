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
          <a
            href="https://github.com/rfreiman/chess-il"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="GitHub"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
          </a>
          <ThemeToggle theme={theme} onToggle={onThemeToggle} />
        </div>
      </div>
    </nav>
  );
}
