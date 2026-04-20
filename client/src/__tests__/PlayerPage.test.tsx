import { render, screen, fireEvent } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { vi, type Mock } from 'vitest';
import { PlayerPage } from '../pages/PlayerPage';
import { mockApiResponse } from '../test/fixtures/playerData';

// Mock usePlayer hook
vi.mock('../hooks/usePlayer');
import { usePlayer } from '../hooks/usePlayer';

const mockUsePlayer = usePlayer as Mock;

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
  });

  it('shows skeleton loaders while data is loading', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refresh: vi.fn(),
    });

    const { container } = renderPlayerPage();
    // Skeleton components use animate-pulse class
    const pulseElements = container.querySelectorAll('.animate-pulse');
    expect(pulseElements.length).toBeGreaterThan(0);
  });

  it('shows error state with retry button when error occurs', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD')).toBeInTheDocument();
    expect(screen.getByText('\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1')).toBeInTheDocument();
  });

  it('shows not-found error for 404 errors', () => {
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: false,
      error: 'Player not found',
      refresh: vi.fn(),
    });

    renderPlayerPage();
    expect(screen.getByText('\u05E9\u05D7\u05E7\u05DF \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0')).toBeInTheDocument();
  });

  it('calls refresh when retry button is clicked on error', () => {
    const mockRefresh = vi.fn();
    mockUsePlayer.mockReturnValue({
      data: null,
      loading: false,
      error: 'Network error',
      refresh: mockRefresh,
    });

    renderPlayerPage();
    fireEvent.click(screen.getByText('\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1'));
    expect(mockRefresh).toHaveBeenCalledOnce();
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
