import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlayerPicker } from '../components/compare/PlayerPicker';
import type { SavedPlayer } from '../lib/types';

const savedPlayers: SavedPlayer[] = [
  { id: 205001, name: 'אנדי פריימן', rating: 1542, club: 'מכבי תל אביב', savedAt: '2026-04-20T12:00:00Z' },
  { id: 210498, name: 'דני כהן', rating: 1680, club: 'מכבי חיפה', savedAt: '2026-04-20T14:00:00Z' },
  { id: 300001, name: 'יוסי לוי', rating: 1400, club: null, savedAt: '2026-04-20T16:00:00Z' },
];

describe('PlayerPicker', () => {
  it('renders label text and placeholder option', () => {
    render(
      <PlayerPicker
        label="שחקן A"
        selectedId=""
        excludeId=""
        savedPlayers={savedPlayers}
        onChange={() => {}}
      />,
    );

    expect(screen.getByLabelText('שחקן A')).toBeInTheDocument();
    expect(screen.getByText('-- בחרו שחקן --')).toBeInTheDocument();
  });

  it('renders saved players as options', () => {
    render(
      <PlayerPicker
        label="שחקן A"
        selectedId=""
        excludeId=""
        savedPlayers={savedPlayers}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('אנדי פריימן (1542)')).toBeInTheDocument();
    expect(screen.getByText('דני כהן (1680)')).toBeInTheDocument();
    expect(screen.getByText('יוסי לוי (1400)')).toBeInTheDocument();
  });

  it('excludes the player matching excludeId from options', () => {
    render(
      <PlayerPicker
        label="שחקן A"
        selectedId=""
        excludeId="210498"
        savedPlayers={savedPlayers}
        onChange={() => {}}
      />,
    );

    expect(screen.getByText('אנדי פריימן (1542)')).toBeInTheDocument();
    expect(screen.queryByText('דני כהן (1680)')).not.toBeInTheDocument();
    expect(screen.getByText('יוסי לוי (1400)')).toBeInTheDocument();
  });

  it('calls onChange with selected player ID when user selects an option', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <PlayerPicker
        label="שחקן A"
        selectedId=""
        excludeId=""
        savedPlayers={savedPlayers}
        onChange={handleChange}
      />,
    );

    await user.selectOptions(screen.getByLabelText('שחקן A'), '210498');

    expect(handleChange).toHaveBeenCalledWith('210498');
  });

  it('shows only placeholder when no saved players provided', () => {
    render(
      <PlayerPicker
        label="שחקן B"
        selectedId=""
        excludeId=""
        savedPlayers={[]}
        onChange={() => {}}
      />,
    );

    const select = screen.getByLabelText('שחקן B') as HTMLSelectElement;
    // Only the disabled placeholder option should be present
    expect(select.options).toHaveLength(1);
    expect(select.options[0].textContent).toBe('-- בחרו שחקן --');
  });
});
