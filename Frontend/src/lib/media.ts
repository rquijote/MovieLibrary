import type { SyntheticEvent } from 'react';
import type { MediaCategory, MediaItem, MediaType } from '../types/media';

const mediaPlaceholderImage =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><rect width="500" height="750" fill="%23334155"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23e5e7eb" font-family="Arial, sans-serif" font-size="32">No Image</text></svg>';

export function getImageUrl(imagePath: string | null | undefined, width = 'w500'): string {
  if (!imagePath) {
    return mediaPlaceholderImage;
  }

  return `https://image.tmdb.org/t/p/${width}${imagePath}`;
}

export function handleMediaImageError(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.onerror = null;
  event.currentTarget.src = mediaPlaceholderImage;
}

export function getMediaTitle(item: MediaItem): string {
  return 'title' in item ? item.title : item.name;
}

export function getMediaDate(item: MediaItem): string {
  return 'release_date' in item ? item.release_date : item.first_air_date;
}

export function filterMediaWithPoster<TItem extends MediaItem>(items: readonly TItem[]): TItem[] {
  return items.filter((item) => Boolean(item.poster_path));
}

type YearFilter = number | { min?: number; max?: number };

export function getMediaYearBounds(items: MediaItem[]): { min: number; max: number } | undefined {
  const years = items.map(getMediaDate)
    .filter((date) => /^[1-9]\d{3}-\d{2}-\d{2}$/.test(date))
    .map((date) => Number(date.slice(0, 4)));
  if (years.length === 0) return undefined;
  return { min: Math.min(...years), max: Math.max(...years) };
}

export function filterMediaItems(items: MediaItem[], genreId?: number, year?: YearFilter): MediaItem[] {
  return items.filter((item) =>
    (genreId === undefined || item.genre_ids.includes(genreId))
    && (year === undefined || (typeof year === 'number'
      ? getMediaDate(item)?.slice(0, 4) === String(year)
      : /^\d{4}/.test(getMediaDate(item) ?? '')
        && (year.min === undefined || Number(getMediaDate(item).slice(0, 4)) >= year.min)
        && (year.max === undefined || Number(getMediaDate(item).slice(0, 4)) <= year.max))),
  );
}

export function buildFilteredDiscoveryEndpoint(endpoint: string, mediaType: MediaType, year?: YearFilter): string {
  if (year === undefined) return endpoint;
  const [path, query] = endpoint.split('?');
  const params = new URLSearchParams(query);
  if (typeof year === 'number') {
    params.set(mediaType === 'movies' ? 'PrimaryReleaseYear' : 'FirstAirDateYear', String(year));
  } else {
    const prefix = mediaType === 'movies' ? 'PrimaryReleaseDate' : 'FirstAirDate';
    if (year.min !== undefined) {
      const lower = `${year.min}-01-01`;
      const existing = params.get(`${prefix}Gte`);
      params.set(`${prefix}Gte`, existing && existing > lower ? existing : lower);
    }
    if (year.max !== undefined) {
      const upper = `${year.max}-12-31`;
      const existing = params.get(`${prefix}Lte`);
      params.set(`${prefix}Lte`, existing && existing < upper ? existing : upper);
    }
  }
  return `${path}?${params.toString()}`;
}

export function getAccessiblePageCount(totalPages = 1): number {
  return Math.min(500, Math.max(1, totalPages));
}

export function paginateFilteredMedia(items: MediaItem[], page: number, genreId?: number, year?: YearFilter) {
  const matches = filterMediaItems(items, genreId, year);
  const totalPages = Math.max(1, Math.ceil(matches.length / 20));
  const currentPage = Math.min(page, totalPages);
  return {
    results: matches.slice((currentPage - 1) * 20, currentPage * 20),
    totalPages,
    currentPage,
    totalResults: matches.length,
  };
}

export async function fetchAllMediaPages(
  endpoint: string,
  fetchPage: (endpoint: string) => Promise<{ results: MediaItem[]; total_pages?: number }>,
  signal: AbortSignal,
  onProgress: (loaded: number, total: number) => void,
): Promise<MediaItem[]> {
  signal.throwIfAborted();
  const first = await fetchPage(buildPagedEndpoint(endpoint, 1));
  signal.throwIfAborted();
  const total = getAccessiblePageCount(first.total_pages);
  const items = [...first.results];
  onProgress(1, total);
  // Limit concurrent requests and preserve the feed's ordering.
  for (let page = 2; page <= total; page += 4) {
    signal.throwIfAborted();
    const batch = await Promise.all(
      Array.from({ length: Math.min(4, total - page + 1) }, (_, index) =>
        fetchPage(buildPagedEndpoint(endpoint, page + index))),
    );
    signal.throwIfAborted();
    items.push(...batch.flatMap((response) => response.results));
    onProgress(Math.min(page + 3, total), total);
  }
  return [...new Map(items.map((item) => [item.id, item])).values()];
}

