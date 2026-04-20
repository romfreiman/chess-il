import { useEffect } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, visible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000);
    return () => clearTimeout(timer);
  }, [visible, onDismiss]);

  return (
    <div className="fixed bottom-6 inset-x-0 flex justify-center z-50 pointer-events-none">
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-auto bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-bold px-4 py-3 rounded-lg shadow-lg max-w-sm"
        style={{
          transition: 'opacity 200ms ease-out, transform 200ms ease-out',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
        }}
      >
        {message}
      </div>
    </div>
  );
}
