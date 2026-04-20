import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { EmptyState } from '../components/players/EmptyState';
import { PlayerGrid } from '../components/players/PlayerGrid';
import type { SavedPlayer } from '../lib/types';

const mockPlayers: SavedPlayer[] = [
  { id: 205001, name: 'אנדי פריימן', rating: 1500, club: 'חיפה' },
  { id: 210498, name: 'לני פריימן', rating: 1200, club: null },
];

function renderWithRouter(ui: React.ReactElement) {
  const router = createMemoryRouter(
    [{ path: '/', element: ui }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('EmptyState', () => {
  it('renders heading "חפשו שחקן כדי להתחיל" when no players', () => {
    render(<EmptyState />);
    expect(screen.getByText('חפשו שחקן כדי להתחיל')).toBeInTheDocument();
  });

  it('renders body text with instructions', () => {
    render(<EmptyState />);
    expect(
      screen.getByText(/הזינו מספר שחקן בשורת החיפוש למעלה כדי לצפות בסטטיסטיקות/),
    ).toBeInTheDocument();
  });
});

describe('PlayerGrid', () => {
  it('renders player cards when given SavedPlayer array', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} />);
    expect(screen.getByText('אנדי פריימן')).toBeInTheDocument();
    expect(screen.getByText('לני פריימן')).toBeInTheDocument();
  });

  it('each card shows player name, rating, and club', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} />);
    expect(screen.getByText('אנדי פריימן')).toBeInTheDocument();
    expect(screen.getByText('1500')).toBeInTheDocument();
    expect(screen.getByText('חיפה')).toBeInTheDocument();
  });

  it('each card is a link to /player/:id', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} />);
    const links = screen.getAllByRole('link');
    const playerLinks = links.filter((link) =>
      link.getAttribute('href')?.includes('/player/'),
    );
    expect(playerLinks).toHaveLength(2);
    expect(playerLinks[0]).toHaveAttribute('href', '/player/205001');
    expect(playerLinks[1]).toHaveAttribute('href', '/player/210498');
  });

  it('grid has grid-cols-2 class for mobile 2-column layout', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} />);
    const heading = screen.getByText('שחקנים שמורים');
    // The grid container is a sibling of the heading inside the section
    const section = heading.parentElement;
    const gridContainer = section?.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-2');
  });

  it('renders section heading "שחקנים שמורים"', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} />);
    expect(screen.getByText('שחקנים שמורים')).toBeInTheDocument();
  });
});
