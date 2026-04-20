import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import { PlayerPage } from '../pages/PlayerPage';
import { mockApiResponse } from '../test/fixtures/playerData';

// Mock usePlayer hook
vi.mock('../hooks/usePlayer');
import { usePlayer } from '../hooks/usePlayer';

// Mock SavedPlayersContext
vi.mock('../context/SavedPlayersContext');
import { useSavedPlayersContext } from '../context/SavedPlayersContext';

const mockUsePlayer = usePlayer as Mock;
const mockSavedPlayersContext = useSavedPlayersContext as Mock;

function renderPlayerPage(id = '205001') {
  const router = createMemoryRouter(
    [{ path: '/player/:id', element: <PlayerPage /> }],
    { initialEntries: [`/player/${id}`] },
  );
  return render(<RouterProvider router={router} />);
}

describe('PlayerPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSavedPlayersContext.mockReturnValue({
      savedPlayers: [],
      savePlayer: vi.fn(),
      removePlayer: vi.fn(),
      isSaved: vi.fn().mockReturnValue(false),
      isFull: false,
    });
  });

  it('shows loading message while data is loading', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('טוען נתוני שחקן...')).toBeInTheDocument();
  });

  it('shows error message when error occurs', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(
      screen.getByText(/לא הצלחנו לטעון את נתוני השחקן/),
    ).toBeInTheDocument();
  });

  it('renders PlayerHeader when data is loaded', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    // Player name from mockPlayerInfo
    expect(screen.getByText('אנדי פריימן')).toBeInTheDocument();
  });

  it('renders MetricCards when data is loaded', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('דירוג נוכחי')).toBeInTheDocument();
  });

  it('renders chart section heading', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('היסטוריית דירוג')).toBeInTheDocument();
  });

  it('renders donut section heading', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('ניצחונות / תיקו / הפסדים')).toBeInTheDocument();
  });

  it('renders tournament section heading', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage();
    // Both desktop and mobile headings rendered
    expect(screen.getAllByText('תוצאות טורנירים').length).toBeGreaterThanOrEqual(1);
  });

  it('calls usePlayer with route param id', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    renderPlayerPage('205001');
    expect(mockUsePlayer).toHaveBeenCalledWith('205001');
  });

  it('chart and donut are in flex row on desktop', () => {
    mockUsePlayer.mockReturnValue({
      data: mockApiResponse,
      loading: false,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = renderPlayerPage();
    const flexRow = container.querySelector('.flex.flex-col.md\\:flex-row');
    expect(flexRow).toBeInTheDocument();

    // Check chart container has md:w-[65%]
    const chartContainer = container.querySelector('[class*="md:w-[65%]"]');
    expect(chartContainer).toBeInTheDocument();

    // Check donut container has md:w-[35%]
    const donutContainer = container.querySelector('[class*="md:w-[35%]"]');
    expect(donutContainer).toBeInTheDocument();
  });
});
