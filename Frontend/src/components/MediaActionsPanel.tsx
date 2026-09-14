import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { apiDelete, apiPost } from '../lib/api';
import type { StatusDto } from '../types/media';

interface MediaActionsPanelProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export function MediaActionsPanel({ mediaId, mediaType }: MediaActionsPanelProps) {
  const [ratingOutOf5, setRatingOutOf5] = useState(2.5);
  const [listId, setListId] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingEndpointPrefix = useMemo(() => (mediaType === 'movie' ? 'Movie' : 'TvShow'), [mediaType]);

  const handleWatchlist = async (add: boolean) => {
    try {
      const result = await apiPost<StatusDto>('/api/Account/watchlist', {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: add,
      });
      setStatusMessage(result.status_message ?? (add ? 'Added to watchlist.' : 'Removed from watchlist.'));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Watchlist update failed.');
    }
  };

  const handleFavorite = async (add: boolean) => {
    try {
      const result = await apiPost<StatusDto>('/api/Account/favorite', {
        media_type: mediaType,
        media_id: mediaId,
        favorite: add,
      });
      setStatusMessage(result.status_message ?? (add ? 'Added to favorites.' : 'Removed from favorites.'));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Favorites update failed.');
    }
  };

  const handleSetRating = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const result = await apiPost<StatusDto>(`/api/${ratingEndpointPrefix}/${mediaId}/rating?rating=${ratingOutOf5 * 2}`, null);
      setStatusMessage(result.status_message ?? `Rating updated to ${ratingOutOf5.toFixed(1)} / 5.`);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Rating update failed.');
    }
  };

  const handleDeleteRating = async () => {
    try {
      const result = await apiDelete<StatusDto>(`/api/${ratingEndpointPrefix}/${mediaId}/rating`);
      setStatusMessage(result.status_message ?? 'Rating removed.');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Deleting rating failed.');
    }
  };

  const handleList = async (action: 'add_item' | 'remove_item') => {
    const parsedListId = Number.parseInt(listId, 10);
    if (!parsedListId) {
      setErrorMessage('Enter a valid list ID.');
      return;
    }

    try {
      const result = await apiPost<StatusDto>(`/api/Lists/${parsedListId}/${action}`, mediaId);
      setStatusMessage(result.status_message ?? (action === 'add_item' ? 'Added to list.' : 'Removed from list.'));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'List update failed.');
    }
  };

  return (
    <section className="media-actions">
      <h2>Actions</h2>

      <div className="action-group">
        <button type="button" onClick={() => void handleWatchlist(true)}>
          Add to watchlist
        </button>
        <button type="button" onClick={() => void handleWatchlist(false)}>
          Remove from watchlist
        </button>
      </div>

      <div className="action-group">
        <button type="button" onClick={() => void handleFavorite(true)}>
          Add to favorites
        </button>
        <button type="button" onClick={() => void handleFavorite(false)}>
          Remove from favorites
        </button>
      </div>

      <form className="action-group rating-group" onSubmit={(event) => void handleSetRating(event)}>
        <label htmlFor="ratingOutOf5">
          Rate out of 5 (sent as ×2):
          <input
            id="ratingOutOf5"
            type="number"
            min={0.5}
            max={5}
            step={0.5}
            value={ratingOutOf5}
            onChange={(event) => setRatingOutOf5(Number(event.target.value))}
          />
        </label>
        <button type="submit">Submit rating</button>
        <button type="button" onClick={() => void handleDeleteRating()}>
          Remove rating
        </button>
      </form>

      <div className="action-group list-group">
        <label htmlFor="listId">
          List ID:
          <input id="listId" type="number" min={1} value={listId} onChange={(event) => setListId(event.target.value)} />
        </label>
        <button type="button" onClick={() => void handleList('add_item')}>
          Add to list
        </button>
        <button type="button" onClick={() => void handleList('remove_item')}>
          Remove from list
        </button>
      </div>

      {statusMessage ? <p className="action-status">{statusMessage}</p> : null}
      {errorMessage ? <p className="action-error">{errorMessage}</p> : null}
    </section>
  );
}
