import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';

function renderLayout(childContent = 'Child content') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <div>{childContent}</div> },
        ],
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('AppLayout', () => {
  it('renders Navbar component', async () => {
    renderLayout();
    await waitFor(() => {
      expect(screen.getByText('Chess IL')).toBeInTheDocument();
    });
  });

  it('renders child route content via Outlet', async () => {
    renderLayout('Test child page');
    await waitFor(() => {
      expect(screen.getByText('Test child page')).toBeInTheDocument();
    });
  });

  it('has bg-gray-50 class on root div', async () => {
    const { container } = renderLayout();
    await waitFor(() => {
      const root = container.firstElementChild;
      expect(root).toHaveClass('bg-gray-50');
    });
  });

  it('has min-h-screen class on root div', async () => {
    const { container } = renderLayout();
    await waitFor(() => {
      const root = container.firstElementChild;
      expect(root).toHaveClass('min-h-screen');
    });
  });
});
