import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaActionsPanel } from '../components/MediaActionsPanel';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { MovieDto } from '../types/media';

export function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setMovie(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await apiGet<MovieDto>(`/api/Movie/${id}`);
        setMovie(result);
      } catch {
        setMovie(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!movie) {
    return <p>Movie not found.</p>;
    }

  return (
    <div className="details-view">
      <div className="details-header">
        <img
          src={getImageUrl(movie.poster_path ?? movie.backdrop_path)}
          alt={movie.title}
          className="details-poster"
          onError={handleMediaImageError}
        />

        <div>
          <h1>{movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title ? (
            <p>
              <strong>Original Title:</strong> {movie.original_title}
            </p>
          ) : null}
          <p>
            <strong>Release Year:</strong> {movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}
          </p>
          <p>
            <strong>Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : 'Unavailable'}
          </p>
          <p>
            <strong>Rating:</strong> {movie.vote_average.toFixed(1)} / 10 ({movie.vote_count} votes)
          </p>
          <p>
            <strong>Popularity:</strong> {movie.popularity.toFixed(1)}
          </p>
          <p>
            <strong>Original Language:</strong> {movie.original_language.toUpperCase()}
          </p>
          <p>
            <strong>ID:</strong> {movie.id}
          </p>

          <MediaActionsPanel mediaId={movie.id} mediaType="movie" />
        </div>
      </div>

      {movie.overview ? (
        <section>
          <h2>Overview</h2>
          <p>{movie.overview}</p>
        </section>
      ) : null}

      {movie.genres && movie.genres.length > 0 ? (
        <section>
          <h3>Genres</h3>
          <p>{movie.genres.map((genre) => genre.name).join(', ')}</p>
        </section>
      ) : null}

      {movie.genre_ids.length > 0 ? (
        <section>
          <h3>Genre IDs</h3>
          <p>{movie.genre_ids.join(', ')}</p>
        </section>
      ) : null}

      {movie.backdrop_path ? (
        <section>
          <h3>Backdrop Image</h3>
          <img
            src={getImageUrl(movie.backdrop_path)}
            alt={`${movie.title} backdrop`}
            className="details-backdrop"
            onError={handleMediaImageError}
          />
        </section>
      ) : null}
    </div>
  );
}
