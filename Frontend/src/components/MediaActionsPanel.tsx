import { useMemo, useState } from 'react';
import type { MouseEvent } from 'react';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import type { AccountListSummary, AccountListsResponse, StatusDto } from '../types/media';

interface MediaActionsPanelProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
}

export function MediaActionsPanel({ mediaId, mediaType }: MediaActionsPanelProps) {
  const [ratingOutOf5, setRatingOutOf5] = useState(0);
  const [hoverRatingOutOf5, setHoverRatingOutOf5] = useState<number | null>(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistHovered, setIsWatchlistHovered] = useState(false);
  const [isListPickerOpen, setIsListPickerOpen] = useState(false);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [accountLists, setAccountLists] = useState<AccountListSummary[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingEndpointPrefix = useMemo(() => (mediaType === 'movie' ? 'Movie' : 'TvShow'), [mediaType]);

  const handleWatchlistToggle = async () => {
    const nextState = !isWatchlisted;

    try {
      const result = await apiPost<StatusDto>('/api/Account/watchlist', {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: nextState,
      });
      setIsWatchlisted(nextState);
      setStatusMessage(result.success ? null : (result.status_message ?? 'Watchlist update failed.'));
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

  const handleSetRating = async (nextRatingOutOf5: number) => {
    try {
      const result = await apiPost<StatusDto>(`/api/${ratingEndpointPrefix}/${mediaId}/rating?rating=${nextRatingOutOf5 * 2}`, null);
      setRatingOutOf5(nextRatingOutOf5);
      setStatusMessage(result.status_message ?? `Rating updated to ${nextRatingOutOf5.toFixed(1)} / 5.`);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Rating update failed.');
    }
  };

  const handleDeleteRating = async () => {
    try {
      const result = await apiDelete<StatusDto>(`/api/${ratingEndpointPrefix}/${mediaId}/rating`);
      setRatingOutOf5(0);
      setStatusMessage(result.status_message ?? 'Rating removed.');
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Deleting rating failed.');
    }
  };

  const getPointerRating = (event: MouseEvent<HTMLButtonElement>, starIndex: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? starIndex - 0.5 : starIndex;
  };

  const handleRatingClick = async (event: MouseEvent<HTMLButtonElement>, starIndex: number) => {
    const selectedRating = getPointerRating(event, starIndex);
    setHoverRatingOutOf5(null);

    if (selectedRating === ratingOutOf5) {
      await handleDeleteRating();
      return;
    }

    await handleSetRating(selectedRating);
  };

  const handleRatingHover = (event: MouseEvent<HTMLButtonElement>, starIndex: number) => {
    setHoverRatingOutOf5(getPointerRating(event, starIndex));
  };

  const getStarState = (starIndex: number, currentRatingOutOf5: number) => {
    if (currentRatingOutOf5 >= starIndex) {
      return 'full';
    }

    if (currentRatingOutOf5 === starIndex - 0.5) {
      return 'half';
    }

    return 'empty';
  };

  const activeRatingOutOf5 = hoverRatingOutOf5 ?? ratingOutOf5;
  const isPreviewActive = hoverRatingOutOf5 !== null;
  const watchlistLabel = isWatchlisted && isWatchlistHovered ? 'Remove' : 'Watchlist';

  const handleList = async (listId: number, action: 'add_item' | 'remove_item') => {
    try {
      const result = await apiPost<StatusDto>(`/api/Lists/${listId}/${action}`, mediaId);
      setStatusMessage(result.status_message ?? (action === 'add_item' ? 'Added to list.' : 'Removed from list.'));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'List update failed.');
    }
  };

  const openListPicker = async () => {
    setIsListPickerOpen(true);

    if (accountLists.length > 0 || isListsLoading) {
      return;
    }

    try {
      setIsListsLoading(true);
      const result = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
      const sortedLists = [...result.results].sort((left, right) => right.id - left.id);
      setAccountLists(sortedLists);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load account lists.');
    } finally {
      setIsListsLoading(false);
    }
  };

  return (
    <section className="media-actions">
      <div className="action-group quick-actions">
        <div className="watchlist-control">
          <button
            type="button"
            onClick={() => void handleWatchlistToggle()}
            className="toggle-action-button"
            aria-label={isWatchlisted ? 'Mark as unwatched' : 'Mark as watched'}
            onMouseEnter={() => setIsWatchlistHovered(true)}
            onMouseLeave={() => setIsWatchlistHovered(false)}
          >
            <svg viewBox="0 0 24 24" className="watchlist-icon" aria-hidden="true">
              <path
                d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="1.8" />
              {isWatchlisted ? (
                <path
                  d="M4 4l16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              ) : null}
            </svg>
          </button>
          <span className="watchlist-hint">{watchlistLabel}</span>
        </div>
        <div className="watchlist-control">
          <button type="button" onClick={() => void openListPicker()} className="toggle-action-button" aria-label="Add to list">
            <svg viewBox="0 0 24 24" className="list-icon" aria-hidden="true">
              <path d="M5 7h11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M5 12h11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M5 17h7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M19 15v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M16 18h6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <span className="watchlist-hint">List</span>
        </div>
      </div>

      <div className="action-group rating-group">
        <span className="watchlist-hint rate-label">Rate</span>
        <div
          className="star-rating"
          role="group"
          aria-label="Rate this title out of 5 stars"
          onMouseLeave={() => setHoverRatingOutOf5(null)}
        >
          {Array.from({ length: 5 }, (_, idx) => {
            const starIndex = idx + 1;
            const state = getStarState(starIndex, activeRatingOutOf5);
            const fullColor = isPreviewActive ? '#9ca3af' : '#fbbf24';
            const emptyColor = '#64748b';
            const halfGradientId = `star-${isPreviewActive ? 'preview' : 'rated'}-half-${starIndex}`;

            return (
              <button
                key={starIndex}
                type="button"
                className={`star-button ${state}`}
                onClick={(event) => void handleRatingClick(event, starIndex)}
                onMouseMove={(event) => handleRatingHover(event, starIndex)}
                aria-label={`Set rating to ${starIndex - 0.5} or ${starIndex}`}
              >
                <svg viewBox="0 0 24 24" className="star-icon" aria-hidden="true">
                  {state === 'half' ? (
                    <>
                      <defs>
                        <linearGradient id={halfGradientId}>
                          <stop offset="50%" stopColor={fullColor} />
                          <stop offset="50%" stopColor={emptyColor} />
                        </linearGradient>
                      </defs>
                      <path
                        d="M12 2.5l2.93 5.93 6.55.95-4.74 4.62 1.12 6.53L12 17.45l-5.86 3.08 1.12-6.53L2.52 9.38l6.55-.95L12 2.5z"
                        fill={`url(#${halfGradientId})`}
                      />
                    </>
                  ) : (
                    <path
                      d="M12 2.5l2.93 5.93 6.55.95-4.74 4.62 1.12 6.53L12 17.45l-5.86 3.08 1.12-6.53L2.52 9.38l6.55-.95L12 2.5z"
                      fill={state === 'full' ? fullColor : emptyColor}
                    />
                  )}
                </svg>
              </button>
            );
          })}
        </div>
      </div>

      {isListPickerOpen ? (
        <div className="list-picker-overlay" role="presentation" onClick={() => setIsListPickerOpen(false)}>
          <div className="list-picker-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="list-picker-header">
              <h3>Add to list</h3>
              <button type="button" onClick={() => setIsListPickerOpen(false)}>
                Close
              </button>
            </div>

            <div className="list-picker-item favorite-list-option">
              <div>
                <strong>Favorites</strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  void handleFavorite(true);
                  setIsListPickerOpen(false);
                }}
              >
                Add
              </button>
            </div>

            {isListsLoading ? <p>Loading lists...</p> : null}

            {!isListsLoading && accountLists.length === 0 ? <p>No custom lists found.</p> : null}

            {!isListsLoading
              ? accountLists.map((list) => (
                  <div key={list.id} className="list-picker-item">
                    <div>
                      <strong>{list.name}</strong>
                      <p>{list.item_count} items</p>
                    </div>
                    <div className="list-picker-actions">
                      <button
                        type="button"
                        onClick={() => {
                          void handleList(list.id, 'add_item');
                          setIsListPickerOpen(false);
                        }}
                      >
                        Add
                      </button>
                      <button type="button" onClick={() => void handleList(list.id, 'remove_item')}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              : null}
          </div>
        </div>
      ) : null}

      {statusMessage ? <p className="action-status">{statusMessage}</p> : null}
      {errorMessage ? <p className="action-error">{errorMessage}</p> : null}
    </section>
  );
}
