import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { getImageUrl } from '../lib/media';
import type { MovieDto } from '../types/media';

interface StatusResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

export function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<MovieDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [ratingOutOfFive, setRatingOutOfFive] = useState('0');
  const [listId, setListId] = useState('');

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

  const genres = movie.genres?.map((genre) => genre.name).filter(Boolean) ?? [];
  const runtime = movie.runtime && movie.runtime > 0 ? `${movie.runtime} minutes` : 'Not available';

  const runAction = async (action: () => Promise<StatusResponse>) => {
    setIsActionLoading(true);
    setActionMessage(null);
    try {
      const result = await action();
      setActionMessage(result.status_message ?? `Status code: ${result.status_code}`);
    } catch (error) {
      setActionMessage(error instanceof Error ? error.message : 'Action failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRatingSubmit = async () => {
    const parsed = Number(ratingOutOfFive);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
      setActionMessage('Rating must be between 0 and 5.');
      return;
    }

    await runAction(() => apiPost<StatusResponse>(`/api/Movie/${movie.id}/rating?rating=${parsed * 2}`, {}));
  };

  const handleListUpdate = async (path: 'add_item' | 'remove_item') => {
    const parsedListId = Number(listId);
    if (!Number.isInteger(parsedListId) || parsedListId <= 0) {
      setActionMessage('List ID must be a positive whole number.');
      return;
    }

    await runAction(() => apiPost<StatusResponse>(`/api/Lists/${parsedListId}/${path}`, { media_id: movie.id }));
  };

  return (
    <div className="details-view">
      <div className="details-header">
        <img src={getImageUrl(movie.poster_path ?? movie.backdrop_path)} alt={movie.title} className="details-poster" />

        <div>
          <h1>{movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title ? (
            <p>
              <strong>Original Title:</strong> {movie.original_title}
            </p>
          ) : null}
          <p>
            <strong>Release Date:</strong> {movie.release_date}
          </p>
          <p>
            <strong>Runtime:</strong> {runtime}
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
        </div>
      </div>

      {movie.overview ? (
        <section>
          <h2>Overview</h2>
          <p>{movie.overview}</p>
        </section>
      ) : null}

      {genres.length > 0 ? (
        <section>
          <h3>Genres</h3>
          <p>{genres.join(', ')}</p>
        </section>
      ) : null}

      <section>
        <h3>Actions</h3>
        <div className="media-actions">
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/watchlist', { media_type: 'movie', media_id: movie.id, watchlist: true }))}>
            Add to watchlist
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/watchlist', { media_type: 'movie', media_id: movie.id, watchlist: false }))}>
            Remove from watchlist
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/favorite', { media_type: 'movie', media_id: movie.id, favorite: true }))}>
            Add to favorites
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/favorite', { media_type: 'movie', media_id: movie.id, favorite: false }))}>
            Remove from favorites
          </button>
          <div className="rating-control">
            <label htmlFor="movie-rating">Rating (0-5)</label>
            <input
              id="movie-rating"
              type="number"
              min="0"
              max="5"
              step="0.5"
              value={ratingOutOfFive}
              onChange={(event) => setRatingOutOfFive(event.target.value)}
              disabled={isActionLoading}
            />
            <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void handleRatingSubmit()}>
              Save rating
            </button>
            <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiDelete<StatusResponse>(`/api/Movie/${movie.id}/rating`))}>
              Remove rating
            </button>
          </div>
          <div className="rating-control">
            <label htmlFor="movie-list-id">List ID</label>
            <input
              id="movie-list-id"
              type="number"
              min="1"
              step="1"
              value={listId}
              onChange={(event) => setListId(event.target.value)}
              disabled={isActionLoading}
            />
            <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void handleListUpdate('add_item')}>
              Add to list
            </button>
            <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void handleListUpdate('remove_item')}>
              Remove from list
            </button>
          </div>
          {actionMessage ? <p>{actionMessage}</p> : null}
        </div>
      </section>

      {movie.backdrop_path ? (
        <section>
          <h3>Backdrop Image</h3>
          <img src={getImageUrl(movie.backdrop_path)} alt={`${movie.title} backdrop`} className="details-backdrop" />
        </section>
      ) : null}
    </div>
  );
}
