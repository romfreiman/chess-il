import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { RatingHistoryEntry, TournamentEntry } from '@shared/types';

// Mock ResponsiveContainer to render children in jsdom (no layout engine)
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 300 }}>{children}</div>
    ),
  };
});

import { RatingChart, buildChartData, formatMonthYear } from '../components/dashboard/RatingChart';

// Inline mock data (not depending on Plan 01 fixtures)
const mockTournaments: TournamentEntry[] = [
  {
    startDate: '2025-09-10',
    updateDate: '2025-09-15',
    isPending: false,
    tournamentName: 'אליפות ישראל',
    tournamentUrl: 'http://chess.org.il/t/1',
    games: 7,
    points: 4.5,
    performance: 1550,
    wins: 4,
    losses: 2,
    draws: 1,
    ratingChange: 12.5,
  },
  {
    startDate: '2025-12-01',
    updateDate: '2025-12-05',
    isPending: false,
    tournamentName: 'טורניר חנוכה',
    tournamentUrl: 'http://chess.org.il/t/2',
    games: 5,
    points: 3,
    performance: 1500,
    wins: 3,
    losses: 2,
    draws: 0,
    ratingChange: -5.2,
  },
  {
    startDate: '2026-01-15',
    updateDate: '2026-01-20',
    isPending: false,
    tournamentName: 'טורניר ינואר',
    tournamentUrl: 'http://chess.org.il/t/3',
    games: 6,
    points: 3.5,
    performance: 1480,
    wins: 3,
    losses: 2,
    draws: 1,
    ratingChange: 8.0,
  },
  {
    startDate: '2026-03-20',
    updateDate: null,
    isPending: true,
    tournamentName: 'טורניר פורים',
    tournamentUrl: 'http://chess.org.il/t/4',
    games: 4,
    points: 2,
    performance: 1460,
    wins: 2,
    losses: 2,
    draws: 0,
    ratingChange: 0,
  },
  {
    startDate: '2025-06-05',
    updateDate: '2025-06-10',
    isPending: false,
    tournamentName: 'טורניר קיץ',
    tournamentUrl: 'http://chess.org.il/t/5',
    games: 5,
    points: 2.5,
    performance: 1400,
    wins: 2,
    losses: 2,
    draws: 1,
    ratingChange: -3.0,
  },
];

const currentRating = 1500;

const mockRatingHistory: RatingHistoryEntry[] = [
  { date: '2025-06-05', rating: 1485 },
  { date: '2025-09-10', rating: 1497 },
  { date: '2025-12-01', rating: 1492 },
  { date: '2026-01-15', rating: 1500 },
];

describe('RatingChart', () => {
  it('renders section heading "היסטוריית דירוג"', () => {
    render(<RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />);
    expect(screen.getByText('היסטוריית דירוג')).toBeInTheDocument();
  });

  it('renders line chart toggle button with aria-label "תצוגת קו"', () => {
    render(<RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />);
    expect(screen.getByLabelText('תצוגת קו')).toBeInTheDocument();
  });

  it('renders bar chart toggle button with aria-label "תצוגת עמודות"', () => {
    render(<RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />);
    expect(screen.getByLabelText('תצוגת עמודות')).toBeInTheDocument();
  });

  it('line toggle button has active styling by default', () => {
    render(<RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />);
    const lineButton = screen.getByLabelText('תצוגת קו');
    expect(lineButton.className).toContain('bg-primary/10');
  });

  it('clicking bar toggle switches to bar mode', async () => {
    const user = userEvent.setup();
    render(<RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />);
    const lineButton = screen.getByLabelText('תצוגת קו');
    const barButton = screen.getByLabelText('תצוגת עמודות');

    await user.click(barButton);

    expect(barButton.className).toContain('bg-primary/10');
    expect(lineButton.className).not.toContain('bg-primary/10');
  });

  it('chart renders with SVG element present', () => {
    const { container } = render(
      <RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('falls back to buildChartData when ratingHistory is empty', () => {
    const { container } = render(
      <RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={[]} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('uses ratingHistory data when provided', () => {
    const { container } = render(
      <RatingChart tournaments={mockTournaments} currentRating={currentRating} ratingHistory={mockRatingHistory} />,
    );
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});

describe('buildChartData', () => {
  it('sorts tournaments chronologically (oldest first)', () => {
    const result = buildChartData(mockTournaments, currentRating);
    const dates = result.map((p) => p.date);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('reconstructs historical ratings from current rating and changes', () => {
    // Non-pending changes: -3.0 + 12.5 + (-5.2) + 8.0 = 12.3
    // Starting rating = 1500 - 12.3 = 1487.7
    // After tournament 1 (2025-06-05, -3.0): 1487.7 + (-3.0) = 1484.7 -> 1485
    // After tournament 2 (2025-09-10, +12.5): 1484.7 + 12.5 = 1497.2 -> 1497
    // After tournament 3 (2025-12-01, -5.2): 1497.2 + (-5.2) = 1492.0 -> 1492
    // After tournament 4 (2026-01-15, +8.0): 1492.0 + 8.0 = 1500.0 -> 1500
    // Pending (2026-03-20, 0): running stays 1500.0 -> 1500
    const result = buildChartData(mockTournaments, currentRating);
    expect(result[0].rating).toBe(1485); // after first non-pending change
    expect(result[result.length - 2].rating).toBe(1500); // after last non-pending change
    expect(result[result.length - 1].rating).toBe(1500); // pending uses running rating
  });

  it('excludes pending tournaments from rating calculation but includes as points', () => {
    const result = buildChartData(mockTournaments, currentRating);
    // Pending tournament should still appear as a data point
    const pendingPoint = result.find((p) => p.tournament === 'טורניר פורים');
    expect(pendingPoint).toBeDefined();
    // But its rating should be same as previous non-pending
    expect(pendingPoint!.rating).toBe(1500);
  });
});

describe('formatMonthYear', () => {
  it('converts "2026-01-15" to "ינו \'26"', () => {
    expect(formatMonthYear('2026-01-15')).toBe("ינו '26");
  });

  it('converts "2025-12-01" to "דצמ \'25"', () => {
    expect(formatMonthYear('2025-12-01')).toBe("דצמ '25");
  });
});
