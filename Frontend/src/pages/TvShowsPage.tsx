import { useEffect, useState } from 'react';
import { MediaRow } from '../components/MediaRow';
import { apiGet } from '../lib/api';
import type { TvShowListResponse } from '../types/media';

export function TvShowsPage() {
  const [upcoming, setUpcoming] = useState<TvShowListResponse | null>(null);
  const [onTheAir, setOnTheAir] = useState<TvShowListResponse | null>(null);
  const [popular, setPopular] = useState<TvShowListResponse | null>(null);
  const [topRated, setTopRated] = useState<TvShowListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const load = async () => {
      try {
        const [upcomingData, onTheAirData, popularData, topRatedData] = await Promise.all([
          apiGet<TvShowListResponse>(
            `/api/Discover/tv?FirstAirDateGte=${formatDate(today)}&FirstAirDateLte=${formatDate(nextMonth)}`,
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

  if (error) {
    return <p>{error}</p>;
  }

  if (!upcoming || !onTheAir || !popular || !topRated) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <h1>TV Shows</h1>
      <MediaRow title="Upcoming" mediaType="tv" category="upcoming" items={upcoming.results} />
      <MediaRow title="On The Air" mediaType="tv" category="on-the-air" items={onTheAir.results} />
      <MediaRow title="Popular" mediaType="tv" category="popular" items={popular.results} />
      <MediaRow title="Top Rated" mediaType="tv" category="top-rated" items={topRated.results} />
    </>
  );
}
