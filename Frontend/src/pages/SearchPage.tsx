import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import type { MovieListResponse, TvShowListResponse } from '../types/media';

type SearchTab = 'movies' | 'tv';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q')?.trim() ?? '';
  const [activeTab, setActiveTab] = useState<SearchTab>('movies');
  const [movies, setMovies] = useState<MovieListResponse | null>(null);
  const [tvShows, setTvShows] = useState<TvShowListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!query) {
        setMovies({ page: 1, results: [], total_pages: 0, total_results: 0 });
        setTvShows({ page: 1, results: [], total_pages: 0, total_results: 0 });
        return;
      }

      try {
        setIsLoading(true);
        const encodedQuery = encodeURIComponent(query);
        const [movieResults, tvResults] = await Promise.all([
          apiGet<MovieListResponse>(`/api/Search/movies?query=${encodedQuery}`),
          apiGet<TvShowListResponse>(`/api/Search/tv?query=${encodedQuery}`),
        ]);

        setMovies(movieResults);
        setTvShows(tvResults);
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
        ]}
      />

      {isLoading ? <p>Searching...</p> : null}
      {error ? <p>{error}</p> : null}

      {!isLoading && !error && activeTab === 'movies' ? (
        <MediaGrid items={movies?.results ?? []} mediaType="movies" showYearOnly />
      ) : null}

      {!isLoading && !error && activeTab === 'tv' ? (
        <MediaGrid items={tvShows?.results ?? []} mediaType="tv" showYearOnly />
      ) : null}
    </section>
  );
}
