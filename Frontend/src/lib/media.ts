import type { MediaCategory, MediaItem, MediaType } from '../types/media';

export function getImageUrl(imagePath: string | null | undefined, width = 'w500'): string {
  if (!imagePath) {
    return 'https://via.placeholder.com/500x750?text=No+Image';
  }

  return `https://image.tmdb.org/t/p/${width}${imagePath}`;
}

export function getMediaTitle(item: MediaItem): string {
  return 'title' in item ? item.title : item.name;
}

export function getMediaDate(item: MediaItem): string {
  return 'release_date' in item ? item.release_date : item.first_air_date;
}

export const expandedListEndpoints: Record<MediaType, Partial<Record<MediaCategory, string>>> = {
  movies: {
    popular: '/api/MovieLists/popular',
    'top-rated': '/api/MovieLists/top-rated',
    'now-playing': '/api/MovieLists/now-playing',
    upcoming: '/api/MovieLists/upcoming',
    trending: '/api/Trending/movies?timeWindow=day',
    watchlist: '/api/Account/watchlist/movies',
    favorite: '/api/Account/favourite/movies',
  },
  tv: {
    popular: '/api/TvShowLists/popular',
    'top-rated': '/api/TvShowLists/top-rated',
    'airing-today': '/api/TvShowLists/airing-today',
    'on-the-air': '/api/TvShowLists/on-the-air',
    trending: '/api/Trending/tv?timeWindow=day',
    watchlist: '/api/Account/watchlist/tv',
    favorite: '/api/Account/favourite/tv',
  },
};

export function buildPagedEndpoint(baseEndpoint: string, page: number): string {
  const separator = baseEndpoint.includes('?') ? '&' : '?';
  return `${baseEndpoint}${separator}page=${page}`;
}
