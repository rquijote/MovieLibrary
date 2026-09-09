import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { apiGet } from '../lib/api';
import { buildPagedEndpoint, expandedListEndpoints } from '../lib/media';
import type {
  MediaCategory,
  MediaItem,
  MediaType,
  MovieListResponse,
  TvShowListResponse,
} from '../types/media';

const validMediaTypes: MediaType[] = ['movies', 'tv'];
const validCategories: MediaCategory[] = [
  'popular',
  'top-rated',
  'trending',
  'watchlist',
  'favorite',
  'now-playing',
  'upcoming',
  'airing-today',
  'on-the-air',
];

export function ExpandedMediaListPage() {
  const { mediaType, category } = useParams();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parsedMediaType = useMemo(
    () => (validMediaTypes.includes(mediaType as MediaType) ? (mediaType as MediaType) : null),
    [mediaType],
  );

  const parsedCategory = useMemo(
    () => (validCategories.includes(category as MediaCategory) ? (category as MediaCategory) : null),
    [category],
  );

  const endpoint = useMemo(() => {
    if (!parsedMediaType || !parsedCategory) {
      return null;
    }

    const baseEndpoint = expandedListEndpoints[parsedMediaType][parsedCategory];
    if (!baseEndpoint) {
      return null;
    }

    return buildPagedEndpoint(baseEndpoint, page);
  }, [parsedCategory, parsedMediaType, page]);

  useEffect(() => {
    const load = async () => {
      if (!endpoint || !parsedMediaType) {
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        if (parsedMediaType === 'movies') {
          const response = await apiGet<MovieListResponse>(endpoint);
          setItems(response.results);
        } else {
          const response = await apiGet<TvShowListResponse>(endpoint);
          setItems(response.results);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load expanded media list.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [endpoint, parsedMediaType]);

  if (!parsedMediaType || !parsedCategory || !endpoint) {
    return <p>Route not found.</p>;
  }

  return (
    <>
      <h1>Expanded Media List</h1>
      <p>Media Type: {parsedMediaType}</p>
      <p>Category: {parsedCategory}</p>
      <p>Endpoint: {endpoint}</p>

      <div className="pagination-controls">
        {page > 1 ? (
          <button type="button" onClick={() => setPage((current) => current - 1)}>
            ← Previous
          </button>
        ) : null}
        <span>Page {page}</span>
        <button type="button" onClick={() => setPage((current) => current + 1)}>
          Next →
        </button>
      </div>

      {error ? <p>{error}</p> : null}
      {isLoading ? <p>Loading...</p> : <MediaGrid items={items} mediaType={parsedMediaType} />}
    </>
  );
}
