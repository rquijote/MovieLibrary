import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CreditsSection } from '../components/media-details/CreditsSection';
import { MediaExtras } from '../components/media-details/MediaExtras';
import { apiGet } from '../lib/api';
import { getImageUrl } from '../lib/media';
import type { TvEpisodeDto } from '../types/media';

export function TvEpisodeDetailsPage() {
  const { id, seasonNumber, episodeNumber } = useParams();
  const [episode, setEpisode] = useState<TvEpisodeDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id || !seasonNumber || !episodeNumber) {
        setError('TV show, season, or episode was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const episodeResult = await apiGet<TvEpisodeDto>(
          `/api/TvShow/${id}/season/${seasonNumber}/episode/${episodeNumber}`,
        );
        setEpisode(episodeResult);
        setError(null);
      } catch (loadError) {
        setEpisode(null);
        setError(loadError instanceof Error ? loadError.message : 'Episode details could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id, seasonNumber, episodeNumber]);

  if (isLoading) return <LoadingState variant="details" label="Loading episode details" />;
  if (!episode) return <p role="alert">{error ?? 'Episode not found.'}</p>;

  return (
    <div className="details-view">
      <p><Link to={`/tv/${id}/season/${episode.season_number}`}>← Back to Season {episode.season_number}</Link></p>
      {episode.still_path ? (
        <div
          className="episode-hero"
          style={{ backgroundImage: `url(${getImageUrl(episode.still_path, 'original')})` }}
          aria-hidden="true"
        />
      ) : null}
      <section className="media-detail-section">
        <h1>{episode.name}</h1>
        <p>Season {episode.season_number}, Episode {episode.episode_number}</p>
        <p>{episode.air_date ?? 'Air date unavailable'}{episode.runtime ? ` · ${episode.runtime} minutes` : ''}</p>
        <p>Rating: {episode.vote_average.toFixed(1)} / 10 ({episode.vote_count} votes)</p>
        {episode.overview ? <p>{episode.overview}</p> : null}
        {episode.episode_type ? <p><strong>Episode type:</strong> {episode.episode_type}</p> : null}
      </section>
      {episode.credits ? <CreditsSection cast={episode.credits.cast} /> : null}
      <MediaExtras videos={episode.videos} />
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
