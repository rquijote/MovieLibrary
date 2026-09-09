import { useEffect, useState } from 'react';
import { MediaRow } from '../components/MediaRow';
import { apiGet } from '../lib/api';
import type { MovieListResponse, TvShowListResponse } from '../types/media';

export function ListsPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [moviesData, tvData] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/favourite/movies'),
          apiGet<TvShowListResponse>('/api/Account/favourite/tv'),
        ]);

        setFavoriteMovies(moviesData);
        setFavoriteTv(tvData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load Lists page data.');
      }
    };

    void load();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!favoriteMovies || !favoriteTv) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>My Lists</h1>
      <MediaRow title="Favorite Movies" mediaType="movies" category="favorite" items={favoriteMovies.results} />
      <MediaRow title="Favorite TV Shows" mediaType="tv" category="favorite" items={favoriteTv.results} />
    </>
  );
}
