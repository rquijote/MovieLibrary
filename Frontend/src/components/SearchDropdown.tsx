import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { MovieDto, MovieListResponse, TvShowDto, TvShowListResponse } from '../types/media';

const MAX_RESULTS_PER_TYPE = 6;
const SEARCH_DELAY_MS = 300;

export function SearchDropdown() {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState<MovieDto[]>([]);
  const [tvShows, setTvShows] = useState<TvShowDto[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmedQuery = query.trim();

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
        setIsOpen(false);
        setQuery('');
        setMovies([]);
        setTvShows([]);
        setHasError(false);
        setIsLoading(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (!trimmedQuery) {
      return;
    }

    let isCurrentSearch = true;

    const timeoutId = window.setTimeout(async () => {
      try {
        const encodedQuery = encodeURIComponent(trimmedQuery);
        const [movieResponse, tvResponse] = await Promise.all([
          apiGet<MovieListResponse>(`/api/Search/movies?query=${encodedQuery}`),
          apiGet<TvShowListResponse>(`/api/Search/tv?query=${encodedQuery}`),
        ]);

        if (isCurrentSearch) {
          setMovies(movieResponse.results.slice(0, MAX_RESULTS_PER_TYPE));
          setTvShows(tvResponse.results.slice(0, MAX_RESULTS_PER_TYPE));
        }
      } catch {
        if (isCurrentSearch) {
          setMovies([]);
          setTvShows([]);
          setHasError(true);
        }
      } finally {
        if (isCurrentSearch) {
          setIsLoading(false);
        }
      }
    }, SEARCH_DELAY_MS);

    return () => {
      isCurrentSearch = false;
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const updateQuery = (nextQuery: string) => {
    setQuery(nextQuery);
    setMovies([]);
    setTvShows([]);
    setHasError(false);

    if (nextQuery.trim()) {
      setIsLoading(true);
      setIsOpen(true);
    } else {
      setIsLoading(false);
      setIsOpen(false);
    }
  };

  const closeSearch = () => {
    setIsExpanded(false);
    setIsOpen(false);
    setQuery('');
    setMovies([]);
    setTvShows([]);
    setHasError(false);
    setIsLoading(false);
  };

  const hasResults = movies.length > 0 || tvShows.length > 0;

  return (
    <div
      className={`search${isExpanded ? ' search-open' : ''}`}
      ref={containerRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          closeSearch();
        }
      }}
    >
      <button
        type="button"
        className="search-toggle"
        aria-label={isExpanded ? 'Close search' : 'Open search'}
        onClick={() => {
          if (isExpanded) {
            closeSearch();
          } else {
            setIsExpanded(true);
          }
        }}
      >
        {isExpanded ? '✕' : '🔍'}
      </button>

      {isExpanded ? (
        <>
          <label className="sr-only" htmlFor="site-search">
            Search movies and TV shows
          </label>
          <div className="search-input-wrap">
            <input
              ref={inputRef}
              id="site-search"
              type="search"
              value={query}
              placeholder="Search movies and TV shows"
              autoComplete="off"
              aria-expanded={isOpen}
              aria-controls="search-results"
              onChange={(event) => updateQuery(event.target.value)}
            />
          </div>
        </>
      ) : null}

      {isOpen ? (
        <div id="search-results" className="search-dropdown" aria-live="polite">
          {isLoading ? <p className="search-message">Searching...</p> : null}
          {!isLoading && hasError ? (
            <p className="search-message search-error">Search is unavailable. Please try again.</p>
          ) : null}
          {!isLoading && !hasError && !hasResults ? (
            <p className="search-message">No movies or TV shows found.</p>
          ) : null}
          {!isLoading && !hasError && hasResults ? (
            <div className="search-groups">
              <SearchGroup title="Movies" items={movies} mediaType="movie" onSelect={closeSearch} />
              <SearchGroup title="TV Shows" items={tvShows} mediaType="tv" onSelect={closeSearch} />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

interface SearchGroupProps {
  title: string;
  items: Array<MovieDto | TvShowDto>;
  mediaType: 'movie' | 'tv';
  onSelect: () => void;
}

function SearchGroup({ title, items, mediaType, onSelect }: SearchGroupProps) {
  return (
    <section className="search-group" aria-labelledby={`search-${mediaType}-heading`}>
      <h2 id={`search-${mediaType}-heading`}>{title}</h2>
      {items.length === 0 ? (
        <p className="search-group-empty">No matches</p>
      ) : (
        <ul>
          {items.map((item) => {
            const title = 'title' in item ? item.title : item.name;
            const date = 'release_date' in item ? item.release_date : item.first_air_date;
            const year = date ? date.slice(0, 4) : 'Date unavailable';

            return (
              <li key={`${mediaType}-${item.id}`}>
                <Link className="search-result" to={`/${mediaType}/${item.id}`} onClick={onSelect}>
                  <img
                    src={getImageUrl(item.poster_path, 'w92')}
                    alt=""
                    loading="lazy"
                    onError={handleMediaImageError}
                  />
                  <span>
                    <strong>{title}</strong>
                    <small>{year}</small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
