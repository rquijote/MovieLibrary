import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import { useGenrePreferences } from '../lib/genrePreferences';
import { fetchGenreRows, tvGenres, type GenreItemGroup } from '../lib/genres';
import { buildTvShowDiscoveryEndpoint } from '../lib/media';
import { getValidTab } from '../lib/pageHelpers';
import type { TvShowDto } from '../types/media';

type TvShowsTab = 'upcoming' | 'on-the-air' | 'popular' | 'top-rated';
const tvShowsTabs = ['upcoming', 'on-the-air', 'popular', 'top-rated'] as const;

export function TvShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TvShowsTab = getValidTab(tabParam, tvShowsTabs, 'upcoming');
  const [genreRows, setGenreRows] = useState<Record<string, GenreItemGroup<TvShowDto>[]>>({});
  const [genreLoading, setGenreLoading] = useState<Record<string, boolean>>({});
  const [categoryErrors, setCategoryErrors] = useState<Record<string, string>>({});
  const genrePreferences = useGenrePreferences();
  const selectedGenreKey = genrePreferences.tv.join(',');
  const dataKey = `${activeTab}:${selectedGenreKey}`;

  useEffect(() => {
    if (genreRows[dataKey] !== undefined || !selectedGenreKey || categoryErrors[dataKey]) {
      return;
    }

    const load = async () => {
      try {
        const selectedIds = new Set(selectedGenreKey.split(',').map(Number));
        const selectedGenres = tvGenres.filter(({ id }) => selectedIds.has(id));
        setGenreLoading((current) => ({ ...current, [dataKey]: true }));
        const rows = await fetchGenreRows(
          selectedGenres,
          (genreId) => buildTvShowDiscoveryEndpoint(activeTab, new Date(), genreId),
          (endpoint) => apiGet<{ results: TvShowDto[] }>(endpoint),
          (group) => setGenreRows((current) => {
            const existing = current[dataKey] ?? [];
            return existing.some(({ genre }) => genre.id === group.genre.id)
              ? current
              : { ...current, [dataKey]: [...existing, group] };
          }),
        );
        setGenreRows((current) => ({ ...current, [dataKey]: rows }));
        setGenreLoading((current) => ({ ...current, [dataKey]: false }));
      } catch (loadError) {
        setCategoryErrors((current) => ({
          ...current,
          [dataKey]: loadError instanceof Error ? loadError.message : 'Failed to load TV Shows page data.',
        }));
        setGenreLoading((current) => ({ ...current, [dataKey]: false }));
      }
    };

    void load();
  }, [activeTab, categoryErrors, dataKey, genreRows, selectedGenreKey]);

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  const activeError = categoryErrors[dataKey];
  if (activeError) {
    return <p>{activeError}</p>;
  }

  const activeGenreRows = genreRows[dataKey];
  const isGenreLoading = Boolean(genreLoading[dataKey]);

  return (
    <>
      <h1>TV Shows</h1>
      <MiniHeaderTabs
        value={activeTab}
        ariaLabel="TV show categories"
        onChange={(nextTab) => setSearchParams({ tab: nextTab }, { replace: true })}
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'on-the-air', label: 'On The Air' },
          { value: 'popular', label: 'Popular' },
          { value: 'top-rated', label: 'Top Rated' },
        ]}
      />

      {selectedGenreKey.length === 0 ? (
        <p>Choose TV genres from your profile to see recommendations here.</p>
      ) : (
        <>
          {activeGenreRows?.map(({ genre, items }) => (
            <MediaRow key={genre.id} title={genre.name} mediaType="tv" category={activeTab} genreId={genre.id} items={items} preferImages />
          ))}
          {isGenreLoading ? <LoadingState variant={activeGenreRows?.length ? 'inline' : 'rows'} label="Loading selected genres" /> : null}
          {!isGenreLoading && activeGenreRows?.length === 0 ? <p>No shows found for this category.</p> : null}
          {!isGenreLoading && !activeGenreRows ? <LoadingState label="Loading TV shows" /> : null}
        </>
      )}
    </>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
