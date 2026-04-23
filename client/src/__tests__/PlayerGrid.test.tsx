import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import { EmptyState } from '../components/players/EmptyState';
import { PlayerGrid } from '../components/players/PlayerGrid';
import type { SavedPlayer } from '../lib/types';

const mockPlayers: SavedPlayer[] = [
  { id: 205001, name: 'אנדי פריימן', rating: 1500, club: 'חיפה', totalGames: 72, savedAt: '2026-01-01T00:00:00Z' },
  { id: 210498, name: 'לני פריימן', rating: 1200, club: null, totalGames: 35, savedAt: '2026-01-02T00:00:00Z' },
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

  it('renders remove button when onRemove is provided', () => {
    renderWithRouter(<PlayerGrid players={mockPlayers} onRemove={vi.fn()} />);
    const removeButtons = screen.getAllByLabelText('הסר שחקן');
    expect(removeButtons).toHaveLength(2);
  });

  it('calls onRemove with player id when remove button clicked', () => {
    const onRemove = vi.fn();
    renderWithRouter(<PlayerGrid players={mockPlayers} onRemove={onRemove} />);
    const removeButtons = screen.getAllByLabelText('הסר שחקן');
    fireEvent.click(removeButtons[0]);
    expect(onRemove).toHaveBeenCalledWith(205001);
  });

  it('remove button click does not navigate (stopPropagation)', () => {
    const onRemove = vi.fn();
    renderWithRouter(<PlayerGrid players={mockPlayers} onRemove={onRemove} />);
    const removeButtons = screen.getAllByLabelText('הסר שחקן');
    fireEvent.click(removeButtons[0]);
    // If navigation occurred, the component would unmount - check we can still find elements
    expect(screen.getByText('אנדי פריימן')).toBeInTheDocument();
  });
});
