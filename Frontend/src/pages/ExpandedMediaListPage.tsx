import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaGrid } from '../components/MediaGrid';
import { apiGet } from '../lib/api';
import { buildPagedEndpoint, expandedListEndpoints } from '../lib/media';
import { formatDateForApi, getNextMonthDateRange } from '../lib/pageHelpers';
import type {
  MediaCategory,
  MediaItem,
  MediaType,
  MovieListResponse,
  TvShowListResponse,
} from '../types/media';

const validMediaTypes: MediaType[] = ['movies', 'tvshows'];
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

function buildUpcomingEndpoint(baseEndpoint: string, mediaType: MediaType): string {
  const { startDate, endDate } = getNextMonthDateRange();

  return mediaType === 'movies'
    ? `${baseEndpoint}?PrimaryReleaseDateGte=${formatDateForApi(startDate)}&PrimaryReleaseDateLte=${formatDateForApi(endDate)}`
    : `${baseEndpoint}?FirstAirDateGte=${formatDateForApi(startDate)}&FirstAirDateLte=${formatDateForApi(endDate)}`;
}

export function ExpandedMediaListPage() {
  const { mediaType, category } = useParams(); 
  const [items, setItems] = useState<MediaItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1); // setsCurrentPage on prev/next changes.
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Runtime validator for the route param.
  // useMemo is a React hook that caches the mediaType between renders. Recomputes when dependencies change.
  const parsedMediaType = useMemo(
    () =>
      validMediaTypes.includes(mediaType as MediaType)
        ? (mediaType as MediaType)
        : null,
    [mediaType],
  );

  // Runtime validator for the route param.
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

    if (parsedCategory === 'upcoming') {
      return buildUpcomingEndpoint(baseEndpoint, parsedMediaType);
    }

    return baseEndpoint;
  }, [parsedCategory, parsedMediaType]);

  // useEffect is used because its calling the API to get items. Don't want it to constantly fire every render.
  useEffect(() => {
      const load = async () => {
      // If invalid endpoint or parsedMediaType, return empty.
      if (!endpoint || !parsedMediaType) {
        setItems([]);
        setTotalPages(1);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const pagedEndpoint = buildPagedEndpoint(endpoint, currentPage); // currentPage is from the prev and next.

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

      <MediaGrid items={items} mediaType={parsedMediaType} showYearOnly />
    </>
  );
}
