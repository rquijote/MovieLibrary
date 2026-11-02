import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditsSection } from '../components/media-details/CreditsSection';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { TvSeasonDetailsDto } from '../types/media';

export function TvSeasonDetailsPage() {
  const { id, seasonNumber } = useParams();
  const [season, setSeason] = useState<TvSeasonDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !seasonNumber) {
        setError('TV show or season was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const seasonResult = await apiGet<TvSeasonDetailsDto>(`/api/TvShow/${id}/season/${seasonNumber}`);
        setSeason(seasonResult);
        setError(null);
      } catch (loadError) {
        setSeason(null);
        setError(loadError instanceof Error ? loadError.message : 'Season details could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id, seasonNumber]);

  if (isLoading) return <LoadingState variant="details" label="Loading season details" />;
  if (!season) return <p role="alert">{error ?? 'Season not found.'}</p>;

  return (
    <div className="details-view">
      <p><Link to={`/tv/${id}`}>← Back to TV show</Link></p>
      <div className="season-header">
        <img
          src={getImageUrl(season.poster_path)}
          alt=""
          onError={handleMediaImageError}
        />
        <div>
          <h1>{season.name}</h1>
          <p>{season.episode_count} episodes · {season.air_date ?? 'Air date unavailable'}</p>
          {season.overview ? <p>{season.overview}</p> : null}
        </div>
      </div>

      <section className="media-detail-section">
        <h2>Episodes</h2>
        <div className="episode-list">
          {season.episodes.map((episode) => (
            <Link
              className="episode-card"
              key={episode.id}
              to={`/tv/${id}/season/${season.season_number}/episode/${episode.episode_number}`}
            >
              <img src={getImageUrl(episode.still_path)} alt="" onError={handleMediaImageError} loading="lazy" />
              <div>
                <h3>{episode.episode_number}. {episode.name}</h3>
                <p>{episode.air_date ?? 'Air date unavailable'}{episode.runtime ? ` · ${episode.runtime} min` : ''}</p>
                {episode.overview ? <p>{episode.overview}</p> : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {season.credits ? <CreditsSection cast={season.credits.cast} /> : null}
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