// Two-level lookup: media type (e.g. movies) -> category (e.g. popular) -> API endpoint (values are URL strings).
// Partial is used to describe an object with optional category keys, otherwise all mediaCategory would need to be listed.
export const expandedListEndpoints: Record<MediaType, Partial<Record<MediaCategory, string>>> = {
  movies: {
    'now-playing': '/api/MovieLists/now-playing',
    trending: '/api/Trending/movies?timeWindow=week',
    watchlist: '/api/Account/watchlist/movies',
    favorite: '/api/Account/favourite/movies',
  },
  tv: {
    upcoming: '/api/Discover/tv',
    popular: '/api/TvShowLists/popular',
    'top-rated': '/api/TvShowLists/top-rated',
    'airing-today': '/api/TvShowLists/airing-today',
    'on-the-air': '/api/TvShowLists/on-the-air',
    trending: '/api/Trending/tv?timeWindow=day',
    watchlist: '/api/Account/watchlist/tv',
    favorite: '/api/Account/favourite/tv',
  },
  tvshows: {
    'airing-today': '/api/TvShowLists/airing-today',
    trending: '/api/Trending/tv?timeWindow=day',
    watchlist: '/api/Account/watchlist/tv',
    favorite: '/api/Account/favourite/tv',
  },
};

export function buildMovieDiscoveryEndpoint(
  category: 'popular' | 'top-rated' | 'upcoming',
  fromDate = new Date(),
  genreId?: number,
): string {
  const date = new Date(fromDate);
  const today = formatLocalDate(date);
  const params = new URLSearchParams({ IncludeAdult: 'false' });
  if (genreId !== undefined) {
    params.set('WithGenres', String(genreId));
  }

  if (category === 'popular') {
    params.set('SortBy', 'popularity.desc');
    params.set('PrimaryReleaseDateLte', today);
    params.set('VoteCountGte', '250');
  } else if (category === 'top-rated') {
    const fiveYearsAgo = new Date(date);
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    params.set('SortBy', 'vote_average.desc');
    params.set('PrimaryReleaseDateGte', formatLocalDate(fiveYearsAgo));
    params.set('PrimaryReleaseDateLte', today);
    params.set('VoteAverageGte', '7');
    params.set('VoteCountGte', '500');
  } else {
    const oneYearFromNow = new Date(date);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    params.set('SortBy', 'popularity.desc');
    params.set('PrimaryReleaseDateGte', today);
    params.set('PrimaryReleaseDateLte', formatLocalDate(oneYearFromNow));
  }

  return `/api/Discover/movies?${params.toString()}`;
}

export function buildTvShowDiscoveryEndpoint(
  category: 'popular' | 'top-rated' | 'upcoming' | 'on-the-air',
  fromDate = new Date(),
  genreId?: number,
): string {
  const date = new Date(fromDate);
  const today = formatLocalDate(date);
  const params = new URLSearchParams({ IncludeAdult: 'false' });
  if (genreId !== undefined) {
    params.set('WithGenres', String(genreId));
  }

  if (category === 'popular') {
    params.set('SortBy', 'popularity.desc');
    params.set('FirstAirDateLte', today);
    params.set('VoteCountGte', '250');
  } else if (category === 'top-rated') {
    const fiveYearsAgo = new Date(date);
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    params.set('SortBy', 'vote_average.desc');
    params.set('FirstAirDateGte', formatLocalDate(fiveYearsAgo));
    params.set('FirstAirDateLte', today);
    params.set('VoteAverageGte', '7');
    params.set('VoteCountGte', '500');
  } else if (category === 'on-the-air') {
    const fiveYearsAgo = new Date(date);
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    params.set('SortBy', 'popularity.desc');
    params.set('FirstAirDateGte', formatLocalDate(fiveYearsAgo));
    params.set('FirstAirDateLte', today);
    params.set('VoteCountGte', '250');
    params.set('WithStatus', '0');
  } else {
    const oneYearFromNow = new Date(date);
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    params.set('SortBy', 'popularity.desc');
    params.set('FirstAirDateGte', today);
    params.set('FirstAirDateLte', formatLocalDate(oneYearFromNow));
  }

  return `/api/Discover/tv?${params.toString()}`;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Some endpoints already have query params. This checks if the baseEndpoint already has ?. If it does use &, else use ?.
// Appends the page number for pagination.
export function buildPagedEndpoint(baseEndpoint: string, page: number): string {
  const separator = baseEndpoint.includes('?') ? '&' : '?';
  return `${baseEndpoint}${separator}page=${page}`;
}

export async function fetchFirstPages<TItem, TResponse extends { results: TItem[]; total_pages?: number }>(
  baseEndpoint: string,
  fetchPage: (endpoint: string) => Promise<TResponse>,
  maxPages = 3,
): Promise<TResponse> {
  const firstPage = await fetchPage(buildPagedEndpoint(baseEndpoint, 1));
  const pageCount = Math.min(maxPages, Math.max(firstPage.total_pages ?? 1, 1));
  const additionalPages = await Promise.all(
    Array.from({ length: pageCount - 1 }, (_, index) =>
      fetchPage(buildPagedEndpoint(baseEndpoint, index + 2)),
    ),
  );

  return {
    ...firstPage,
    results: [firstPage, ...additionalPages].flatMap((page) => page.results),
  };
}
