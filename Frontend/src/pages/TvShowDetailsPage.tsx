import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MediaActionsPanel } from '../components/media-actions/MediaActionsPanel';
import { CreditsSection } from '../components/media-details/CreditsSection';
import { MediaExtras } from '../components/media-details/MediaExtras';
import { MediaTitleHero } from '../components/media-details/MediaTitleHero';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import { tmdbDetailsCacheProjection } from '../lib/tmdbCache';
import type { TvShowDto } from '../types/media';

export function TvShowDetailsPage() {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState<TvShowDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setTvShow(null);
        setError('TV show ID was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const path = `/api/TvShow/${id}`;
        const result = await apiGet<TvShowDto>(path, tmdbDetailsCacheProjection(path));
        setTvShow(result);
        setError(null);
      } catch (loadError) {
        setTvShow(null);
        setError(loadError instanceof Error ? loadError.message : 'TV show details could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return <LoadingState variant="details" label="Loading TV show details" />;
  }

  if (!tvShow) {
    if (error) return <p role="alert">{error}</p>;
    return <p>TV show not found.</p>;
  }

  return (
    <div className="details-view">
      <MediaTitleHero
        title={tvShow.name}
        originalTitle={tvShow.original_name}
        backdropPath={tvShow.backdrop_path}
        posterPath={tvShow.poster_path}
        posterAlt={tvShow.name}
        metadata={[
          tvShow.first_air_date ? tvShow.first_air_date.slice(0, 4) : 'First air date unavailable',
          `${tvShow.number_of_seasons ?? 0} seasons`,
          `${tvShow.number_of_episodes ?? 0} episodes`,
          tvShow.original_language.toUpperCase(),
          ...(tvShow.status ? [tvShow.status] : []),
        ]}
        rating={tvShow.vote_average}
        voteCount={tvShow.vote_count}
        genres={tvShow.genres?.map((genre) => genre.name)}
        tagline={tvShow.tagline}
      >
        <MediaActionsPanel mediaId={tvShow.id} mediaType="tv" showListActions={false} />
      </MediaTitleHero>

      {tvShow.next_episode_to_air ? (
        <p className="media-next-episode">
          <strong>Next episode:</strong> {tvShow.next_episode_to_air.air_date ?? 'Date unavailable'} · {tvShow.next_episode_to_air.name}
        </p>
      ) : null}

      <div className="media-summary-grid">
        <div className="media-summary-main">
          {tvShow.overview ? (
            <section className="media-detail-section media-overview">
              <h2>Overview</h2>
              <p>{tvShow.overview}</p>
            </section>
          ) : null}
          <MediaExtras videos={tvShow.videos} />
        </div>

        <section className="media-detail-section">
          <h2>At a glance</h2>
          <div className="media-facts-grid">
            {tvShow.last_air_date ? <p><strong>Last aired:</strong> {tvShow.last_air_date}</p> : null}
            {tvShow.episode_run_time && tvShow.episode_run_time.length > 0 ? (
              <p><strong>Episode runtime:</strong> {tvShow.episode_run_time.join(', ')} minutes</p>
            ) : null}
            {tvShow.created_by && tvShow.created_by.length > 0 ? (
              <p><strong>Created by:</strong> {tvShow.created_by.map((creator) => (
                <span key={creator.id}><Link to={`/person/${creator.id}`}>{creator.name}</Link>{' '}</span>
              ))}</p>
            ) : null}
            {tvShow.networks && tvShow.networks.length > 0 ? (
              <p><strong>Networks:</strong> {tvShow.networks.map((network) => network.name).join(', ')}</p>
            ) : null}
            {tvShow.production_companies && tvShow.production_companies.length > 0 ? (
              <p><strong>Production:</strong> {tvShow.production_companies.map((company) => company.name).join(', ')}</p>
            ) : null}
            {tvShow.production_countries && tvShow.production_countries.length > 0 ? (
              <p><strong>Countries:</strong> {tvShow.production_countries.map((country) => country.name).join(', ')}</p>
            ) : null}
            {tvShow.spoken_languages && tvShow.spoken_languages.length > 0 ? (
              <p><strong>Languages:</strong> {tvShow.spoken_languages.map((language) => language.english_name).join(', ')}</p>
            ) : null}
            {tvShow.last_episode_to_air ? (
              <p className="media-fact-wide"><strong>Latest episode:</strong>{' '}
                <Link to={`/tv/${tvShow.id}/season/${tvShow.last_episode_to_air.season_number}/episode/${tvShow.last_episode_to_air.episode_number}`}>
                  S{tvShow.last_episode_to_air.season_number} E{tvShow.last_episode_to_air.episode_number} · {tvShow.last_episode_to_air.name}
                </Link>
              </p>
            ) : null}
            {tvShow.origin_country.length > 0 ? <p><strong>Origin country:</strong> {tvShow.origin_country.join(', ')}</p> : null}
          </div>
          {tvShow.homepage || tvShow.external_ids?.imdb_id ? (
            <div className="media-resource-links">
              {tvShow.homepage ? <div><a href={tvShow.homepage} target="_blank" rel="noreferrer">Official website</a></div> : null}
              {tvShow.external_ids?.imdb_id ? <div><a href={`https://www.imdb.com/title/${tvShow.external_ids.imdb_id}/`} target="_blank" rel="noreferrer">IMDb page</a></div> : null}
            </div>
          ) : null}
        </section>
      </div>

      {tvShow.seasons && tvShow.seasons.length > 0 ? (
        <section className="media-detail-section">
          <h2>Explore seasons</h2>
          <div className="season-list">
            {tvShow.seasons.map((season) => (
              <Link className="season-card" key={season.id} to={`/tv/${tvShow.id}/season/${season.season_number}`}>
                <img
                  src={getImageUrl(season.poster_path)}
                  alt=""
                  onError={handleMediaImageError}
                  loading="lazy"
                />
                <span><strong>{season.name}</strong></span>
                <span>{season.episode_count} episodes · {season.air_date?.slice(0, 4) ?? 'Date unavailable'}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {tvShow.recommendations?.results.length ? (
        <MediaRow title="Recommended TV Shows" items={tvShow.recommendations.results.slice(0, 6)} mediaType="tv"
          expandedPath={`/tvshows/${tvShow.id}/recommendations`} />
      ) : null}
      {tvShow.similar?.results.length ? (
        <MediaRow title="Similar TV Shows" items={tvShow.similar.results.slice(0, 6)} mediaType="tv"
          expandedPath={`/tvshows/${tvShow.id}/similar`} />
      ) : null}
      {tvShow.aggregate_credits ? (
        <CreditsSection cast={tvShow.aggregate_credits.cast} aggregate />
      ) : null}
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
