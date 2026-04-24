export function PlayerHeaderSkeleton() {
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6">
      {/* Top-end buttons area (save + refresh placeholders) */}
      <div className="absolute top-4 end-4 flex gap-2">
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Line 1: Name + badge */}
      <div className="flex items-center flex-wrap gap-3 pe-14">
        <div className="h-7 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
      </div>

      {/* Line 2: Club */}
      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />

      {/* Line 3: FIDE */}
      <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
    </div>
  );
}
