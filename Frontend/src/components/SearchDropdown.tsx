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
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="button" className="search-submit" onClick={submitSearch}>Search</button>
          </div>
        </>
      ) : null}
    </div>
  );
}
