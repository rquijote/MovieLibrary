import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AccountListCards } from '../components/layout/AccountListCards';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { LoadingState } from '../components/layout/LoadingState';
import { apiGet } from '../lib/api';
import { getValidTab } from '../lib/pageHelpers';
import type { AccountListsResponse, ListDetailsResponse, MovieListResponse, TvShowListResponse } from '../types/media';
import './Lists.css';

type LibraryTab = 'watchlist' | 'favourites' | 'lists';
const libraryTabs = ['lists', 'favourites', 'watchlist'] as const;

export function LibraryPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: LibraryTab = getValidTab(tabParam, libraryTabs, 'lists');
  const [favoriteMovies, setFavoriteMovies] = useState<MovieListResponse | null>(null);
  const [favoriteTv, setFavoriteTv] = useState<TvShowListResponse | null>(null);
  const [watchlistMovies, setWatchlistMovies] = useState<MovieListResponse | null>(null);
  const [watchlistTv, setWatchlistTv] = useState<TvShowListResponse | null>(null);
  const [accountLists, setAccountLists] = useState<AccountListsResponse | null>(null);
  const [listPreviewPostersById, setListPreviewPostersById] = useState<Record<number, string[]>>({});
  const [isTabLoading, setIsTabLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewWarning, setPreviewWarning] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setIsTabLoading(true);
        setError(null);
        setPreviewWarning(null);
        if (activeTab !== 'lists') {
          const category = activeTab === 'watchlist' ? 'watchlist' : 'favourite';
          const [movies, tv] = await Promise.all([
            apiGet<MovieListResponse>(`/api/Account/${category}/movies`),
            apiGet<TvShowListResponse>(`/api/Account/${category}/tv`),
          ]);
          if (!active) return;
          if (activeTab === 'watchlist') {
            setWatchlistMovies(movies);
            setWatchlistTv(tv);
          } else {
            setFavoriteMovies(movies);
            setFavoriteTv(tv);
          }
          return;
        }
        const accountListsData = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
        if (!active) return;
        const sortedLists = [...accountListsData.results].sort((left, right) => right.id - left.id);
        setAccountLists({ ...accountListsData, results: sortedLists });
        setIsTabLoading(false);

        const detailsResults = await Promise.allSettled(
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

        if (!active) return;
        const previews: Record<number, string[]> = {};
        for (const result of detailsResults) {
          if (result.status === 'fulfilled') previews[result.value.listId] = result.value.posters;
        }
        setListPreviewPostersById(previews);
        if (detailsResults.some((result) => result.status === 'rejected')) {
          setPreviewWarning('Some cover previews could not load. Your lists are still available.');
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Failed to load your library.');
      } finally {
        if (active) setIsTabLoading(false);
      }
    };

    void load();
    return () => { active = false; };
  }, [activeTab, loadAttempt]);

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  return (
    <section className="lists-page">
      <header className="lists-heading">
        <p className="lists-eyebrow">Made for you</p>
        <h1>Your library</h1>
        <p className="muted">The stories you love, and the ones you have yet to discover.</p>
      </header>

      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="Library categories"
        onChange={(nextTab) => setSearchParams({ tab: nextTab }, { replace: true })}
        options={[
          { value: 'lists', label: 'Lists' },
          { value: 'watchlist', label: 'Watchlist' },
          { value: 'favourites', label: 'Favourites' },
        ]}
      />

      {error ? <div className="lists-error" role="alert"><p>{error}</p>
        <button type="button" className="view-more-btn" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</button>
      </div> : null}
      {previewWarning ? <p role="status" className="muted">{previewWarning}</p> : null}
      {isTabLoading ? <LoadingState label="Loading your library" /> : null}
      {!isTabLoading && !error && activeTab === 'watchlist' ? (
        <div className="library-tab-content">
          <MediaRow title="Watchlist Movies" items={watchlistMovies?.results ?? []} mediaType="movies" category="watchlist" />
          <MediaRow title="Watchlist TV Shows" items={watchlistTv?.results ?? []} mediaType="tv" category="watchlist" />
        </div>
      ) : null}

      {!isTabLoading && !error && activeTab === 'favourites' ? (
        <div className="library-tab-content">
          <MediaRow title="Favourite Movies" items={favoriteMovies?.results ?? []} mediaType="movies" category="favorite" />
          <MediaRow title="Favourite TV Shows" items={favoriteTv?.results ?? []} mediaType="tv" category="favorite" />
        </div>
      ) : null}

      {!isTabLoading && !error && activeTab === 'lists' ? (
        <div>
          <div className="lists-toolbar">
            <span className="muted">{accountLists?.total_results ?? 0} lists</span>
            <button type="button" className="view-more-btn" onClick={() => navigate('/library/create-list')}>Create a list</button>
          </div>
          <div className="library-lists-main">
            <AccountListCards
              lists={accountLists?.results ?? []}
              previewPostersByListId={listPreviewPostersById}
              onSelectList={(listId) => navigate(`/library/lists/${listId}`)}
            />
          </div>

        </div>
      ) : null}
    </section>
  );
}
