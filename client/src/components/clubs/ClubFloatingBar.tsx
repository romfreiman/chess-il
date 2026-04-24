import { Download } from 'lucide-react';

interface ClubFloatingBarProps {
  count: number;
}

export function ClubFloatingBar({ count }: ClubFloatingBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#378ADD] text-white rounded-full px-8 py-3 shadow-lg animate-[bounce_0.5s_ease-in-out_1] flex items-center gap-4"
    >
      <span className="text-base font-bold">נבחרו {count} שחקנים</span>
      <button
        disabled
        className="flex items-center gap-1 opacity-50 cursor-not-allowed text-sm"
      >
        <Download className="h-4 w-4" />
        ייצוא CSV
      </button>
    </div>
  );
}
