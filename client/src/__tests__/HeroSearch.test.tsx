import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { HeroSearch } from '../components/search/HeroSearch';

function renderHeroSearch() {
  const router = createMemoryRouter(
    [
      { path: '/', element: <HeroSearch /> },
      { path: '/player/:id', element: <div>Player Page</div> },
    ],
    { initialEntries: ['/'] },
  );
  return { router, ...render(<RouterProvider router={router} />) };
}

describe('HeroSearch', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders search input with placeholder "הזינו מספר שחקן"', () => {
    renderHeroSearch();
    expect(screen.getByPlaceholderText('הזינו מספר שחקן')).toBeInTheDocument();
  });

  it('renders search button with text "חפש"', () => {
    renderHeroSearch();
    expect(screen.getByRole('button', { name: /חפש/ })).toBeInTheDocument();
  });

  it('search button is disabled when input is empty', () => {
    renderHeroSearch();
    const button = screen.getByRole('button', { name: /חפש/ });
    expect(button).toBeDisabled();
  });

  it('search button is disabled when input is non-numeric', async () => {
    const user = userEvent.setup();
    renderHeroSearch();
    const input = screen.getByPlaceholderText('הזינו מספר שחקן');
    const button = screen.getByRole('button', { name: /חפש/ });

    await user.type(input, 'abc');
    expect(button).toBeDisabled();
  });

  it('search button is enabled when input is a valid numeric ID', async () => {
    const user = userEvent.setup();
    renderHeroSearch();
    const input = screen.getByPlaceholderText('הזינו מספר שחקן');
    const button = screen.getByRole('button', { name: /חפש/ });

    await user.type(input, '205001');
    expect(button).not.toBeDisabled();
  });

  it('submitting valid ID navigates to /player/:id', async () => {
    const user = userEvent.setup();
    const { router } = renderHeroSearch();
    const input = screen.getByPlaceholderText('הזינו מספר שחקן');
    const button = screen.getByRole('button', { name: /חפש/ });

    await user.type(input, '205001');
    await user.click(button);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/player/205001');
    });
  });

  it('input has inputMode="numeric"', () => {
    renderHeroSearch();
    const input = screen.getByPlaceholderText('הזינו מספר שחקן');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });
});
