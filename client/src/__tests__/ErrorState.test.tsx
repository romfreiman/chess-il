import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { ErrorState } from '../components/feedback/ErrorState';

describe('ErrorState', () => {
  it('renders not-found heading when errorType is not-found', () => {
    render(<ErrorState errorType="not-found" onRetry={vi.fn()} />);
    expect(screen.getByText('\u05E9\u05D7\u05E7\u05DF \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0')).toBeInTheDocument();
  });

  it('renders not-found body text', () => {
    render(<ErrorState errorType="not-found" onRetry={vi.fn()} />);
    expect(screen.getByText(/\u05DE\u05E1\u05E4\u05E8 \u05D4\u05E9\u05D7\u05E7\u05DF \u05E9\u05D4\u05D5\u05D6\u05DF \u05DC\u05D0 \u05E7\u05D9\u05D9\u05DD \u05D1\u05DE\u05E2\u05E8\u05DB\u05EA/)).toBeInTheDocument();
  });

  it('renders network error heading when errorType is network', () => {
    render(<ErrorState errorType="network" onRetry={vi.fn()} />);
    expect(screen.getByText('\u05E9\u05D2\u05D9\u05D0\u05D4 \u05D1\u05D8\u05E2\u05D9\u05E0\u05EA \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD')).toBeInTheDocument();
  });

  it('renders network error body text', () => {
    render(<ErrorState errorType="network" onRetry={vi.fn()} />);
    expect(screen.getByText(/\u05DC\u05D0 \u05D4\u05E6\u05DC\u05D7\u05E0\u05D5 \u05DC\u05D4\u05EA\u05D7\u05D1\u05E8 \u05DC\u05E9\u05E8\u05EA/)).toBeInTheDocument();
  });

  it('renders retry button with text "\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1"', () => {
    render(<ErrorState errorType="network" onRetry={vi.fn()} />);
    expect(screen.getByText('\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1')).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorState errorType="network" onRetry={onRetry} />);
    fireEvent.click(screen.getByText('\u05E0\u05E1\u05D4 \u05E9\u05D5\u05D1'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('renders AlertCircle icon', () => {
    const { container } = render(<ErrorState errorType="network" onRetry={vi.fn()} />);
    // lucide-react renders SVG with class containing lucide
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });
});
