import { useEffect, useState } from 'react';
import { MediaRow } from '../components/MediaRow';
import { apiGet } from '../lib/api';
import type { MovieListResponse, TvShowListResponse } from '../types/media';

export function HomePage() {
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<MovieListResponse | null>(null);
  const [trendingTv, setTrendingTv] = useState<TvShowListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [watchMovies, watchTv, trendMovies, trendTv] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/watchlist/movies'),
          apiGet<TvShowListResponse>('/api/Account/watchlist/tv'),
          apiGet<MovieListResponse>('/api/Trending/movies'),
          apiGet<TvShowListResponse>('/api/Trending/tv'),
        ]);

        setWatchlistMovies(watchMovies);
        setWatchlistTv(watchTv);
        setTrendingMovies(trendMovies);
        setTrendingTv(trendTv);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load Home page data.');
      }
    };

    void load();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!watchlistMovies || !watchlistTv || !trendingMovies || !trendingTv) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <MediaRow title="Watchlist Movies" mediaType="movies" category="watchlist" items={watchlistMovies.results} />
      <MediaRow title="Watchlist TV Shows" mediaType="tv" category="watchlist" items={watchlistTv.results} />
      <MediaRow title="Trending Movies" mediaType="movies" category="trending" items={trendingMovies.results} />
      <MediaRow title="Trending TV Shows" mediaType="tv" category="trending" items={trendingTv.results} />
    </>
  );
}
