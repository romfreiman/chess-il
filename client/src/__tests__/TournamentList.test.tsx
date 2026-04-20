import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentList } from '../components/dashboard/TournamentList';
import { mockTournaments } from '../test/fixtures/playerData';
import type { TournamentEntry } from '@shared/types';

describe('TournamentList', () => {
  it('renders section heading "תוצאות טורנירים"', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // Desktop heading
    expect(screen.getAllByText('תוצאות טורנירים').length).toBeGreaterThanOrEqual(1);
  });

  it('shows first 10 tournaments on page 1 (given 12 mock tournaments)', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // First tournament (index 0) should be visible
    expect(screen.getAllByText(mockTournaments[0].tournamentName).length).toBeGreaterThanOrEqual(1);
    // 10th tournament (index 9) should be visible
    expect(screen.getAllByText(mockTournaments[9].tournamentName).length).toBeGreaterThanOrEqual(1);
    // 11th tournament (index 10) should NOT be visible
    expect(screen.queryByText(mockTournaments[10].tournamentName)).not.toBeInTheDocument();
  });

  it('clicking "הבא" button shows next page of tournaments', async () => {
    const user = userEvent.setup();
    render(<TournamentList tournaments={mockTournaments} />);

    const nextButton = screen.getByRole('button', { name: /הבא/ });
    await user.click(nextButton);

    // 11th tournament should now be visible
    expect(screen.getAllByText(mockTournaments[10].tournamentName).length).toBeGreaterThanOrEqual(1);
  });

  it('clicking "הקודם" button returns to previous page', async () => {
    const user = userEvent.setup();
    render(<TournamentList tournaments={mockTournaments} />);

    const nextButton = screen.getByRole('button', { name: /הבא/ });
    await user.click(nextButton);

    const prevButton = screen.getByRole('button', { name: /הקודם/ });
    await user.click(prevButton);

    // First tournament should be visible again
    expect(screen.getAllByText(mockTournaments[0].tournamentName).length).toBeGreaterThanOrEqual(1);
  });

  it('"הקודם" button is disabled on first page', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    const prevButton = screen.getByRole('button', { name: /הקודם/ });
    expect(prevButton).toBeDisabled();
  });

  it('"הבא" button is disabled on last page', async () => {
    const user = userEvent.setup();
    render(<TournamentList tournaments={mockTournaments} />);

    const nextButton = screen.getByRole('button', { name: /הבא/ });
    await user.click(nextButton);

    // Now on last page (2 of 2), next should be disabled
    expect(nextButton).toBeDisabled();
  });

  it('page indicator shows "עמוד 1 מתוך 2" format', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    expect(screen.getByText('עמוד 1 מתוך 2')).toBeInTheDocument();
  });

  it('tournament name renders as a link with target="_blank"', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    const links = screen.getAllByRole('link', { name: mockTournaments[0].tournamentName });
    expect(links.length).toBeGreaterThanOrEqual(1);
    expect(links[0]).toHaveAttribute('target', '_blank');
  });

  it('tournament name link has rel="noopener noreferrer"', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    const links = screen.getAllByRole('link', { name: mockTournaments[0].tournamentName });
    expect(links[0]).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('positive rating change has text-positive class', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // mockTournaments[0] has ratingChange: 18 (positive)
    const positiveElements = screen.getAllByText('+18');
    expect(positiveElements.length).toBeGreaterThanOrEqual(1);
    expect(positiveElements[0].closest('.text-positive') || positiveElements[0].classList.contains('text-positive') || positiveElements[0].parentElement?.classList.contains('text-positive')).toBeTruthy();
  });

  it('negative rating change has text-negative class', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // mockTournaments[3] has ratingChange: -15 (negative)
    const negativeElements = screen.getAllByText('-15');
    expect(negativeElements.length).toBeGreaterThanOrEqual(1);
    // The parent span with inline-flex should have text-negative
    const el = negativeElements[0].closest('[class*="text-negative"]') || negativeElements[0];
    expect(el.className).toContain('text-negative');
  });

  it('positive change shows TrendingUp icon', () => {
    const { container } = render(<TournamentList tournaments={mockTournaments} />);
    // TrendingUp renders as an SVG with lucide class
    // Check that there's a TrendingUp-like SVG near a positive change
    const positiveSpans = container.querySelectorAll('.text-positive');
    expect(positiveSpans.length).toBeGreaterThanOrEqual(1);
    // At least one should contain an SVG (the TrendingUp icon)
    const hasSvg = Array.from(positiveSpans).some(span => span.querySelector('svg'));
    expect(hasSvg).toBe(true);
  });

  it('negative change shows TrendingDown icon', () => {
    const { container } = render(<TournamentList tournaments={mockTournaments} />);
    const negativeSpans = container.querySelectorAll('.text-negative');
    expect(negativeSpans.length).toBeGreaterThanOrEqual(1);
    const hasSvg = Array.from(negativeSpans).some(span => span.querySelector('svg'));
    expect(hasSvg).toBe(true);
  });

  it('pending tournament shows "בהמתנה" badge', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // mockTournaments[2] is pending
    expect(screen.getAllByText('בהמתנה').length).toBeGreaterThanOrEqual(1);
  });

  it('most recent tournament (index 0) shows "חדש" badge', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    expect(screen.getAllByText('חדש').length).toBeGreaterThanOrEqual(1);
  });

  it('W/D/L chips render with correct colors', () => {
    const { container } = render(<TournamentList tournaments={mockTournaments} />);
    // Check for bg-positive/10 class on win chips
    const positiveChips = container.querySelectorAll('[class*="bg-positive"]');
    expect(positiveChips.length).toBeGreaterThanOrEqual(1);
    // Check for bg-negative/10 class on loss chips
    const negativeChips = container.querySelectorAll('[class*="bg-negative"]');
    expect(negativeChips.length).toBeGreaterThanOrEqual(1);
  });

  it('date displays in DD/MM/YY format', () => {
    render(<TournamentList tournaments={mockTournaments} />);
    // mockTournaments[0].startDate is '2026-04-10' -> should render as '10/04/26'
    expect(screen.getAllByText('10/04/26').length).toBeGreaterThanOrEqual(1);
  });

  it('desktop table is visible on md+ (has "hidden md:block" class)', () => {
    const { container } = render(<TournamentList tournaments={mockTournaments} />);
    const desktopTable = container.querySelector('.hidden.md\\:block');
    expect(desktopTable).toBeInTheDocument();
  });

  it('mobile cards are visible on mobile (has "block md:hidden" class)', () => {
    const { container } = render(<TournamentList tournaments={mockTournaments} />);
    const mobileCards = container.querySelector('.block.md\\:hidden');
    expect(mobileCards).toBeInTheDocument();
  });

  it('pagination resets to page 1 when tournaments prop changes', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TournamentList tournaments={mockTournaments} />);

    // Navigate to page 2
    const nextButton = screen.getByRole('button', { name: /הבא/ });
    await user.click(nextButton);
    expect(screen.getByText('עמוד 2 מתוך 2')).toBeInTheDocument();

    // Change tournaments prop
    const newTournaments = mockTournaments.slice(0, 5);
    rerender(<TournamentList tournaments={newTournaments} />);

    // Should not show pagination at all (only 5 items, no second page)
    expect(screen.queryByText(/עמוד/)).not.toBeInTheDocument();
  });

  it('empty tournaments array shows "אין נתוני טורנירים" message', () => {
    render(<TournamentList tournaments={[]} />);
    expect(screen.getByText('אין נתוני טורנירים')).toBeInTheDocument();
  });
});
