import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { Toast } from '../components/feedback/Toast';

describe('Toast', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders message text when visible', () => {
    render(<Toast message="ניתן לשמור עד 10 שחקנים" visible={true} onDismiss={vi.fn()} />);
    expect(screen.getByText('ניתן לשמור עד 10 שחקנים')).toBeInTheDocument();
  });

  it('has role="status" for accessibility', () => {
    render(<Toast message="Test" visible={true} onDismiss={vi.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('calls onDismiss after 3 seconds', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test" visible={true} onDismiss={onDismiss} />);
    vi.advanceTimersByTime(3000);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('does not call onDismiss before 3 seconds', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test" visible={true} onDismiss={onDismiss} />);
    vi.advanceTimersByTime(2999);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});
