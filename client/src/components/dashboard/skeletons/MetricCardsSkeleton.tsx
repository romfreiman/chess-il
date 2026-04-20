export function MetricCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 animate-pulse"
        >
          {/* Icon */}
          <div className="h-5 w-5 bg-gray-200 dark:bg-gray-700 rounded" />
          {/* Value */}
          <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded mt-2" />
          {/* Label */}
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mt-1" />
        </div>
      ))}
    </div>
  );
}
