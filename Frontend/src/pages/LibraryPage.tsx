import { useEffect, useState } from 'react';
import { AccountListCards } from '../components/AccountListCards';
import { MediaGrid } from '../components/MediaGrid';
import { apiGet } from '../lib/api';
import type { AccountListsResponse, MovieListResponse, TvShowListResponse } from '../types/media';

type LibraryTab = 'watchlist' | 'favourites' | 'lists';

export function LibraryPage() {
  const [activeTab, setActiveTab] = useState<LibraryTab>('watchlist');
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [accountLists, setAccountLists] = useState<AccountListsResponse | null>(null);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWatchlist = async () => {
      try {
        setIsTabLoading(true);
        const [watchlistMoviesData, watchlistTvData] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/watchlist/movies'),
          apiGet<TvShowListResponse>('/api/Account/watchlist/tv'),
        ]);

        setWatchlistMovies(watchlistMoviesData);
        setWatchlistTv(watchlistTvData);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load watchlist data.');
      } finally {
        setIsTabLoading(false);
      }
    };

    const loadFavourites = async () => {
      try {
        setIsTabLoading(true);
        const [favoriteMoviesData, favoriteTvData] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/favourite/movies'),
          apiGet<TvShowListResponse>('/api/Account/favourite/tv'),
        ]);

        setFavoriteMovies(favoriteMoviesData);
        setFavoriteTv(favoriteTvData);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load favourites data.');
      } finally {
        setIsTabLoading(false);
      }
    };

    const loadLists = async () => {
      try {
        setIsTabLoading(true);
        const accountListsData = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
        setAccountLists(accountListsData);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load custom lists data.');
      } finally {
        setIsTabLoading(false);
      }
    };

    const load = async () => {
      if (activeTab === 'watchlist' && (!watchlistMovies || !watchlistTv)) {
        await loadWatchlist();
        return;
      }

      if (activeTab === 'favourites' && (!favoriteMovies || !favoriteTv)) {
        await loadFavourites();
        return;
      }

      if (activeTab === 'lists' && !accountLists) {
        await loadLists();
      }
    };

    void load();
  }, [activeTab, accountLists, favoriteMovies, favoriteTv, watchlistMovies, watchlistTv]);

  if (error) {
    return <p>{error}</p>;
  }

  if (isTabLoading) {
    return <p>Loading...</p>;
  }

  const tabButtonClassName = (tab: LibraryTab) =>
    tab === activeTab ? 'library-tab-button library-tab-button-active' : 'library-tab-button';

  return (
    <section>
      <h1>My Library</h1>

      <div className="library-mini-header" role="tablist" aria-label="Library categories">
        <button type="button" className={tabButtonClassName('watchlist')} onClick={() => setActiveTab('watchlist')}>
          Watchlist
        </button>
        <button type="button" className={tabButtonClassName('favourites')} onClick={() => setActiveTab('favourites')}>
          Favourites
        </button>
        <button type="button" className={tabButtonClassName('lists')} onClick={() => setActiveTab('lists')}>
          Lists
        </button>
      </div>

      {activeTab === 'watchlist' ? (
        <div className="library-tab-content">
          <h2>Watchlist Movies</h2>
          <MediaGrid items={watchlistMovies?.results ?? []} mediaType="movies" />

          <h2>Watchlist TV Shows</h2>
          <MediaGrid items={watchlistTv?.results ?? []} mediaType="tv" />
        </div>
      ) : null}

      {activeTab === 'favourites' ? (
        <div className="library-tab-content">
          <h2>Favourite Movies</h2>
          <MediaGrid items={favoriteMovies?.results ?? []} mediaType="movies" />

          <h2>Favourite TV Shows</h2>
          <MediaGrid items={favoriteTv?.results ?? []} mediaType="tv" />
        </div>
      ) : null}

      {activeTab === 'lists' ? <AccountListCards lists={accountLists?.results ?? []} /> : null}
    </section>
  );
}
