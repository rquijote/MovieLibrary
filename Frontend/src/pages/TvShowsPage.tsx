import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
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
  const [genreRows, setGenreRows] = useState<Partial<Record<TvShowsTab, GenreItemGroup<TvShowDto>[]>>>({});
  const [categoryErrors, setCategoryErrors] = useState<Partial<Record<TvShowsTab, string>>>({});

  useEffect(() => {
    if (genreRows[activeTab] !== undefined || categoryErrors[activeTab]) {
      return;
    }

    const load = async () => {
      try {
        const rows = await fetchGenreRows(
          tvGenres,
          (genreId) => buildTvShowDiscoveryEndpoint(activeTab, new Date(), genreId),
          (endpoint) => apiGet<{ results: TvShowDto[] }>(endpoint),
        );
        setGenreRows((current) => ({ ...current, [activeTab]: rows }));
      } catch (loadError) {
        setCategoryErrors((current) => ({
          ...current,
          [activeTab]: loadError instanceof Error ? loadError.message : 'Failed to load TV Shows page data.',
        }));
      }
    };

    void load();
  }, [activeTab, categoryErrors, genreRows]);

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  const activeError = categoryErrors[activeTab];
  if (activeError) {
    return <p>{activeError}</p>;
  }

  const activeGenreRows = genreRows[activeTab];
  if (!activeGenreRows) {
    return <p>Loading...</p>;
  }

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

      {activeGenreRows.length > 0 ? activeGenreRows.map(({ genre, items }) => (
        <MediaRow key={genre.id} title={genre.name} mediaType="tv" category={activeTab} genreId={genre.id} items={items} />
      )) : <p>No shows found for this category.</p>}
    </>
  );
}
