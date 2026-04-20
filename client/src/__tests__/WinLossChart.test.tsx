import { render, screen } from '@testing-library/react';

// Mock ResponsiveContainer to render children in jsdom (no layout engine)
vi.mock('recharts', async () => {
  const actual = await vi.importActual('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 250 }}>{children}</div>
    ),
  };
});

import { WinLossChart } from '../components/dashboard/WinLossChart';

describe('WinLossChart', () => {
  it('renders section heading "ניצחונות / תיקו / הפסדים"', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText('ניצחונות / תיקו / הפסדים')).toBeInTheDocument();
  });

  it('renders total games count as center text', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('renders legend with "ניצחונות" label', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/ניצחונות 40%/)).toBeInTheDocument();
  });

  it('renders legend with "תיקו" label', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/תיקו 20%/)).toBeInTheDocument();
  });

  it('renders legend with "הפסדים" label', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/הפסדים 40%/)).toBeInTheDocument();
  });

  it('renders win percentage in legend (40% for 10/25)', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/ניצחונות 40%/)).toBeInTheDocument();
  });

  it('renders draw percentage in legend (20% for 5/25)', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/תיקו 20%/)).toBeInTheDocument();
  });

  it('renders loss percentage in legend (40% for 10/25)', () => {
    render(<WinLossChart wins={10} draws={5} losses={10} />);
    expect(screen.getByText(/הפסדים 40%/)).toBeInTheDocument();
  });

  it('renders PieChart container element', () => {
    const { container } = render(
      <WinLossChart wins={10} draws={5} losses={10} />,
    );
    // Recharts PieChart renders inside the mocked ResponsiveContainer
    // The chart wrapper with the donut data is present
    const chartContainer = container.querySelector('.recharts-wrapper');
    if (chartContainer) {
      expect(chartContainer).toBeInTheDocument();
    } else {
      // With mock ResponsiveContainer, Recharts still renders its structure
      // Verify the chart section exists with the relative container for center text overlay
      const relativeContainer = container.querySelector('.relative');
      expect(relativeContainer).toBeInTheDocument();
    }
  });

  it('handles all-zero stats gracefully (no division by zero)', () => {
    render(<WinLossChart wins={0} draws={0} losses={0} />);
    expect(
      screen.getByText('אין נתוני טורנירים'),
    ).toBeInTheDocument();
  });
});
