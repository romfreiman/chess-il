import { render, screen } from '@testing-library/react';
import type { RatingHistoryEntry } from '@shared/types';

// Per-file mock: ResponsiveContainer must clone children with width/height
// so Recharts charts render their SVG content in jsdom
vi.mock('recharts', async () => {
  const React = await import('react');
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.createElement(
        'div',
        { style: { width: 500, height: 300 } },
        React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, { width: 500, height: 300 })
          : children,
      ),
  };
});

import { CompareChart, mergeRatingHistories } from '../components/compare/CompareChart';
import { mockRatingHistory, mockRatingHistoryB } from '../test/fixtures/playerData';

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

    // Check that the chart container has the correct aria-label
    const chartDiv = container.querySelector('[aria-label]');
    expect(chartDiv).toBeInTheDocument();
    expect(chartDiv!.getAttribute('aria-label')).toContain('השוואת דירוג');

    // Recharts renders each Area as a g.recharts-area element
    const areas = container.querySelectorAll('.recharts-area');
    expect(areas).toHaveLength(2);
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

    const html = container.innerHTML;

    // Should have unique gradient IDs, NOT "ratingGradient"
    expect(html).toContain('ratingGradientA');
    expect(html).toContain('ratingGradientB');
    // Should not contain the old single-chart gradient ID (without A/B suffix)
    // But it's a substring of A/B, so check for exact id attribute
    expect(html).not.toMatch(/id="ratingGradient"[^A-Z]/);
  });
});
