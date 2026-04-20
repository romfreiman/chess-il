import { renderHook, waitFor, act } from '@testing-library/react';
import { usePlayer } from '../hooks/usePlayer';
import { mockApiResponse } from '../test/fixtures/playerData';

const mockFetch = vi.fn();
global.fetch = mockFetch;

function createFetchResponse(data: unknown, ok = true, status = 200) {
  return Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(data),
  });
}

describe('usePlayer', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('calls fetch with /api/player/{id} on mount', async () => {
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    renderHook(() => usePlayer('205001'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/player/205001',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it('sets loading to true initially, then false after response', async () => {
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    const { result } = renderHook(() => usePlayer('205001'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('sets data from successful API response', async () => {
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    const { result } = renderHook(() => usePlayer('205001'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockApiResponse);
    });

    expect(result.current.error).toBeNull();
  });

  it('sets error on non-ok response', async () => {
    mockFetch.mockReturnValue(
      createFetchResponse(
        { error: 'Not Found', message: '\u05E9\u05D7\u05E7\u05DF \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0', statusCode: 404 },
        false,
        404,
      ),
    );

    const { result } = renderHook(() => usePlayer('999999'));

    await waitFor(() => {
      expect(result.current.error).toBe('\u05E9\u05D7\u05E7\u05DF \u05DC\u05D0 \u05E0\u05DE\u05E6\u05D0');
    });

    expect(result.current.data).toBeNull();
  });

  it('sets error on network failure', async () => {
    mockFetch.mockReturnValue(Promise.reject(new Error('Network error')));

    const { result } = renderHook(() => usePlayer('205001'));

    await waitFor(() => {
      expect(result.current.error).toBe('Network error');
    });

    expect(result.current.data).toBeNull();
  });

  it('refresh calls fetch with ?force=true', async () => {
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    const { result } = renderHook(() => usePlayer('205001'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockClear();
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    act(() => {
      result.current.refresh();
    });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/player/205001?force=true',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });

  it('re-fetches when id changes', async () => {
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    const { result, rerender } = renderHook(
      ({ id }) => usePlayer(id),
      { initialProps: { id: '205001' } },
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    mockFetch.mockClear();
    mockFetch.mockReturnValue(createFetchResponse(mockApiResponse));

    rerender({ id: '210498' });

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/player/210498',
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });
  });
});
