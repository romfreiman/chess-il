import { render, screen } from '@testing-library/react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { mockPlayerInfo, mockTournaments } from '../test/fixtures/playerData';
import type { PlayerInfo, TournamentEntry } from '@shared/types';

function renderMetricCards(
  playerOverrides?: Partial<PlayerInfo>,
  tournaments?: TournamentEntry[],
) {
  const player = { ...mockPlayerInfo, ...playerOverrides };
  const tourneys = tournaments ?? mockTournaments;
  return render(<MetricCards player={player} tournaments={tourneys} />);
}

describe('MetricCards', () => {
  it('renders current rating value "1542"', () => {
    renderMetricCards();
    expect(screen.getByText('1542')).toBeInTheDocument();
  });

  it('renders expected rating "\u05E6\u05E4\u05D5\u05D9: 1490"', () => {
    renderMetricCards();
    expect(screen.getByText('\u05E6\u05E4\u05D5\u05D9: 1490')).toBeInTheDocument();
  });

  it('renders rank as "#150"', () => {
    renderMetricCards();
    expect(screen.getByText('#150')).toBeInTheDocument();
  });

  it('renders tournament count matching tournaments.length', () => {
    renderMetricCards();
    expect(screen.getByText(String(mockTournaments.length))).toBeInTheDocument();
  });

  it('renders cumulative rating change with correct sign and value', () => {
    // Sum of all non-pending ratingChange values:
    // 18 + 12 + (-15) + 5 + 0 + 22 + (-8) + 25 + (-20) + 7 + 16 = 62
    renderMetricCards();
    expect(screen.getByText('+62')).toBeInTheDocument();
  });

  it('cumulative change positive value has text-positive class', () => {
    renderMetricCards();
    const changeEl = screen.getByText('+62');
    expect(changeEl.closest('[class*="text-positive"]') || changeEl.className).toContain('text-positive');
  });

  it('cumulative change negative value has text-negative class', () => {
    // Create tournaments with only negative changes
    const negTournaments: TournamentEntry[] = [
      {
        startDate: '2026-01-01',
        updateDate: '2026-01-02',
        isPending: false,
        tournamentName: 'Test',
        tournamentUrl: null,
        games: 5,
        points: 1,
        performance: 1300,
        wins: 1,
        losses: 4,
        draws: 0,
        ratingChange: -25,
      },
    ];
    renderMetricCards(undefined, negTournaments);
    const changeEl = screen.getByText('-25');
    expect(changeEl.closest('[class*="text-negative"]') || changeEl.className).toContain('text-negative');
  });

  it('renders "\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E0\u05D5\u05DB\u05D7\u05D9" label', () => {
    renderMetricCards();
    expect(screen.getByText('\u05D3\u05D9\u05E8\u05D5\u05D2 \u05E0\u05D5\u05DB\u05D7\u05D9')).toBeInTheDocument();
  });

  it('renders "\u05D3\u05D9\u05E8\u05D5\u05D2 \u05D0\u05E8\u05E6\u05D9" label', () => {
    renderMetricCards();
    expect(screen.getByText('\u05D3\u05D9\u05E8\u05D5\u05D2 \u05D0\u05E8\u05E6\u05D9')).toBeInTheDocument();
  });

  it('renders "\u05D8\u05D5\u05E8\u05E0\u05D9\u05E8\u05D9\u05DD" label', () => {
    renderMetricCards();
    expect(screen.getByText('\u05D8\u05D5\u05E8\u05E0\u05D9\u05E8\u05D9\u05DD')).toBeInTheDocument();
  });

  it('renders "\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05E6\u05D8\u05D1\u05E8" label', () => {
    renderMetricCards();
    expect(screen.getByText('\u05E9\u05D9\u05E0\u05D5\u05D9 \u05DE\u05E6\u05D8\u05D1\u05E8')).toBeInTheDocument();
  });

  it('renders rank as "\u2014" when rank is null', () => {
    renderMetricCards({ rank: null });
    expect(screen.getByText('\u2014')).toBeInTheDocument();
  });
});
