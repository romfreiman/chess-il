import { Download } from 'lucide-react';

interface ClubFloatingBarProps {
  count: number;
  onExport: () => void;
}

export function ClubFloatingBar({ count, onExport }: ClubFloatingBarProps) {
  if (count === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#378ADD] text-white rounded-full px-8 py-3 shadow-lg animate-[bounce_0.5s_ease-in-out_1] flex items-center gap-4"
    >
      <span className="text-base font-bold">נבחרו {count} שחקנים</span>
      <button
        onClick={onExport}
        aria-label="ייצוא שחקנים נבחרים לקובץ CSV"
        className="flex items-center gap-1 text-sm hover:bg-white/20 active:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg px-2 py-1 transition-colors"
      >
        <Download className="h-4 w-4" />
        ייצוא CSV
      </button>
    </div>
  );
}
