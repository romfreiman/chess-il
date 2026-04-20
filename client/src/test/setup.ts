import React from 'react';
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock Recharts ResponsiveContainer (jsdom has no layout engine)
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      React.createElement('div', { style: { width: 500, height: 300 } }, children),
  };
});
