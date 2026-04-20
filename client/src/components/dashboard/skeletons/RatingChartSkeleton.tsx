export function RatingChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Chart area */}
      <div className="h-[300px] w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-4" />
    </div>
  );
}
