export function WinLossChartSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      {/* Header */}
      <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />

      {/* Donut placeholder */}
      <div className="h-[250px] w-full flex items-center justify-center mt-4">
        <div className="h-[180px] w-[180px] rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>

      {/* Legend row */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    </div>
  );
}
