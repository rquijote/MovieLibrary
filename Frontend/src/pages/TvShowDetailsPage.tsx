import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import { getImageUrl } from '../lib/media';
import type { TvShowDto } from '../types/media';

interface StatusResponse {
  success: boolean;
  status_code: number;
  status_message: string;
}

export function TvShowDetailsPage() {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState<TvShowDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [ratingOutOfFive, setRatingOutOfFive] = useState('0');

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setTvShow(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await apiGet<TvShowDto>(`/api/TvShow/${id}`);
        setTvShow(result);
      } catch {
        setTvShow(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!tvShow) {
    return <p>TV show not found.</p>;
  }

  const genres = tvShow.genres?.map((genre) => genre.name).filter(Boolean) ?? [];
  const runtimeMinutes = tvShow.episode_run_time?.[0];
  const runtime = runtimeMinutes && runtimeMinutes > 0 ? `${runtimeMinutes} minutes` : 'Not available';

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

    await runAction(() => apiPost<StatusResponse>(`/api/TvShow/${tvShow.id}/rating?rating=${parsed * 2}`, {}));
  };

  return (
    <div className="details-view">
      <div className="details-header">
        <img src={getImageUrl(tvShow.poster_path ?? tvShow.backdrop_path)} alt={tvShow.name} className="details-poster" />

        <div>
          <h1>{tvShow.name}</h1>
          {tvShow.original_name && tvShow.original_name !== tvShow.name ? (
            <p>
              <strong>Original Name:</strong> {tvShow.original_name}
            </p>
          ) : null}
          <p>
            <strong>First Air Date:</strong> {tvShow.first_air_date}
          </p>
          <p>
            <strong>Runtime:</strong> {runtime}
          </p>
          <p>
            <strong>Rating:</strong> {tvShow.vote_average.toFixed(1)} / 10 ({tvShow.vote_count} votes)
          </p>
          <p>
            <strong>Popularity:</strong> {tvShow.popularity.toFixed(1)}
          </p>
          <p>
            <strong>Original Language:</strong> {tvShow.original_language.toUpperCase()}
          </p>
          <p>
            <strong>ID:</strong> {tvShow.id}
          </p>
          {tvShow.origin_country.length > 0 ? (
            <p>
              <strong>Origin Country:</strong> {tvShow.origin_country.join(', ')}
            </p>
          ) : null}
        </div>
      </div>

      {tvShow.overview ? (
        <section>
          <h2>Overview</h2>
          <p>{tvShow.overview}</p>
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
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/watchlist', { media_type: 'tv', media_id: tvShow.id, watchlist: true }))}>
            Add to watchlist
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/watchlist', { media_type: 'tv', media_id: tvShow.id, watchlist: false }))}>
            Remove from watchlist
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/favorite', { media_type: 'tv', media_id: tvShow.id, favorite: true }))}>
            Add to favorites
          </button>
          <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiPost<StatusResponse>('/api/Account/favorite', { media_type: 'tv', media_id: tvShow.id, favorite: false }))}>
            Remove from favorites
          </button>
          <div className="rating-control">
            <label htmlFor="tv-rating">Rating (0-5)</label>
            <input
              id="tv-rating"
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
            <button type="button" className="view-more-btn" disabled={isActionLoading} onClick={() => void runAction(() => apiDelete<StatusResponse>(`/api/TvShow/${tvShow.id}/rating`))}>
              Remove rating
            </button>
          </div>
          <p>TMDB custom lists currently support movies only.</p>
          {actionMessage ? <p>{actionMessage}</p> : null}
        </div>
      </section>

      {tvShow.backdrop_path ? (
        <section>
          <h3>Backdrop Image</h3>
          <img src={getImageUrl(tvShow.backdrop_path)} alt={`${tvShow.name} backdrop`} className="details-backdrop" />
        </section>
      ) : null}
    </div>
  );
}
