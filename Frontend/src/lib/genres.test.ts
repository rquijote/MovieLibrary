import { describe, expect, it, vi } from 'vitest';
import { fetchGenreRows } from './genres';
import type { MovieDto } from '../types/media';

const genre = { id: 30001, name: 'Cache test' };
const movie: MovieDto = {
  id: 1,
  title: 'Cached movie',
  original_title: 'Cached movie',
  overview: '',
  poster_path: null,
  backdrop_path: null,
  release_date: '2026-01-01',
  original_language: 'en',
  vote_average: 7,
  vote_count: 100,
  popularity: 1,
  video: false,
  genre_ids: [genre.id],
};

describe('genre row caching', () => {
  it('reuses a completed genre response', async () => {
    const fetchResults = vi.fn(async () => ({ results: [movie] }));
    const buildEndpoint = () => '/api/test/genres/cache-completed';

    const first = await fetchGenreRows([genre], buildEndpoint, fetchResults);
    const second = await fetchGenreRows([genre], buildEndpoint, fetchResults);

    expect(fetchResults).toHaveBeenCalledTimes(1);
    expect(first).toEqual(second);
  });

  it('deduplicates concurrent requests for the same genre endpoint', async () => {
    let resolveRequest: ((value: { results: MovieDto[] }) => void) | undefined;
    const fetchResults = vi.fn(() => new Promise<{ results: MovieDto[] }>((resolve) => {
      resolveRequest = resolve;
    }));
    const buildEndpoint = () => '/api/test/genres/cache-concurrent';

    const first = fetchGenreRows([genre], buildEndpoint, fetchResults);
    const second = fetchGenreRows([genre], buildEndpoint, fetchResults);

    expect(fetchResults).toHaveBeenCalledTimes(1);
    resolveRequest?.({ results: [movie] });
    await expect(Promise.all([first, second])).resolves.toHaveLength(2);
  });

  it('emits a completed genre before slower selected genres finish', async () => {
    const slowerGenre = { id: 30002, name: 'Slow cache test' };
    let resolveSlowRequest: ((value: { results: MovieDto[] }) => void) | undefined;
    const fetchResults = vi.fn((endpoint: string) => endpoint.endsWith('/fast')
      ? Promise.resolve({ results: [movie] })
      : new Promise<{ results: MovieDto[] }>((resolve) => {
          resolveSlowRequest = resolve;
        }));
    const onGroup = vi.fn();
    const pendingRows = fetchGenreRows(
      [genre, slowerGenre],
      (genreId) => genreId === genre.id ? '/api/test/genres/fast' : '/api/test/genres/slow',
      fetchResults,
      onGroup,
    );

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onGroup).toHaveBeenCalledTimes(1);
    expect(onGroup).toHaveBeenCalledWith({ genre, items: [movie] });

    resolveSlowRequest?.({ results: [movie] });
    await expect(pendingRows).resolves.toHaveLength(2);
  });
});
