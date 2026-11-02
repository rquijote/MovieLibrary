import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { YearRangeFilter } from '../components/layout/YearRangeFilter';
import { apiGet } from '../lib/api';
import { movieGenres, tvGenres } from '../lib/genres';
import {
  buildFilteredDiscoveryEndpoint,
  buildMovieDiscoveryEndpoint,
  buildPagedEndpoint,
  buildTvShowDiscoveryEndpoint,
  expandedListEndpoints,
  fetchAllMediaPages,
  getAccessiblePageCount,
  paginateFilteredMedia,
} from '../lib/media';
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
  const { mediaType, category, sourceId } = useParams();
  const relatedCategory = sourceId && /^[1-9]\d*$/.test(sourceId)
    && (category === 'recommendations' || category === 'similar') ? category : null;
  const [searchParams, setSearchParams] = useSearchParams();
  const genreParam = searchParams.get('genreId');
  const genreId = genreParam && /^\d+$/.test(genreParam) ? Number(genreParam) : undefined;
  const [items, setItems] = useState<MediaItem[]>([]);
  const yearScope = `${mediaType}-${category}-${sourceId}-${genreId}`;
  const [yearSource, setYearSource] = useState<{ scope: string; items: MediaItem[] }>({ scope: '', items: [] });
  const yearParam = searchParams.get('year');
  const year = yearParam && /^\d{4}$/.test(yearParam) && Number(yearParam) >= 1000
    ? Number(yearParam) : undefined;
  const parseYear = (value: string | null) => value && /^[1-9]\d{3}$/.test(value) ? Number(value) : undefined;
  const yearMin = parseYear(searchParams.get('yearMin')) ?? year;
  const yearMax = parseYear(searchParams.get('yearMax')) ?? year;
  const yearRange = useMemo(() => yearMin === undefined && yearMax === undefined
    ? undefined : { min: yearMin, max: yearMax }, [yearMin, yearMax]);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filterReset, setFilterReset] = useState(0);
  const pageParam = searchParams.get('page');
  const currentPage = pageParam && /^\d+$/.test(pageParam)
    ? Math.min(500, Math.max(1, Number(pageParam))) : 1;
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState<{ loaded: number; total: number } | null>(null);
  const [filteredCount, setFilteredCount] = useState<number | null>(null);
  const feedCache = useRef<{ endpoint: string; items: MediaItem[] } | null>(null);

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
    if (sourceId) {
      if (!parsedMediaType || !relatedCategory) return null;
      return `/api/${parsedMediaType === 'movies' ? 'Movie' : 'TvShow'}/${sourceId}/${relatedCategory}`;
    }
    if (!parsedMediaType || !parsedCategory) {
      return null;
    }

    if (parsedMediaType === 'movies') {
      switch (parsedCategory) {
        case 'popular':
        case 'top-rated':
        case 'upcoming':
          return buildFilteredDiscoveryEndpoint(
            buildMovieDiscoveryEndpoint(parsedCategory, new Date(), genreId), parsedMediaType, yearRange,
          );
      }
    }

    if (parsedMediaType === 'tvshows') {
      switch (parsedCategory) {
        case 'popular':
        case 'top-rated':
        case 'upcoming':
        case 'on-the-air':
          return buildFilteredDiscoveryEndpoint(
            buildTvShowDiscoveryEndpoint(parsedCategory, new Date(), genreId), parsedMediaType, yearRange,
          );
      }
    }

    const baseEndpoint = expandedListEndpoints[parsedMediaType][parsedCategory];
    if (!baseEndpoint) {
      return null;
    }

    if (parsedCategory === 'upcoming') {
      return buildUpcomingEndpoint(baseEndpoint, parsedMediaType);
    }

    return baseEndpoint;
  }, [genreId, parsedCategory, parsedMediaType, relatedCategory, sourceId, yearRange]);

  const filtersAllResults = endpoint?.startsWith('/api/Discover/') ?? false;
  const needsFeedScan = !filtersAllResults && (genreId !== undefined || yearRange !== undefined);
  const setCurrentPage = (page: number) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(page));
    setSearchParams(nextParams);
  };

  // useEffect is used because its calling the API to get items. Don't want it to constantly fire every render.
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
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
        setScanProgress(null);
        setFilteredCount(null);

        let results: MediaItem[];
        let pageCount: number;
        if (needsFeedScan) {
          let feed = feedCache.current?.endpoint === endpoint ? feedCache.current.items : undefined;
          if (!feed) {
            feed = await fetchAllMediaPages(
              endpoint,
              (path) => apiGet<MovieListResponse | TvShowListResponse>(path),
              controller.signal,
              (loaded, total) => { if (active) setScanProgress({ loaded, total }); },
            );
            if (!active) return;
            feedCache.current = { endpoint, items: feed };
          }
          const filtered = paginateFilteredMedia(feed, currentPage, genreId, yearRange);
          setYearSource({ scope: yearScope, items: feed });
          results = filtered.results;
          pageCount = filtered.totalPages;
          setFilteredCount(filtered.totalResults);
        } else {
          const response = await apiGet<MovieListResponse | TvShowListResponse>(buildPagedEndpoint(endpoint, currentPage));
          results = response.results;
          setYearSource((previous) => yearRange !== undefined
            && previous.scope === yearScope && previous.items.length > 0
            ? previous : { scope: yearScope, items: results });
          pageCount = getAccessiblePageCount(response.total_pages);
        }
        if (!active) return;
        setItems(results);
        setTotalPages(pageCount);
        if (currentPage > pageCount) {
          setSearchParams((params) => {
            const next = new URLSearchParams(params);
            next.set('page', String(pageCount));
            return next;
          }, { replace: true });
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load expanded media list.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [currentPage, endpoint, genreId, needsFeedScan, parsedMediaType, setSearchParams, yearRange, yearScope]);

  if (!parsedMediaType || (!parsedCategory && !relatedCategory) || !endpoint) {
    return <p>Route not found.</p>;
  }

  return (
    <section className="expanded-media-page">
      <h1>{relatedCategory === 'recommendations' ? 'Recommended' : relatedCategory === 'similar'
        ? 'Similar' : parsedCategory?.replaceAll('-', ' ')} {parsedMediaType === 'movies' ? 'movies' : 'TV shows'}</h1>
      <form
        key={`${parsedMediaType}-${genreId}-${yearMin}-${yearMax}-${filterReset}`}
        className="expanded-media-filters"
        aria-label="Media filters"
        aria-describedby="media-filter-scope"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const min = String(data.get('yearMin') ?? '');
          const max = String(data.get('yearMax') ?? '');
          if ((min && !/^[1-9]\d{3}$/.test(min)) || (max && !/^[1-9]\d{3}$/.test(max))
            || (min && max && Number(min) > Number(max))) {
            setFilterError('Enter four-digit years with the minimum no later than the maximum.');
            return;
          }
          setFilterError(null);
          const next = new URLSearchParams(searchParams);
          next.delete('year');
          for (const name of ['genreId', 'yearMin', 'yearMax']) {
            const value = String(data.get(name) ?? '');
            if (value) next.set(name, value);
            else next.delete(name);
          }
          next.set('page', '1');
          setSearchParams(next);
        }}
      >
        <label className="expanded-genre-filter">
          Genre
          <select name="genreId" defaultValue={genreId ?? ''}
            onChange={(event) => event.currentTarget.form?.requestSubmit()}>
            <option value="">All genres</option>
            {(parsedMediaType === 'movies' ? movieGenres : tvGenres).map((genre) => (
              <option key={genre.id} value={genre.id}>{genre.name}</option>
            ))}
          </select>
        </label>
        <YearRangeFilter min={yearMin} max={yearMax} items={yearSource.scope === yearScope ? yearSource.items : []}
          label={parsedMediaType === 'movies' ? 'Released between' : 'Premiered between'} />
        <div className="media-filter-actions">
        <button type="button" onClick={() => {
          const next = new URLSearchParams(searchParams);
          next.delete('genreId');
          next.delete('year');
          next.delete('yearMin');
          next.delete('yearMax');
          setFilterError(null);
          setFilterReset((value) => value + 1);
          next.set('page', '1');
          setSearchParams(next);
        }}>Clear filters</button>
        </div>
      </form>
      {filterError ? <p role="alert">{filterError}</p> : null}
      <p id="media-filter-scope" className="muted">
        {filtersAllResults
          ? 'Filters apply across all results within this category. Category date and rating limits still apply.'
          : 'Filters apply across the first 500 available feed pages. Matches are grouped into pages of 20; only the last page may have fewer.'}
      </p>
      <div className="pagination-controls">
        <button type="button" onClick={() => setCurrentPage(currentPage - 1)} disabled={isLoading || currentPage === 1}>
          ← Previous
        </button>
        <span>
          {isLoading ? 'Updating results' : error ? 'Page count unavailable' : `Page ${currentPage} of ${totalPages}`}
        </span>
        {!isLoading && !error && filteredCount !== null ? (
          <span className="expanded-result-count">{filteredCount} matching {filteredCount === 1 ? 'title' : 'titles'}</span>
        ) : null}
        <button type="button" onClick={() => setCurrentPage(currentPage + 1)} disabled={isLoading || currentPage >= totalPages}>
          Next →
        </button>
        <form key={currentPage} className="page-jump" aria-label="Jump to page" onSubmit={(event) => {
          event.preventDefault();
          const page = Number(new FormData(event.currentTarget).get('page'));
          if (!Number.isInteger(page) || page < 1 || page > totalPages) {
            const input = event.currentTarget.querySelector('input');
            input?.setCustomValidity(`Enter a page from 1 to ${totalPages}.`);
            event.currentTarget.reportValidity();
            return;
          }
          setCurrentPage(page);
        }}>
          <label htmlFor="expanded-page-number">Jump to page</label>
          <input id="expanded-page-number" name="page" type="text" inputMode="numeric" pattern="[0-9]+"
            aria-label={`Jump to page (1 to ${totalPages})`} required defaultValue={currentPage} disabled={isLoading}
            onChange={(event) => event.currentTarget.setCustomValidity('')} />
          <button type="submit" disabled={isLoading}>Go</button>
        </form>
      </div>

      {error ? <p role="alert">{error}</p> : isLoading ? (
        <div className="expanded-loading">
          {scanProgress ? <LoadingState variant="inline"
            label={`Finding matches: ${scanProgress.loaded} of ${scanProgress.total} pages`} /> : null}
          {scanProgress ? <progress aria-label="Feed pages loaded" value={scanProgress.loaded} max={scanProgress.total} /> : null}
          <LoadingState variant="grid" label="Loading titles" />
        </div>
      ) : items.length === 0 ? <p>No media matches these filters. Try another genre or year.</p>
        : <MediaGrid items={items} mediaType={parsedMediaType} showYearOnly />}
    </section>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
