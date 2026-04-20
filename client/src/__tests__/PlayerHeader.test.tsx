import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerHeader } from '../components/dashboard/PlayerHeader';
import { mockPlayerInfo } from '../test/fixtures/playerData';
import type { PlayerInfo } from '@shared/types';

function renderHeader(overrides?: Partial<PlayerInfo>, onRefresh = vi.fn()) {
  const player = { ...mockPlayerInfo, ...overrides };
  return { onRefresh, ...render(
    <PlayerHeader
      player={player}
      onRefresh={onRefresh}
      isSaved={false}
      isFull={false}
      onSave={vi.fn()}
      onUnsave={vi.fn()}
    />
  ) };
}

describe('PlayerHeader', () => {
  it('renders player name "\u05D0\u05E0\u05D3\u05D9 \u05E4\u05E8\u05D9\u05D9\u05DE\u05DF"', () => {
    renderHeader();
    expect(screen.getByText('\u05D0\u05E0\u05D3\u05D9 \u05E4\u05E8\u05D9\u05D9\u05DE\u05DF')).toBeInTheDocument();
  });

  it('renders club name "\u05DE\u05DB\u05D1\u05D9 \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1"', () => {
    renderHeader();
    expect(screen.getByText('\u05DE\u05DB\u05D1\u05D9 \u05EA\u05DC \u05D0\u05D1\u05D9\u05D1')).toBeInTheDocument();
  });

  it('renders birth year as "\u05E9\u05E0\u05EA \u05DC\u05D9\u05D3\u05D4: 1990"', () => {
    renderHeader();
    expect(screen.getByText('\u05E9\u05E0\u05EA \u05DC\u05D9\u05D3\u05D4: 1990')).toBeInTheDocument();
  });

  it('renders grade badge with text "\u05DE\u05D3\u05E8\u05D2 3" and primary color styling', () => {
    renderHeader();
    const badge = screen.getByText('\u05DE\u05D3\u05E8\u05D2 3');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-primary');
    expect(badge.className).toContain('bg-primary/10');
  });

  it('renders FIDE link with href "https://ratings.fide.com/profile/2800012" and target="_blank"', () => {
    renderHeader();
    const link = screen.getByText('FIDE').closest('a');
    expect(link).toHaveAttribute('href', 'https://ratings.fide.com/profile/2800012');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('does NOT render FIDE link when fideId is null', () => {
    renderHeader({ fideId: null });
    expect(screen.queryByText('FIDE')).not.toBeInTheDocument();
  });

  it('renders refresh button with aria-label "\u05E8\u05E2\u05E0\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD"', () => {
    renderHeader();
    expect(screen.getByRole('button', { name: '\u05E8\u05E2\u05E0\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD' })).toBeInTheDocument();
  });

  it('calls onRefresh when refresh button is clicked', async () => {
    const user = userEvent.setup();
    const { onRefresh } = renderHeader();

    await user.click(screen.getByRole('button', { name: '\u05E8\u05E2\u05E0\u05DF \u05E0\u05EA\u05D5\u05E0\u05D9\u05DD' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('does NOT render birth year when birthYear is null', () => {
    renderHeader({ birthYear: null });
    expect(screen.queryByText(/\u05E9\u05E0\u05EA \u05DC\u05D9\u05D3\u05D4/)).not.toBeInTheDocument();
  });
});
