import { useEffect, useState } from 'react';
import { MediaRow } from '../components/MediaRow';
import { apiGet } from '../lib/api';
import type { MovieListResponse } from '../types/media';

export function MoviesPage() {
  const [popular, setPopular] = useState<MovieListResponse | null>(null);
  const [topRated, setTopRated] = useState<MovieListResponse | null>(null);
  const [upcoming, setUpcoming] = useState<MovieListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [popularData, topRatedData, upcomingData] = await Promise.all([
          apiGet<MovieListResponse>('/api/MovieLists/popular'),
          apiGet<MovieListResponse>('/api/MovieLists/top-rated'),
          apiGet<MovieListResponse>('/api/MovieLists/upcoming'),
        ]);

        setPopular(popularData);
        setTopRated(topRatedData);
        setUpcoming(upcomingData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load Movies page data.');
      }
    };

    void load();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!popular || !topRated || !upcoming) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>Movies</h1>
      <MediaRow title="Popular" mediaType="movies" category="popular" items={popular.results} />
      <MediaRow title="Top Rated" mediaType="movies" category="top-rated" items={topRated.results} />
      <MediaRow title="Upcoming" mediaType="movies" category="upcoming" items={upcoming.results} />
    </>
  );
}
