import { render, screen } from '@testing-library/react';
import { CompareChart, mergeRatingHistories } from '../components/compare/CompareChart';
import { mockRatingHistory, mockRatingHistoryB } from '../test/fixtures/playerData';
import type { RatingHistoryEntry } from '@shared/types';

describe('mergeRatingHistories', () => {
  it('merges two histories correctly with overlapping and non-overlapping dates', () => {
    const merged = mergeRatingHistories(mockRatingHistory, mockRatingHistoryB);

    // All unique dates from both histories should be present
    const allDates = new Set([
      ...mockRatingHistory.map((e) => e.date),
      ...mockRatingHistoryB.map((e) => e.date),
    ]);
    expect(merged).toHaveLength(allDates.size);

    // Check overlapping date '2025-09-10' -- both should have values
    const overlap = merged.find((p) => p.date === '2025-09-10');
    expect(overlap).toBeDefined();
    expect(overlap!.ratingA).toBe(1484);
    expect(overlap!.ratingB).toBe(1664);

    // Check non-overlapping date '2025-05-05' -- only Player A
    const onlyA = merged.find((p) => p.date === '2025-05-05');
    expect(onlyA).toBeDefined();
    expect(onlyA!.ratingA).toBe(1480);
    expect(onlyA!.ratingB).toBeNull();
  });

  it('returns empty array when both inputs are empty', () => {
    const merged = mergeRatingHistories([], []);
    expect(merged).toEqual([]);
  });

  it('handles one empty history with null for the missing player', () => {
    const historyA: RatingHistoryEntry[] = [
      { date: '2025-09-10', rating: 1484 },
      { date: '2025-11-15', rating: 1506 },
    ];

    const merged = mergeRatingHistories(historyA, []);
    expect(merged).toHaveLength(2);
    expect(merged[0].ratingA).toBe(1484);
    expect(merged[0].ratingB).toBeNull();
    expect(merged[1].ratingA).toBe(1506);
    expect(merged[1].ratingB).toBeNull();
  });

  it('sorts output chronologically by date', () => {
    const historyA: RatingHistoryEntry[] = [
      { date: '2026-01-10', rating: 1496 },
      { date: '2025-05-05', rating: 1480 },
    ];
    const historyB: RatingHistoryEntry[] = [
      { date: '2025-09-10', rating: 1664 },
    ];

    const merged = mergeRatingHistories(historyA, historyB);
    const dates = merged.map((p) => p.date);
    expect(dates).toEqual(['2025-05-05', '2025-09-10', '2026-01-10']);
  });
});

describe('CompareChart', () => {
  it('renders chart heading', () => {
    render(
      <CompareChart
        playerAName="אנדי פריימן"
        playerBName="דני כהן"
        dataA={mockRatingHistory}
        dataB={mockRatingHistoryB}
      />,
    );

    expect(screen.getByText('השוואת דירוג')).toBeInTheDocument();
  });

  it('renders legend with both player names', () => {
    render(
      <CompareChart
        playerAName="אנדי פריימן"
        playerBName="דני כהן"
        dataA={mockRatingHistory}
        dataB={mockRatingHistoryB}
      />,
    );

    expect(screen.getByText('אנדי פריימן')).toBeInTheDocument();
    expect(screen.getByText('דני כהן')).toBeInTheDocument();
  });

  it('renders AreaChart with two Area elements', () => {
    const { container } = render(
      <CompareChart
        playerAName="אנדי פריימן"
        playerBName="דני כהן"
        dataA={mockRatingHistory}
        dataB={mockRatingHistoryB}
      />,
    );

    // Recharts renders Area components inside the chart -- verify both dataKeys exist
    // The AreaChart should have two Area children with ratingA and ratingB dataKeys
    const areas = container.querySelectorAll('.recharts-area');
    expect(areas.length).toBe(2);
  });

  it('uses unique gradient IDs (ratingGradientA and ratingGradientB)', () => {
    const { container } = render(
      <CompareChart
        playerAName="אנדי פריימן"
        playerBName="דני כהן"
        dataA={mockRatingHistory}
        dataB={mockRatingHistoryB}
      />,
    );

    // Should have unique gradient IDs, NOT "ratingGradient"
    expect(container.querySelector('#ratingGradientA')).toBeInTheDocument();
    expect(container.querySelector('#ratingGradientB')).toBeInTheDocument();
    expect(container.querySelector('#ratingGradient')).not.toBeInTheDocument();
  });
});
