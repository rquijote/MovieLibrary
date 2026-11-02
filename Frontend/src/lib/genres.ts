import type { GenreDto, MediaItem } from '../types/media';

export const movieGenres: readonly GenreDto[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const tvGenres: readonly GenreDto[] = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

export interface GenreItemGroup<TItem extends MediaItem> {
  genre: GenreDto;
  items: TItem[];
}

interface CachedGenreItems {
  expiresAt: number;
  items: MediaItem[];
}

const genreCacheDurationMs = 120_000;
const genreItemsCache = new Map<string, CachedGenreItems>();
const genreItemRequests = new Map<string, Promise<MediaItem[]>>();

function fetchGenreItems<TItem extends MediaItem>(
  endpoint: string,
  fetchResults: (endpoint: string) => Promise<{ results: TItem[] }>,
): Promise<TItem[]> {
  const cached = genreItemsCache.get(endpoint);
  if (cached && cached.expiresAt > Date.now()) {
    return Promise.resolve(cached.items as TItem[]);
  }
  if (cached) {
    genreItemsCache.delete(endpoint);
  }

  const pendingRequest = genreItemRequests.get(endpoint);
  if (pendingRequest) {
    return pendingRequest as Promise<TItem[]>;
  }

  const request = fetchResults(endpoint).then(({ results }) => {
    genreItemsCache.set(endpoint, { expiresAt: Date.now() + genreCacheDurationMs, items: results });
    return results;
  }).finally(() => {
    if (genreItemRequests.get(endpoint) === request) {
      genreItemRequests.delete(endpoint);
    }
  });

  genreItemRequests.set(endpoint, request as Promise<MediaItem[]>);
  return request;
}

export async function fetchGenreRows<TItem extends MediaItem>(
  genres: readonly GenreDto[],
  buildEndpoint: (genreId: number) => string,
  fetchResults: (endpoint: string) => Promise<{ results: TItem[] }>,
  onGroup?: (group: GenreItemGroup<TItem>) => void,
): Promise<GenreItemGroup<TItem>[]> {
  const rows = await Promise.all(genres.map(async (genre) => {
    const group = {
      genre,
      items: await fetchGenreItems(buildEndpoint(genre.id), fetchResults),
    };
    if (group.items.length > 0) {
      onGroup?.(group);
    }
    return group;
  }));

  return rows.filter((row) => row.items.length > 0);
}

export function groupItemsByGenre<TItem extends MediaItem>(
  items: TItem[],
  genres: readonly GenreDto[],
  minimumItems = 2,
): { genre: GenreDto; items: TItem[] }[] {
  return genres
    .map((genre) => ({
      genre,
      items: items.filter((item) => item.genre_ids.includes(genre.id)),
    }))
    .filter((group) => group.items.length >= minimumItems);
}