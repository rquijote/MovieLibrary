import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { YearRangeFilter } from '../components/layout/YearRangeFilter';
import { PeopleSearchGrid } from '../components/media-details/PeopleSearchGrid';
import { apiGet } from '../lib/api';
import { filterMediaItems } from '../lib/media';
import type {
  KeywordDto,
  KeywordSearchResponseDto,
  MovieListResponse,
  PersonSearchResponseDto,
  TvShowListResponse,
} from '../types/media';

type SearchTab = 'movies' | 'tv' | 'people' | 'keywords';

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const parseYear = (value: string | null) => value && /^[1-9]\d{3}$/.test(value) ? Number(value) : undefined;
  const min = parseYear(searchParams.get('yearMin'));
  const max = parseYear(searchParams.get('yearMax'));
  const yearRange = min === undefined && max === undefined ? undefined : { min, max };
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filterReset, setFilterReset] = useState(0);
  const query = searchParams.get('q')?.trim() ?? '';
  const [activeTab, setActiveTab] = useState<SearchTab>('movies');
  const [movies, setMovies] = useState<MovieListResponse | null>(null);
  const [tvShows, setTvShows] = useState<TvShowListResponse | null>(null);
  const [people, setPeople] = useState<PersonSearchResponseDto | null>(null);
  const [keywords, setKeywords] = useState<KeywordSearchResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!query) {
        setMovies({ page: 1, results: [], total_pages: 0, total_results: 0 });
        setTvShows({ page: 1, results: [], total_pages: 0, total_results: 0 });
        setPeople({ page: 1, results: [], total_pages: 0, total_results: 0 });
        setKeywords({ page: 1, results: [], total_pages: 0, total_results: 0 });
        return;
      }

      try {
        setIsLoading(true);
        const encodedQuery = encodeURIComponent(query);
        const [movieResults, tvResults, peopleResults, keywordResults] = await Promise.all([
          apiGet<MovieListResponse>(`/api/Search/movies?query=${encodedQuery}`),
          apiGet<TvShowListResponse>(`/api/Search/tv?query=${encodedQuery}`),
          apiGet<PersonSearchResponseDto>(`/api/Search/people?query=${encodedQuery}`),
          apiGet<KeywordSearchResponseDto>(`/api/Search/keywords?query=${encodedQuery}`),
        ]);

        setMovies(movieResults);
        setTvShows(tvResults);
        setPeople(peopleResults);
        setKeywords(keywordResults);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Search failed.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [query]);

  return (
    <section>
      <h1>Search</h1>
      <p className="muted">Query: {query || 'None'}</p>

      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="Search result categories"
        onChange={setActiveTab}
        options={[
          { value: 'movies', label: 'Movies' },
          { value: 'tv', label: 'TV Shows' },
          { value: 'people', label: 'People' },
          { value: 'keywords', label: 'Keywords' },
        ]}
      />

      {activeTab === 'movies' || activeTab === 'tv' ? (
        <>
          <form className="expanded-media-filters" aria-label="Search result filters" autoComplete="off"
            key={`${query}-${min}-${max}-${filterReset}`}
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const from = String(data.get('yearMin') ?? '');
              const to = String(data.get('yearMax') ?? '');
              if ((from && !/^[1-9]\d{3}$/.test(from)) || (to && !/^[1-9]\d{3}$/.test(to))
                || (from && to && Number(from) > Number(to))) {
                setFilterError('Enter four-digit years with From no later than To.');
                return;
              }
              setFilterError(null);
              const next = new URLSearchParams(searchParams);
              for (const [name, value] of [['yearMin', from], ['yearMax', to]]) {
                if (value) next.set(name, value);
                else next.delete(name);
              }
              setSearchParams(next);
            }}>
            <YearRangeFilter key={activeTab} min={min} max={max}
              label={activeTab === 'movies' ? 'Released between' : 'Premiered between'} />
            <div className="media-filter-actions">
              <button type="button" onClick={() => {
                const next = new URLSearchParams(searchParams);
                next.delete('yearMin');
                next.delete('yearMax');
                setFilterError(null);
                setFilterReset((value) => value + 1);
                setSearchParams(next);
              }}>Clear filters</button>
            </div>
          </form>
          <p className="muted">Filters apply to the search results loaded on this page.</p>
          {filterError ? <p role="alert">{filterError}</p> : null}
        </>
      ) : null}

      {isLoading ? <LoadingState variant="grid" label="Searching titles and people" /> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && activeTab === 'movies' ? (
        <MediaGrid items={filterMediaItems(movies?.results ?? [], undefined, yearRange)} mediaType="movies" showYearOnly />
      ) : null}

      {!isLoading && !error && activeTab === 'tv' ? (
        <MediaGrid items={filterMediaItems(tvShows?.results ?? [], undefined, yearRange)} mediaType="tv" showYearOnly />
      ) : null}

      {!isLoading && !error && activeTab === 'people' ? (
        <PeopleSearchGrid people={people?.results ?? []} />
      ) : null}

      {!isLoading && !error && activeTab === 'keywords' ? (
        <KeywordSearchResults keywords={keywords?.results ?? []} />
      ) : null}
    </section>
  );
}

function KeywordSearchResults({ keywords }: { keywords: KeywordDto[] }) {
  if (keywords.length === 0) {
    return <p>No keywords found.</p>;
  }

  return (
    <div className="keyword-list">
      {keywords.map((keyword) => (
        <Link
          className="keyword-link"
          to={`/keyword/${keyword.id}?name=${encodeURIComponent(keyword.name)}`}
          key={keyword.id}
        >
          {keyword.name}
        </Link>
      ))}
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
