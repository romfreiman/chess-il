import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';

// Render with a MemoryRouter for testing routed components
export function renderWithRouter(
  ui: ReactElement,
  { initialEntries = ['/'], ...renderOptions }: RenderOptions & { initialEntries?: string[] } = {},
) {
  const router = createMemoryRouter(
    [{ path: '*', element: ui }],
    { initialEntries },
  );
  return render(<RouterProvider router={router} />, renderOptions);
}

export { render, screen, waitFor } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
