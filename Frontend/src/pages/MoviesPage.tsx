import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/MediaRow';
import { MiniHeaderTabs } from '../components/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import { formatDateForApi, getNextMonthDateRange, getValidTab } from '../lib/pageHelpers';
import type { MovieListResponse } from '../types/media';

type MoviesTab = 'popular' | 'top-rated' | 'upcoming'; // The types that define valid tab values.
const movieTabs = ['popular', 'top-rated', 'upcoming'] as const; // The runtime const used in getValidTab().

export function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: MoviesTab = getValidTab(tabParam, movieTabs, 'popular');
  const [popular, setPopular] = useState<MovieListResponse | null>(null);
  const [topRated, setTopRated] = useState<MovieListResponse | null>(null);
  const [upcoming, setUpcoming] = useState<MovieListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const { startDate, endDate } = getNextMonthDateRange();
      const load = async () => {
        try {
        const [popularData, topRatedData, upcomingData] = await Promise.all([
          apiGet<MovieListResponse>('/api/MovieLists/popular'),
          apiGet<MovieListResponse>('/api/MovieLists/top-rated'),
          apiGet<MovieListResponse>(`/api/Discover/movies?PrimaryReleaseDateGte=${formatDateForApi(startDate)}&PrimaryReleaseDateLte=${formatDateForApi(endDate)}`),
        ]);

        setPopular(popularData);
        setTopRated(topRatedData);
        setUpcoming(upcomingData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load Movies page data.');
      }
    };

    void load();
  }, []);

  // Keep the URL explicit: if no tab is provided, write the resolved fallback tab to query params.
  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!popular || !topRated || !upcoming) {
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
          { value: 'upcoming', label: 'Upcoming' },
        ]}
      />

      {activeTab === 'popular' ? (
        <MediaRow title="Popular" mediaType="movies" category="popular" items={popular.results} />
      ) : null}
      {activeTab === 'top-rated' ? (
        <MediaRow title="Top Rated" mediaType="movies" category="top-rated" items={topRated.results} />
      ) : null}
      {activeTab === 'upcoming' ? (
        <MediaRow title="Upcoming" mediaType="movies" category="upcoming" items={upcoming.results} />
      ) : null}
    </>
  );
}
