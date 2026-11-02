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
