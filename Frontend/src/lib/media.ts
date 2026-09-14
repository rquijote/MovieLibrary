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

export const expandedListEndpoints: Record<MediaType, Partial<Record<MediaCategory, string>>> = {
  movies: {
    popular: '/api/MovieLists/popular',
    'top-rated': '/api/MovieLists/top-rated',
    'now-playing': '/api/MovieLists/now-playing',
    upcoming: '/api/Discover/movies',
    trending: '/api/Trending/movies?timeWindow=day',
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
};

export function buildPagedEndpoint(baseEndpoint: string, page: number): string {
  const separator = baseEndpoint.includes('?') ? '&' : '?';
  return `${baseEndpoint}${separator}page=${page}`;
}
