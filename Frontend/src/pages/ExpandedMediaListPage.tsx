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
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

    if (parsedCategory !== 'upcoming') {
      return baseEndpoint;
    }

    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return parsedMediaType === 'movies'
      ? `${baseEndpoint}?PrimaryReleaseDateGte=${formatDate(today)}&PrimaryReleaseDateLte=${formatDate(nextMonth)}`
      : `${baseEndpoint}?FirstAirDateGte=${formatDate(today)}&FirstAirDateLte=${formatDate(nextMonth)}`;
  }, [parsedCategory, parsedMediaType]);

  useEffect(() => {
    const load = async () => {
      if (!endpoint || !parsedMediaType) {
        setItems([]);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const pagedEndpoint = buildPagedEndpoint(endpoint, currentPage);

        if (parsedMediaType === 'movies') {
          const response = await apiGet<MovieListResponse>(pagedEndpoint);
          setItems(response.results);
          setTotalPages(Math.max(response.total_pages ?? 1, 1));
        } else {
          const response = await apiGet<TvShowListResponse>(pagedEndpoint);
          setItems(response.results);
          setTotalPages(Math.max(response.total_pages ?? 1, 1));
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load expanded media list.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [currentPage, endpoint, parsedMediaType]);

  if (!parsedMediaType || !parsedCategory || !endpoint) {
    return <p>Route not found.</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="pagination-controls">
        <button type="button" onClick={() => setCurrentPage((page) => page - 1)} disabled={currentPage === 1}>
          ← Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button type="button" onClick={() => setCurrentPage((page) => page + 1)} disabled={currentPage >= totalPages}>
          Next →
        </button>
      </div>

      <MediaGrid items={items} mediaType={parsedMediaType} />
    </>
  );
}
