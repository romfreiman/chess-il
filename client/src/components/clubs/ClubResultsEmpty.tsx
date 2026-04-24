import { Users, SearchX } from 'lucide-react';

export function ClubResultsInitial() {
  return (
    <div className="text-center flex flex-col items-center py-12">
      <Users className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-4">
        חיפוש שחקני מועדון
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
        בחרו מועדון ולחצו חיפוש כדי לראות את רשימת השחקנים
      </p>
    </div>
  );
}

export function ClubResultsEmpty() {
  return (
    <div className="text-center flex flex-col items-center py-12">
      <SearchX className="h-12 w-12 text-gray-400 dark:text-gray-500" />
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-200 mt-4">
        לא נמצאו שחקנים
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-xs">
        נסו לשנות את המועדון או להגדיל את טווח הגילאים
      </p>
    </div>
  );
}
