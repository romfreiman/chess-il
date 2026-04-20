import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi } from 'vitest';
import { HomePage } from '../pages/HomePage';

// Mock the context
vi.mock('../context/SavedPlayersContext');
import { useSavedPlayersContext } from '../context/SavedPlayersContext';
const mockContext = useSavedPlayersContext as ReturnType<typeof vi.fn>;

function renderHomePage() {
  const router = createMemoryRouter(
    [{ path: '/', element: <HomePage /> }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('HomePage', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('shows EmptyState when no saved players', () => {
    mockContext.mockReturnValue({
      savedPlayers: [],
      savePlayer: vi.fn(),
      removePlayer: vi.fn(),
      isSaved: vi.fn(),
      isFull: false,
    });
    renderHomePage();
    expect(screen.getByText('חפשו שחקן כדי להתחיל')).toBeInTheDocument();
  });

  it('shows PlayerGrid when saved players exist', () => {
    mockContext.mockReturnValue({
      savedPlayers: [{ id: 1, name: 'Test', rating: 1500, club: null, savedAt: '2026-01-01' }],
      savePlayer: vi.fn(),
      removePlayer: vi.fn(),
      isSaved: vi.fn(),
      isFull: false,
    });
    renderHomePage();
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('שחקנים שמורים')).toBeInTheDocument();
  });

  it('renders HeroSearch component', () => {
    mockContext.mockReturnValue({
      savedPlayers: [],
      savePlayer: vi.fn(),
      removePlayer: vi.fn(),
      isSaved: vi.fn(),
      isFull: false,
    });
    renderHomePage();
    // HeroSearch renders an input with a search placeholder
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });
});
