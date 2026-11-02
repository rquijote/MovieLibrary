import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import type { MovieListResponse, TvShowListResponse } from '../types/media';

type MediaTab = 'movies' | 'tv';

export function KeywordResultsPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const keywordName = searchParams.get('name') ?? 'Keyword';
  const [activeTab, setActiveTab] = useState<MediaTab>('movies');
  const [movies, setMovies] = useState<MovieListResponse | null>(null);
  const [tvShows, setTvShows] = useState<TvShowListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Keyword was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [movieResults, tvResults] = await Promise.all([
          apiGet<MovieListResponse>(`/api/Discover/movies?WithKeywords=${encodeURIComponent(id)}&WithOriginalLanguage=`),
          apiGet<TvShowListResponse>(`/api/Discover/tv?WithKeywords=${encodeURIComponent(id)}&WithOriginalLanguage=`),
        ]);
        setMovies(movieResults);
        setTvShows(tvResults);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Keyword search failed.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <section>
      <h1>Titles tagged “{keywordName}”</h1>
      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="Keyword result categories"
        onChange={setActiveTab}
        options={[
          { value: 'movies', label: 'Movies' },
          { value: 'tv', label: 'TV Shows' },
        ]}
      />
      {isLoading ? <LoadingState variant="grid" label="Loading tagged titles" /> : null}
      {error ? <p role="alert">{error}</p> : null}
      {!isLoading && !error && activeTab === 'movies' ? (
        <MediaGrid items={movies?.results ?? []} mediaType="movies" showYearOnly />
      ) : null}
      {!isLoading && !error && activeTab === 'tv' ? (
        <MediaGrid items={tvShows?.results ?? []} mediaType="tv" showYearOnly />
      ) : null}
    </section>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
