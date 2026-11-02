import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MediaRow } from '../components/layout/MediaRow';
import { MediaActionsPanel } from '../components/media-actions/MediaActionsPanel';
import { CreditsSection } from '../components/media-details/CreditsSection';
import { MediaExtras } from '../components/media-details/MediaExtras';
import { MediaTitleHero } from '../components/media-details/MediaTitleHero';
import { apiGet } from '../lib/api';
import { tmdbDetailsCacheProjection } from '../lib/tmdbCache';
import type { MovieDto } from '../types/media';

export function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setMovie(null);
        setError('Movie ID was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const path = `/api/Movie/${id}`;
        const result = await apiGet<MovieDto>(path, tmdbDetailsCacheProjection(path));
        setMovie(result);
        setError(null);
      } catch (loadError) {
        setMovie(null);
        setError(loadError instanceof Error ? loadError.message : 'Movie details could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return <LoadingState variant="details" label="Loading movie details" />;
  }

  if (!movie) {
    if (error) return <p role="alert">{error}</p>;
    return <p>Movie not found.</p>;
  }

  return (
    <div className="details-view">
      <MediaTitleHero
        title={movie.title}
        originalTitle={movie.original_title}
        backdropPath={movie.backdrop_path}
        posterPath={movie.poster_path}
        posterAlt={movie.title}
        metadata={[
          movie.release_date ? movie.release_date.slice(0, 4) : 'Release date unavailable',
          movie.runtime ? `${movie.runtime} min` : 'Runtime unavailable',
          movie.original_language.toUpperCase(),
          ...(movie.status ? [movie.status] : []),
        ]}
        rating={movie.vote_average}
        voteCount={movie.vote_count}
        genres={movie.genres?.map((genre) => genre.name)}
        tagline={movie.tagline}
      >
        <MediaActionsPanel mediaId={movie.id} mediaType="movie" />
      </MediaTitleHero>

      <div className="media-summary-grid">
        <div className="media-summary-main">
          {movie.overview ? (
            <section className="media-detail-section media-overview">
              <h2>Overview</h2>
              <p>{movie.overview}</p>
            </section>
          ) : null}
          <MediaExtras videos={movie.videos} />
        </div>

        <section className="media-detail-section">
          <h2>At a glance</h2>
          <div className="media-facts-grid">
            {movie.budget ? <p className="media-fact-wide"><strong>Budget:</strong> <span className="media-currency">{formatCurrency(movie.budget)}</span></p> : null}
            {movie.revenue ? <p className="media-fact-wide"><strong>Revenue:</strong> <span className="media-currency">{formatCurrency(movie.revenue)}</span></p> : null}
            {movie.production_companies && movie.production_companies.length > 0 ? (
              <p><strong>Production:</strong> {movie.production_companies.map((company) => company.name).join(', ')}</p>
            ) : null}
            {movie.production_countries && movie.production_countries.length > 0 ? (
              <p><strong>Countries:</strong> {movie.production_countries.map((country) => country.name).join(', ')}</p>
            ) : null}
            {movie.spoken_languages && movie.spoken_languages.length > 0 ? (
              <p><strong>Languages:</strong> {movie.spoken_languages.map((language) => language.english_name).join(', ')}</p>
            ) : null}
            {movie.belongs_to_collection ? (
              <p className="media-fact-wide"><strong>Collection:</strong> <Link to={`/collection/${movie.belongs_to_collection.id}`}>{movie.belongs_to_collection.name}</Link></p>
            ) : null}
          </div>
          {movie.homepage || movie.imdb_id ? (
            <div className="media-resource-links">
              {movie.homepage ? <div><a href={movie.homepage} target="_blank" rel="noreferrer">Official website</a></div> : null}
              {movie.imdb_id ? <div><a href={`https://www.imdb.com/title/${movie.imdb_id}/`} target="_blank" rel="noreferrer">IMDb page</a></div> : null}
            </div>
          ) : null}
        </section>
      </div>

      {movie.recommendations?.results.length ? (
        <MediaRow title="Recommended Movies" items={movie.recommendations.results.slice(0, 6)} mediaType="movies"
          expandedPath={`/movies/${movie.id}/recommendations`} />
      ) : null}
      {movie.similar?.results.length ? (
        <MediaRow title="Similar Movies" items={movie.similar.results.slice(0, 6)} mediaType="movies"
          expandedPath={`/movies/${movie.id}/similar`} />
      ) : null}
      {movie.credits ? <CreditsSection cast={movie.credits.cast} /> : null}
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}
import { LoadingState } from '../components/layout/LoadingState';
