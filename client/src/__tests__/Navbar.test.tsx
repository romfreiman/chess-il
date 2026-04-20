import { screen } from '@testing-library/react';
import { renderWithRouter } from '../test/test-utils';
import { Navbar } from '../components/layout/Navbar';

describe('Navbar', () => {
  it('renders app name "Chess IL" with pawn character', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    expect(screen.getByText('Chess IL')).toBeInTheDocument();
    // Pawn character (♟ = &#9823;) rendered in a span
    expect(screen.getByText('\u265F')).toBeInTheDocument();
  });

  it('renders home link with aria-label "דף הבית"', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText('דף הבית')).toBeInTheDocument();
  });

  it('renders compare link with aria-label "השוואת שחקנים"', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText('השוואת שחקנים')).toBeInTheDocument();
  });

  it('disables compare link with opacity-40 and pointer-events-none when savedCount < 2', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    const compareLink = screen.getByLabelText('השוואת שחקנים');
    expect(compareLink).toHaveClass('opacity-40');
    expect(compareLink).toHaveClass('pointer-events-none');
  });

  it('enables compare link when savedCount >= 2', () => {
    renderWithRouter(
      <Navbar savedCount={3} theme="light" onThemeToggle={vi.fn()} />,
    );
    const compareLink = screen.getByLabelText('השוואת שחקנים');
    expect(compareLink).not.toHaveClass('opacity-40');
    expect(compareLink).not.toHaveClass('pointer-events-none');
  });

  it('renders ThemeToggle with aria-label "החלפת מצב תצוגה"', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText('החלפת מצב תצוגה')).toBeInTheDocument();
  });

  it('shows disabled tooltip on compare link when savedCount < 2', () => {
    renderWithRouter(
      <Navbar savedCount={0} theme="light" onThemeToggle={vi.fn()} />,
    );
    const compareLink = screen.getByLabelText('השוואת שחקנים');
    expect(compareLink).toHaveAttribute(
      'title',
      'שמרו לפחות 2 שחקנים כדי להשוות',
    );
  });
});
