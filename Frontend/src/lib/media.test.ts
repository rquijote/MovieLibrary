import { describe, expect, it } from 'vitest';
import {
  buildFilteredDiscoveryEndpoint,
  buildMovieDiscoveryEndpoint,
  buildPagedEndpoint,
  buildTvShowDiscoveryEndpoint,
  filterMediaItems,
  fetchAllMediaPages,
  fetchDiscoveryYearBounds,
  getMediaYearBounds,
  getAccessiblePageCount,
  filterMediaWithPoster,
  prioritizeMediaWithPoster,
  paginateFilteredMedia,
} from './media';
import type { MovieDto, TvShowDto } from '../types/media';

describe('expanded media filters', () => {
  it('combines movie genre and year with existing category constraints and pagination', () => {
    const endpoint = buildFilteredDiscoveryEndpoint(
      buildMovieDiscoveryEndpoint('popular', new Date(2026, 10, 2), 28), 'movies', 2025,
    );
    const url = new URL(buildPagedEndpoint(endpoint, 37), 'https://example.test');
    expect(url.searchParams.get('WithGenres')).toBe('28');
    expect(url.searchParams.get('PrimaryReleaseYear')).toBe('2025');
    expect(url.searchParams.get('PrimaryReleaseDateLte')).toBe('2026-11-02');
    expect(url.searchParams.get('VoteCountGte')).toBe('250');
    expect(url.searchParams.get('page')).toBe('37');
  });

  it('uses first-air year for TV and preserves on-air status', () => {
    const endpoint = buildFilteredDiscoveryEndpoint(
      buildTvShowDiscoveryEndpoint('on-the-air', new Date(2026, 10, 2), 18), 'tvshows', 2024,
    );
    const params = new URL(endpoint, 'https://example.test').searchParams;
    expect(params.get('FirstAirDateYear')).toBe('2024');
    expect(params.get('WithGenres')).toBe('18');
    expect(params.get('WithStatus')).toBe('0');
    expect(params.has('PrimaryReleaseYear')).toBe(false);
  });

  it('leaves discovery defaults unchanged without a year filter', () => {
    const endpoint = buildMovieDiscoveryEndpoint('upcoming', new Date(2026, 10, 2));
    expect(buildFilteredDiscoveryEndpoint(endpoint, 'movies')).toBe(endpoint);
  });

  it('uses inclusive date bounds for movie ranges without widening category dates', () => {
    const endpoint = buildMovieDiscoveryEndpoint('popular', new Date(2026, 10, 2), 28);
    const params = new URL(buildFilteredDiscoveryEndpoint(endpoint, 'movies', { min: 1990, max: 2030 }),
      'https://example.test').searchParams;
    expect(params.get('PrimaryReleaseDateGte')).toBe('1990-01-01');
    expect(params.get('PrimaryReleaseDateLte')).toBe('2026-11-02');
    expect(params.get('WithGenres')).toBe('28');
    expect(params.has('PrimaryReleaseYear')).toBe(false);
  });

  it('intersects TV ranges with both existing category date bounds', () => {
    const endpoint = buildTvShowDiscoveryEndpoint('top-rated', new Date(2026, 10, 2));
    const params = new URL(buildFilteredDiscoveryEndpoint(endpoint, 'tvshows', { min: 1990, max: 2024 }),
      'https://example.test').searchParams;
    expect(params.get('FirstAirDateGte')).toBe('2021-11-02');
    expect(params.get('FirstAirDateLte')).toBe('2024-12-31');
  });

  it('supports either open year boundary', () => {
    expect(buildFilteredDiscoveryEndpoint('/api/Discover/movies', 'movies', { max: 2000 }))
      .toBe('/api/Discover/movies?PrimaryReleaseDateLte=2000-12-31');
    expect(buildFilteredDiscoveryEndpoint('/api/Discover/tv', 'tvshows', { min: 1999 }))
      .toBe('/api/Discover/tv?FirstAirDateGte=1999-01-01');
  });

  const movie: MovieDto = {
    id: 1, title: 'Movie', original_title: 'Movie', overview: '', poster_path: null,
    backdrop_path: null, release_date: '2024-06-01', original_language: 'en',
    vote_average: 8, vote_count: 600, popularity: 1, video: false, genre_ids: [28, 18],
  };
  const show: TvShowDto = {
    id: 2, name: 'Show', original_name: 'Show', overview: '', poster_path: null,
    backdrop_path: null, first_air_date: '2025-01-01', original_language: 'en',
    vote_average: 8, vote_count: 600, popularity: 1, origin_country: [], genre_ids: [18],
  };

  it('finds discovery extremes beyond 500 pages with two global sorted queries', async () => {
    const calls: URLSearchParams[] = [];
    const bounds = await fetchDiscoveryYearBounds(
      '/api/Discover/movies?WithGenres=28&VoteCountGte=250&PrimaryReleaseDateLte=2026-11-04&SortBy=popularity.desc',
      'movies',
      async (endpoint) => {
        const params = new URL(endpoint, 'https://example.test').searchParams;
        calls.push(params);
        return {
          total_pages: 2000,
          results: [{ ...movie, release_date: params.get('SortBy')?.endsWith('.asc') ? '1895-01-01' : '2026-10-01' }],
        };
      },
    );
    expect(bounds).toEqual({ min: 1895, max: 2026 });
    expect(calls.map((params) => params.get('SortBy')))
      .toEqual(['primary_release_date.asc', 'primary_release_date.desc']);
    for (const params of calls) {
      expect(params.get('page')).toBe('1');
      expect(params.get('WithGenres')).toBe('28');
      expect(params.get('VoteCountGte')).toBe('250');
      expect(params.get('PrimaryReleaseDateLte')).toBe('2026-11-04');
      expect(params.get('PrimaryReleaseDateGte')).toBe('1000-01-01');
    }
  });

  it('preserves TV category bounds and status when finding first-air extremes', async () => {
    const calls: URLSearchParams[] = [];
    await fetchDiscoveryYearBounds(
      '/api/Discover/tv?FirstAirDateGte=2021-01-01&FirstAirDateLte=2026-01-01&WithStatus=0',
      'tvshows', async (endpoint) => {
        calls.push(new URL(endpoint, 'https://example.test').searchParams);
        return { results: [show] };
      },
    );
    expect(calls.map((params) => params.get('SortBy'))).toEqual(['first_air_date.asc', 'first_air_date.desc']);
    expect(calls.every((params) => params.get('FirstAirDateGte') === '2021-01-01'
      && params.get('FirstAirDateLte') === '2026-01-01' && params.get('WithStatus') === '0')).toBe(true);
  });

  it('does not present partial year bounds if one global query fails', async () => {
    await expect(fetchDiscoveryYearBounds('/api/Discover/movies', 'movies', async (endpoint) => {
      if (endpoint.includes('.desc')) throw new Error('Dates unavailable');
      return { results: [movie] };
    })).rejects.toThrow('Dates unavailable');
  });

  it('ignores unknown feed dates and handles empty discovery results', async () => {
    expect(getMediaYearBounds([movie, show, { ...movie, release_date: '' }])).toEqual({ min: 2024, max: 2025 });
    expect(getMediaYearBounds([])).toBeUndefined();
    expect(await fetchDiscoveryYearBounds('/api/Discover/movies', 'movies', async () => ({ results: [] })))
      .toBeUndefined();
  });

  it('filters feed dates inclusively by range, excluding unknown dates', () => {
    const items = [movie, show, { ...movie, id: 3, release_date: '' }];
    expect(filterMediaItems(items, undefined, { min: 2024, max: 2025 })).toEqual([movie, show]);
    expect(filterMediaItems(items, 18, { max: 2024 })).toEqual([movie]);
    expect(paginateFilteredMedia(items, 1, undefined, { min: 2025 }).results).toEqual([show]);
    expect(filterMediaItems(items, undefined, { min: 2025, max: 2024 })).toEqual([]);
  });

  it('intersects genre and year only within the supplied page', () => {
    expect(filterMediaItems([movie, show], 18, 2024)).toEqual([movie]);
    expect(filterMediaItems([movie, show], undefined, 2025)).toEqual([show]);
    expect(filterMediaItems([movie, show], 35)).toEqual([]);
    expect(filterMediaItems([movie, show])).toEqual([movie, show]);
    expect(filterMediaItems([{ ...movie, release_date: '' }], undefined, 2024)).toEqual([]);
  });

  it('keeps only media with a poster thumbnail', () => {
    const movieWithPoster = { ...movie, id: 3, poster_path: '/movie-poster.jpg' };
    const showWithPoster = { ...show, id: 4, poster_path: '/show-poster.jpg' };
    expect(filterMediaWithPoster([movie, show, movieWithPoster, showWithPoster]))
      .toEqual([movieWithPoster, showWithPoster]);
  });

  it('prioritizes poster artwork without dropping or reordering titles within each group', () => {
    const firstPoster = { ...movie, id: 3, poster_path: '/first.jpg' };
    const secondPoster = { ...show, id: 4, poster_path: '/second.jpg' };
    const noPoster = { ...movie, id: 5 };
    expect(prioritizeMediaWithPoster([movie, firstPoster, noPoster, secondPoster]))
      .toEqual([firstPoster, secondPoster, movie, noPoster]);
  });

  it('fills filtered pages from sparse matches across multiple feed pages', async () => {
    const progress: number[] = [];
    const requested: number[] = [];
    const feed = await fetchAllMediaPages('/api/Trending/movies?timeWindow=week', async (endpoint) => {
      const page = Number(new URL(endpoint, 'https://example.test').searchParams.get('page'));
      requested.push(page);
      return {
        total_pages: 10,
        results: Array.from({ length: 20 }, (_, index) => ({
          ...movie, id: (page - 1) * 20 + index,
          genre_ids: index < 3 ? [28] : [35],
        })),
      };
    }, new AbortController().signal, (loaded) => progress.push(loaded));
    const first = paginateFilteredMedia(feed, 1, 28, 2024);
    const second = paginateFilteredMedia(feed, 2, 28, 2024);
    expect(first.results).toHaveLength(20);
    expect(second.results).toHaveLength(10);
    expect(first.totalResults).toBe(30);
    expect(first.totalPages).toBe(2);
    expect(second.totalPages).toBe(2);
    expect(new Set([...first.results, ...second.results].map((item) => item.id)).size).toBe(30);
    expect(requested).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(progress).toEqual([1, 5, 9, 10]);
  });

  it('finds inclusive year matches on later feed pages rather than deriving limits from page one', async () => {
    const requested: number[] = [];
    const feed = await fetchAllMediaPages('/api/Trending/movies', async (endpoint) => {
      const page = Number(new URL(endpoint, 'https://example.test').searchParams.get('page'));
      requested.push(page);
      return {
        total_pages: 7,
        results: [{ ...movie, id: page, release_date: page === 7 ? '1970-01-01' : '2024-06-01' }],
      };
    }, new AbortController().signal, () => {});
    expect(requested).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(paginateFilteredMedia(feed, 1, undefined, { min: 1970, max: 1970 }).results.map((item) => item.id))
      .toEqual([7]);
    expect(paginateFilteredMedia(feed, 1).totalResults).toBe(7);
  });

  it('keeps exact multiples full and clamps stale page numbers', () => {
    const feed = Array.from({ length: 40 }, (_, id) => ({ ...movie, id }));
    const last = paginateFilteredMedia(feed, 500, 28);
    expect(last.currentPage).toBe(2);
    expect(last.totalPages).toBe(2);
    expect(last.results).toHaveLength(20);
    const empty = paginateFilteredMedia(feed, 5, 99);
    expect(empty).toMatchObject({ currentPage: 1, totalPages: 1, totalResults: 0, results: [] });
  });

  it('deduplicates titles while preserving feed order', async () => {
    const feed = await fetchAllMediaPages('/feed', async (endpoint) => ({
      total_pages: 2,
      results: endpoint.endsWith('page=1') ? [movie, show] : [show, { ...movie, id: 3 }],
    }), new AbortController().signal, () => {});
    expect(feed.map((item) => item.id)).toEqual([1, 2, 3]);
  });

  it('does not silently return partial results when a feed page fails', async () => {
    await expect(fetchAllMediaPages('/feed', async (endpoint) => {
      if (endpoint.endsWith('page=3')) throw new Error('Feed unavailable');
      return { results: [movie], total_pages: 10 };
    }, new AbortController().signal, () => {})).rejects.toThrow('Feed unavailable');
  });

  it('stops scheduling pages after cancellation', async () => {
    const controller = new AbortController();
    const requested: string[] = [];
    await expect(fetchAllMediaPages('/feed', async (endpoint) => {
      requested.push(endpoint);
      return { results: [movie], total_pages: 500 };
    }, controller.signal, () => controller.abort())).rejects.toThrow();
    expect(requested).toHaveLength(1);
  });

  it('never requests above the 500-page API ceiling', async () => {
    let highest = 0;
    await fetchAllMediaPages('/feed', async (endpoint) => {
      highest = Math.max(highest, Number(endpoint.split('page=')[1]));
      return { results: [], total_pages: 900 };
    }, new AbortController().signal, () => {});
    expect(highest).toBe(500);
  });
});

describe('accessible page count', () => {
  it.each([
    [undefined, 1], [0, 1], [1, 1], [37, 37], [500, 500], [2000, 500],
  ])('limits %s pages to %s', (total, expected) => {
    expect(getAccessiblePageCount(total)).toBe(expected);
  });
});
