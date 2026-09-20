import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function SearchDropdown() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
        setQuery('');
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const closeSearch = () => {
    setIsExpanded(false);
    setQuery('');
  };

  const submitSearch = () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    closeSearch();
  };

  return (
    <div
      className={`search${isExpanded ? ' search-open' : ''}`}
      ref={containerRef}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          closeSearch();
        }

        if (event.key === 'Enter') {
          event.preventDefault();
          submitSearch();
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
        {isExpanded ? (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M16.25 16.25 21 21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
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
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="search-submit" onClick={submitSearch}>Search</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
