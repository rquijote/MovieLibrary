import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import { useGenrePreferences } from '../lib/genrePreferences';
import { fetchGenreRows, movieGenres, type GenreItemGroup } from '../lib/genres';
import { buildMovieDiscoveryEndpoint, fetchFirstPages } from '../lib/media';
import { getValidTab } from '../lib/pageHelpers';
import type { MovieDto, MovieListResponse } from '../types/media';

type MoviesTab = 'popular' | 'top-rated' | 'trending' | 'upcoming'; // The types that define valid tab values.
const movieTabs = ['popular', 'top-rated', 'trending', 'upcoming'] as const; // The runtime const used in getValidTab().

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: MoviesTab = getValidTab(tabParam, movieTabs, 'popular');
  const [genreRows, setGenreRows] = useState<Record<string, GenreItemGroup<MovieDto>[]>>({});
  const [genreLoading, setGenreLoading] = useState<Record<string, boolean>>({});
  const [trending, setTrending] = useState<MovieListResponse | null>(null);
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const genrePreferences = useGenrePreferences();
  const selectedGenreKey = genrePreferences.movies.join(',');
  const dataKey = activeTab === 'trending' ? activeTab : `${activeTab}:${selectedGenreKey}`;

  useEffect(() => {
    if ((activeTab === 'trending' ? trending !== null : genreRows[dataKey] !== undefined || !selectedGenreKey)
      || categoryErrors[dataKey]) {
      return;
    }

    const load = async () => {
      try {
        if (activeTab === 'trending') {
          const data = await fetchFirstPages(
            '/api/Trending/movies?timeWindow=week',
            (pageEndpoint) => apiGet<MovieListResponse>(pageEndpoint),
          );
          setTrending(data);
        } else {
          const selectedIds = new Set(selectedGenreKey.split(',').map(Number));
          const selectedGenres = movieGenres.filter(({ id }) => selectedIds.has(id));
          setGenreLoading((current) => ({ ...current, [dataKey]: true }));
          const rows = await fetchGenreRows(
            selectedGenres,
            (genreId) => buildMovieDiscoveryEndpoint(activeTab, new Date(), genreId),
            (endpoint) => apiGet<MovieListResponse>(endpoint),
            (group) => setGenreRows((current) => {
              const existing = current[dataKey] ?? [];
              return existing.some(({ genre }) => genre.id === group.genre.id)
                ? current
                : { ...current, [dataKey]: [...existing, group] };
            }),
          );
          setGenreRows((current) => ({ ...current, [dataKey]: rows }));
          setGenreLoading((current) => ({ ...current, [dataKey]: false }));
        }
      } catch (loadError) {
        setCategoryErrors((current) => ({
          ...current,
          [dataKey]: loadError instanceof Error ? loadError.message : 'Failed to load Movies page data.',
        }));
        setGenreLoading((current) => ({ ...current, [dataKey]: false }));
      }
    };

    void load();
  }, [activeTab, categoryErrors, dataKey, genreRows, selectedGenreKey, trending]);

  // Keep the URL explicit: if no tab is provided, write the resolved fallback tab to query params.
  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  const activeError = categoryErrors[dataKey];
  if (activeError) {
    return <p>{activeError}</p>;
  }

  const activeGenreRows = activeTab === 'trending' ? undefined : genreRows[dataKey];
  const isLoading = (activeTab === 'trending' && !trending)
    || (activeTab !== 'trending' && selectedGenreKey.length > 0 && !activeGenreRows);
  const isGenreLoading = activeTab !== 'trending' && Boolean(genreLoading[dataKey]);

  return (
    <>
      <h1>Movies</h1>
      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="Movie categories"
        onChange={(nextTab) => setSearchParams({ tab: nextTab }, { replace: true })}
        options={[
          { value: 'popular', label: 'Popular' },
          { value: 'top-rated', label: 'Top Rated' },
          { value: 'trending', label: 'Trending This Week' },
          { value: 'upcoming', label: 'Upcoming' },
        ]}
      />

      {activeTab !== 'trending' && selectedGenreKey.length === 0 ? (
        <p>Choose movie genres from your profile to see recommendations here.</p>
      ) : activeTab === 'trending' ? (
        isLoading ? <LoadingState label="Loading movies" /> : <MediaRow title="Trending This Week" mediaType="movies" category="trending" items={trending?.results ?? []} preferImages />
      ) : (
        <>
          {activeGenreRows?.map(({ genre, items }) => (
            <MediaRow key={genre.id} title={genre.name} mediaType="movies" category={activeTab} genreId={genre.id} items={items} preferImages />
          ))}
          {isGenreLoading ? <LoadingState variant={activeGenreRows?.length ? 'inline' : 'rows'} label="Loading selected genres" /> : null}
          {!isGenreLoading && activeGenreRows?.length === 0 ? <p>No movies found for this category.</p> : null}
        </>
      )}
    </>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
