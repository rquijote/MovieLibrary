import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MiniHeaderTabs } from '../components/layout/MiniHeaderTabs';
import { apiGet } from '../lib/api';
import { formatDateForApi, getNextMonthDateRange, getValidTab } from '../lib/pageHelpers';
import type { TvShowListResponse } from '../types/media';

type TvShowsTab = 'upcoming' | 'on-the-air' | 'popular' | 'top-rated';
const tvShowsTabs = ['upcoming', 'on-the-air', 'popular', 'top-rated'] as const;

export function TvShowsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab: TvShowsTab = getValidTab(tabParam, tvShowsTabs, 'upcoming');
  const [upcoming, setUpcoming] = useState<TvShowListResponse | null>(null);
  const [onTheAir, setOnTheAir] = useState<TvShowListResponse | null>(null);
  const [popular, setPopular] = useState<TvShowListResponse | null>(null);
  const [topRated, setTopRated] = useState<TvShowListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { startDate, endDate } = getNextMonthDateRange();

    const load = async () => {
      try {
        const [upcomingData, onTheAirData, popularData, topRatedData] = await Promise.all([
          apiGet<TvShowListResponse>(
            `/api/Discover/tv?FirstAirDateGte=${formatDateForApi(startDate)}&FirstAirDateLte=${formatDateForApi(endDate)}`,
          ),
          apiGet<TvShowListResponse>('/api/TvShowLists/on-the-air'),
          apiGet<TvShowListResponse>('/api/TvShowLists/popular'),
          apiGet<TvShowListResponse>('/api/TvShowLists/top-rated'),
        ]);

        setUpcoming(upcomingData);
        setOnTheAir(onTheAirData);
        setPopular(popularData);
        setTopRated(topRatedData);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load TV Shows page data.');
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!tabParam) {
      setSearchParams({ tab: activeTab }, { replace: true });
    }
  }, [activeTab, setSearchParams, tabParam]);

  if (error) {
    return <p>{error}</p>;
  }

  if (!upcoming || !onTheAir || !popular || !topRated) {
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

      {activeTab === 'upcoming' ? (
        <MediaRow title="Upcoming" mediaType="tv" category="upcoming" items={upcoming.results} />
      ) : null}
      {activeTab === 'on-the-air' ? (
        <MediaRow title="On The Air" mediaType="tv" category="on-the-air" items={onTheAir.results} />
      ) : null}
      {activeTab === 'popular' ? (
        <MediaRow title="Popular" mediaType="tv" category="popular" items={popular.results} />
      ) : null}
      {activeTab === 'top-rated' ? (
        <MediaRow title="Top Rated" mediaType="tv" category="top-rated" items={topRated.results} />
      ) : null}
    </>
  );
}
