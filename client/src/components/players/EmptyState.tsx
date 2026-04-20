import { Search } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="text-center flex flex-col items-center py-12">
      <Search className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-4">
        חפשו שחקן כדי להתחיל
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
        הזינו מספר שחקן בשורת החיפוש למעלה כדי לצפות בסטטיסטיקות
      </p>
    </div>
  );
}
