import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AccountListCards } from '../components/AccountListCards';
import { MediaGrid } from '../components/MediaGrid';
import { MiniHeaderTabs } from '../components/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import type { AccountListsResponse, ListDetailsResponse, MovieListResponse, TvShowListResponse } from '../types/media';

type LibraryTab = 'watchlist' | 'favourites' | 'lists';

export function LibraryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<LibraryTab>('watchlist');
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [accountLists, setAccountLists] = useState<AccountListsResponse | null>(null);
  const [selectedListId, setSelectedListId] = useState<number | null>(null);
  const [selectedListDetails, setSelectedListDetails] = useState<ListDetailsResponse | null>(null);
  const [isListDetailsLoading, setIsListDetailsLoading] = useState(false);
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
        const sortedLists = [...accountListsData.results].sort((left, right) => right.id - left.id);
        setAccountLists({ ...accountListsData, results: sortedLists });
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

  const handleSelectList = async (listId: number) => {
    try {
      setSelectedListId(listId);
      setIsListDetailsLoading(true);
      const details = await apiGet<ListDetailsResponse>(`/api/Lists/${listId}/details`);
      setSelectedListDetails(details);
      setError(null);
    } catch (loadError) {
      setSelectedListDetails(null);
      setError(loadError instanceof Error ? loadError.message : 'Failed to load selected list details.');
    } finally {
      setIsListDetailsLoading(false);
    }
  };

  if (error) {
    return <p>{error}</p>;
  }

  if (isTabLoading) {
    return <p>Loading...</p>;
  }

  return (
    <section>
      <h1>My Library</h1>

      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="Library categories"
        onChange={setActiveTab}
        options={[
          { value: 'watchlist', label: 'Watchlist' },
          { value: 'favourites', label: 'Favourites' },
          { value: 'lists', label: 'Lists' },
        ]}
      />

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

      {activeTab === 'lists' ? (
        <div className="library-lists-main">
          <button type="button" className="create-list-button" onClick={() => navigate('/library/create-list')}>
            Create New List
          </button>

          <AccountListCards
            lists={accountLists?.results ?? []}
            selectedListId={selectedListId}
            onSelectList={(listId) => void handleSelectList(listId)}
          />

          {isListDetailsLoading ? <p>Loading selected list...</p> : null}

          {!isListDetailsLoading && selectedListDetails ? (
            <div className="library-list-details">
              <h2>{selectedListDetails.name}</h2>
              <p className="muted">{selectedListDetails.item_count} {selectedListDetails.item_count === 1 ? 'movie' : 'movies'}</p>
              <MediaGrid items={selectedListDetails.items} mediaType="movies" />
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
