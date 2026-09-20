import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountListCards } from '../components/AccountListCards';
import { MediaGrid } from '../components/MediaGrid';
import { MiniHeaderTabs } from '../components/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import type { AccountListsResponse, ListDetailsResponse, MovieListResponse, TvShowListResponse } from '../types/media';

type LibraryTab = 'watchlist' | 'favourites' | 'lists';

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<LibraryTab>(
    initialTab === 'lists' || initialTab === 'favourites' || initialTab === 'watchlist'
      ? initialTab
      : 'lists',
  );
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [accountLists, setAccountLists] = useState<AccountListsResponse | null>(null);
  const [listPreviewPostersById, setListPreviewPostersById] = useState<Record<number, string[]>>({});
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const preloadWatchlistAndFavourites = async () => {
      try {
        setIsTabLoading(true);
        const [watchlistMoviesData, watchlistTvData, favoriteMoviesData, favoriteTvData] = await Promise.all([
          apiGet<MovieListResponse>('/api/Account/watchlist/movies'),
          apiGet<TvShowListResponse>('/api/Account/watchlist/tv'),
          apiGet<MovieListResponse>('/api/Account/favourite/movies'),
          apiGet<TvShowListResponse>('/api/Account/favourite/tv'),
        ]);

        setWatchlistMovies(watchlistMoviesData);
        setWatchlistTv(watchlistTvData);
        setFavoriteMovies(favoriteMoviesData);
        setFavoriteTv(favoriteTvData);
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to preload library data.');
      } finally {
        setIsTabLoading(false);
      }
    };

    void preloadWatchlistAndFavourites();
  }, []);

  useEffect(() => {
    const loadLists = async () => {
      try {
        setIsTabLoading(true);
        const accountListsData = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
        const sortedLists = [...accountListsData.results].sort((left, right) => right.id - left.id);
        setAccountLists({ ...accountListsData, results: sortedLists });

        const detailsResults = await Promise.all(
          sortedLists.map(async (list) => {
            const details = await apiGet<ListDetailsResponse>(`/api/Lists/${list.id}/details`);
            return {
              listId: list.id,
              posters: details.items
                .slice(0, 4)
                .map((movie) => movie.poster_path)
                .filter((posterPath): posterPath is string => Boolean(posterPath)),
            };
          }),
        );

        setListPreviewPostersById(
          Object.fromEntries(detailsResults.map((entry) => [entry.listId, entry.posters])) as Record<number, string[]>,
        );
        setError(null);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load custom lists data.');
      } finally {
        setIsTabLoading(false);
      }
    };

    if (activeTab === 'lists' && !accountLists) {
      void loadLists();
    }
  }, [activeTab, accountLists]);

  useEffect(() => {
    setSearchParams({ tab: activeTab }, { replace: true });
  }, [activeTab, setSearchParams]);

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
          { value: 'lists', label: 'Lists' },
          { value: 'watchlist', label: 'Watchlist' },
          { value: 'favourites', label: 'Favourites' },
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
            previewPostersByListId={listPreviewPostersById}
            onSelectList={(listId) => navigate(`/library/lists/${listId}`)}
          />
        </div>
      ) : null}
    </section>
  );
}
