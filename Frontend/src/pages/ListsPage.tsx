import { useEffect, useState } from 'react';
import { MediaRow } from '../components/MediaRow';
import { apiGet } from '../lib/api';
import type { AccountListsResponse, ListDetailsResponse, MovieListResponse, TvShowListResponse } from '../types/media';

export function ListsPage() {
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [accountListIds, setAccountListIds] = useState<number[] | null>(null);
  const [accountListDetails, setAccountListDetails] = useState<ListDetailsResponse[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [favoriteMoviesData, favoriteTvData, watchlistMoviesData, watchlistTvData, accountListsData] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/favourite/movies'),
          apiGet<TvShowListResponse>('/api/Account/favourite/tv'),
          apiGet<MovieListResponse>('/api/Account/watchlist/movies'),
          apiGet<TvShowListResponse>('/api/Account/watchlist/tv'),
          apiGet<AccountListsResponse>('/api/Account/lists?page=1'),
        ]);

        const listIds = accountListsData.results.map((list) => list.id);
        const listDetails = await Promise.all(listIds.map((listId) => apiGet<ListDetailsResponse>(`/api/Lists/${listId}/details`)));

        setFavoriteMovies(favoriteMoviesData);
        setFavoriteTv(favoriteTvData);
        setWatchlistMovies(watchlistMoviesData);
        setWatchlistTv(watchlistTvData);
        setAccountListIds(listIds);
        setAccountListDetails(listDetails);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load Lists page data.');
      }
    };

    void load();
  }, []);

  if (error) {
    return <p>{error}</p>;
  }

  if (!favoriteMovies || !favoriteTv || !watchlistMovies || !watchlistTv || !accountListIds || !accountListDetails) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>My Lists</h1>
      <MediaRow title="Favorite Movies" mediaType="movies" category="favorite" items={favoriteMovies.results} />
      <MediaRow title="Favorite TV Shows" mediaType="tv" category="favorite" items={favoriteTv.results} />
      <MediaRow title="Watchlist Movies" mediaType="movies" category="watchlist" items={watchlistMovies.results} />
      <MediaRow title="Watchlist TV Shows" mediaType="tv" category="watchlist" items={watchlistTv.results} />
      {accountListDetails.map((list) => (
        <MediaRow key={list.id} title={list.name} mediaType="movies" category="watchlist" items={list.items} />
      ))}
    </>
  );
}
