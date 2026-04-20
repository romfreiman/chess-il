import { AlertCircle } from 'lucide-react';

interface ErrorStateProps {
  errorType: 'not-found' | 'network';
  onRetry: () => void;
}

const MESSAGES = {
  'not-found': {
    heading: '\u05E9\u05D7\u05E7\u05DF \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0',
    body: '\u05DE\u05E1\u05E4\u05E8 \u05D4\u05E9\u05D7\u05E7\u05DF \u05E9\u05D4\u05D5\u05D6\u05DF \u05DC\u05D0 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA. \u05D1\u05D3\u05E7\u05D5 \u05D0\u05EA \u05D4\u05DE\u05E1\u05E4\u05E8 \u05D5\u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.',
  },
  network: {
    heading: '\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD',
    body: '\u05DC\u05D0 \u05D4\u05E6\u05DC\u05D7\u05E0\u05D5 \u05DC\u05D4\u05EA\u05D7\u05D1\u05E8 \u05DC\u05E9\u05E8\u05EA. \u05D1\u05D3\u05E7\u05D5 \u05D0\u05EA \u05D4\u05D7\u05D9\u05D1\u05D5\u05E8 \u05DC\u05D0\u05D9\u05E0\u05D8\u05E8\u05E0\u05D8 \u05D5\u05E0\u05E1\u05D5 \u05E9\u05D5\u05D1.',
  },
} as const;

export function ErrorState({ errorType, onRetry }: ErrorStateProps) {
  const { heading, body } = MESSAGES[errorType];

  return (
    <div className="text-center flex flex-col items-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-4">
        {heading}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
        {body}
      </p>
      <button
        onClick={onRetry}
        className="bg-primary text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors mt-4"
      >
        {'\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1'}
      </button>
    </div>
  );
}
