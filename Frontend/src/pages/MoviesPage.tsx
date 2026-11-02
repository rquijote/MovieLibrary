import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
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
  const [genreRows, setGenreRows] = useState<Partial<Record<Exclude<MoviesTab, 'trending'>, GenreItemGroup<MovieDto>[]>>>({});
  const [trending, setTrending] = useState<MovieListResponse | null>(null);
  const [categoryErrors, setCategoryErrors] = useState<Partial<Record<MoviesTab, string>>>({});

  useEffect(() => {
    if ((activeTab === 'trending' ? trending !== null : genreRows[activeTab] !== undefined) || categoryErrors[activeTab]) {
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
          const rows = await fetchGenreRows(
            movieGenres,
            (genreId) => buildMovieDiscoveryEndpoint(activeTab, new Date(), genreId),
            (endpoint) => apiGet<MovieListResponse>(endpoint),
          );
          setGenreRows((current) => ({ ...current, [activeTab]: rows }));
        }
      } catch (loadError) {
        setCategoryErrors((current) => ({
          ...current,
          [activeTab]: loadError instanceof Error ? loadError.message : 'Failed to load Movies page data.',
        }));
      }
    };

    void load();
  }, [activeTab, categoryErrors, genreRows, trending]);

  // Keep the URL explicit: if no tab is provided, write the resolved fallback tab to query params.
  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  const activeError = categoryErrors[activeTab];
  if (activeError) {
    return <p>{activeError}</p>;
  }

  const activeGenreRows = activeTab === 'trending' ? undefined : genreRows[activeTab];
  if ((activeTab === 'trending' && !trending) || (activeTab !== 'trending' && !activeGenreRows)) {
    return <p>Loading...</p>;
  }

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

      {activeTab === 'trending' ? (
        <MediaRow title="Trending This Week" mediaType="movies" category="trending" items={trending?.results ?? []} />
      ) : activeGenreRows && activeGenreRows.length > 0 ? (
        activeGenreRows.map(({ genre, items }) => (
          <MediaRow key={genre.id} title={genre.name} mediaType="movies" category={activeTab} genreId={genre.id} items={items} />
        ))
      ) : <p>No movies found for this category.</p>}
    </>
  );
}
