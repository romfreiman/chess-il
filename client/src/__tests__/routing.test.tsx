import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { HomePage } from '../pages/HomePage';
import { PlayerPage } from '../pages/PlayerPage';
import { ComparePage } from '../pages/ComparePage';

const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'player/:id', element: <PlayerPage /> },
      { path: 'compare', element: <ComparePage /> },
    ],
  },
];

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  return render(<RouterProvider router={router} />);
}

describe('Routing', () => {
  it('renders HomePage content at "/"', async () => {
    renderRoute('/');
    await waitFor(() => {
      expect(screen.getByText('דף הבית')).toBeInTheDocument();
    });
  });

  it('renders PlayerPage with player ID at "/player/205001"', async () => {
    renderRoute('/player/205001');
    await waitFor(() => {
      expect(screen.getByText(/שחקן 205001/)).toBeInTheDocument();
    });
  });

  it('renders ComparePage content at "/compare"', async () => {
    renderRoute('/compare');
    await waitFor(() => {
      expect(screen.getByText('השוואת שחקנים')).toBeInTheDocument();
    });
  });

  it('navigates between routes via links', async () => {
    renderRoute('/');
    await waitFor(() => {
      expect(screen.getByText('דף הבית')).toBeInTheDocument();
    });
    // Navbar should be present on all routes
    expect(screen.getByText('Chess IL')).toBeInTheDocument();
  });
});
