import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import type { AccountListSummary, AccountListsResponse, AccountStatesResponse, StatusDto } from '../types/media';
import { CreateListForm } from './CreateListForm';

interface MediaActionsPanelProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  showListActions?: boolean;
}

interface ListItemStatusResponse {
  id: number;
  item_present: boolean;
}

export function MediaActionsPanel({ mediaId, mediaType, showListActions = true }: MediaActionsPanelProps) {
  const [ratingOutOf5, setRatingOutOf5] = useState(0);
  const [hoverRatingOutOf5, setHoverRatingOutOf5] = useState<number | null>(null);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistHovered, setIsWatchlistHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const [isListPickerOpen, setIsListPickerOpen] = useState(false);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [accountLists, setAccountLists] = useState<AccountListSummary[]>([]);
  const [listItemPresenceById, setListItemPresenceById] = useState<Record<number, boolean>>({});
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [listSearchTerm, setListSearchTerm] = useState('');
  const [isCreateListOpen, setIsCreateListOpen] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingEndpointPrefix = useMemo(() => (mediaType === 'movie' ? 'Movie' : 'TvShow'), [mediaType]);

  useEffect(() => {
    let isDisposed = false;

    const loadAccountState = async () => {
      try {
        const accountState = await apiGet<AccountStatesResponse>(`/api/${ratingEndpointPrefix}/${mediaId}/account-states`);

        if (isDisposed) {
          return;
        }

        setIsWatchlisted(accountState.watchlist);
        setIsFavorited(accountState.favorite);
        setRatingOutOf5((accountState.rated?.value ?? 0) / 2);
        setErrorMessage(null);
      } catch (error) {
        if (isDisposed) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Loading initial account state failed.');
      }
    };

    void loadAccountState();

    return () => {
      isDisposed = true;
    };
  }, [mediaId, ratingEndpointPrefix]);

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
      setIsFavorited(add);
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
  const favoriteLabel = isFavorited && isFavoriteHovered ? 'Remove' : 'Favorite';
  const filteredAccountLists = useMemo(() => {
    const term = listSearchTerm.trim().toLowerCase();
    if (!term) {
      return accountLists;
    }

    return accountLists.filter((list) => list.name.toLowerCase().includes(term));
  }, [accountLists, listSearchTerm]);

  const loadListItemPresence = async (lists: AccountListSummary[]) => {
    if (lists.length === 0) {
      setListItemPresenceById({});
      return;
    }

    const statuses = await Promise.all(
      lists.map(async (list) => {
        try {
          const itemStatus = await apiGet<ListItemStatusResponse>(
            `/api/Lists/${list.id}/item_status?media_type=${mediaType}&media_id=${mediaId}`,
          );

          return [list.id, itemStatus.item_present] as const;
        } catch {
          return [list.id, false] as const;
        }
      }),
    );

    const nextPresence = Object.fromEntries(statuses);
    setListItemPresenceById(nextPresence);
    setSelectedListIds((current) => current.filter((id) => !nextPresence[id]));
  };

  const handleSaveSelectedLists = async () => {
    if (selectedListIds.length === 0) {
      setErrorMessage('Select at least one list.');
      return;
    }

    try {
      for (const listId of selectedListIds) {
        await apiPost<StatusDto>(`/api/Lists/${listId}/add_movie`, mediaId);
      }

      setStatusMessage(
        selectedListIds.length === 1
          ? 'Added to 1 list.'
          : `Added to ${selectedListIds.length} lists.`,
      );
      setErrorMessage(null);
      setIsListPickerOpen(false);
      setSelectedListIds([]);
      await loadAccountLists(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'List update failed.');
    }
  };

  // force is used as a bool, to avoid GET lists. openListPicker() is false.
  const loadAccountLists = async (force: boolean) => {
    if (isListsLoading) {
      return;
    }

    if (!force && accountLists.length > 0) {
      return;
    }

    try {
      setIsListsLoading(true);
      const result = await apiGet<AccountListsResponse>('/api/Account/lists?page=1'); // TODO: Would be better if page=2 or page=3 as well.
      const sortedLists = [...result.results].sort((left, right) => right.id - left.id);
      setAccountLists(sortedLists);
      await loadListItemPresence(sortedLists);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load account lists.');
    } finally {
      setIsListsLoading(false);
    }
  };

  const handleCreateList = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = newListName.trim();
    if (!trimmedName) {
      setErrorMessage('List name is required.');
      return;
    }

    try {
      const result = await apiPost<StatusDto>('/api/Lists', {
        name: trimmedName,
        description: newListDescription.trim() || null,
        language: 'en',
      });

      setStatusMessage(result.status_message ?? 'List created.');
      setErrorMessage(null);
      setNewListName('');
      setNewListDescription('');
      await loadAccountLists(true);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to create list.');
    }
  };

  const openListPicker = async () => {
    setIsListPickerOpen(true);
    setSelectedListIds([]);
    setListSearchTerm('');
    setIsCreateListOpen(false);
    await loadAccountLists(false);
  };

  const toggleListSelection = (listId: number) => {
    if (listItemPresenceById[listId]) {
      return;
    }

    setSelectedListIds((current) =>
      current.includes(listId) ? current.filter((id) => id !== listId) : [...current, listId],
    );
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
          {showListActions ? (
            <>
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
            </>
          ) : null}
        </div>
        <div className="watchlist-control">
          <button
            type="button"
            onClick={() => void handleFavorite(!isFavorited)}
            className="toggle-action-button"
            aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            onMouseEnter={() => setIsFavoriteHovered(true)}
            onMouseLeave={() => setIsFavoriteHovered(false)}
          >
            <svg viewBox="0 0 24 24" className="watchlist-icon" aria-hidden="true">
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill={isFavorited ? 'currentColor' : 'none'}
                stroke={isFavorited ? 'none' : 'currentColor'}
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <span className="watchlist-hint">{favoriteLabel}</span>
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

      {showListActions && isListPickerOpen ? (
        <div className="list-picker-overlay" role="presentation" onClick={() => setIsListPickerOpen(false)}>
          <div className="list-picker-modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="list-picker-header">
              <h3>Add to list</h3>
              <button type="button" onClick={() => setIsListPickerOpen(false)}>
                Close
              </button>
            </div>

            <div className="list-picker-toolbar">
              <button type="button" onClick={() => setIsCreateListOpen((current) => !current)}>
                Create new list
              </button>
              <input
                type="text"
                placeholder="Search lists"
                value={listSearchTerm}
                onChange={(event) => setListSearchTerm(event.target.value)}
              />
            </div>

            {isCreateListOpen ? (
              <CreateListForm
                newListName={newListName}
                newListDescription={newListDescription}
                onNewListNameChange={setNewListName}
                onNewListDescriptionChange={setNewListDescription}
                onSubmit={(event) => void handleCreateList(event)}
              />
            ) : null}

            {isListsLoading ? <p>Loading lists...</p> : null}

            {!isListsLoading && accountLists.length === 0 ? <p>No custom lists found.</p> : null}
            {!isListsLoading && accountLists.length > 0 && filteredAccountLists.length === 0 ? <p>No matching lists found.</p> : null}

            {!isListsLoading
              ? filteredAccountLists.map((list) => (
                  <div
                    key={list.id}
                    className={`list-picker-item list-picker-selectable ${selectedListIds.includes(list.id) ? 'selected' : ''} ${listItemPresenceById[list.id] ? 'disabled' : ''}`}
                    onClick={() => toggleListSelection(list.id)}
                  >
                    <div className="list-item-row">
                      <strong>{list.name}</strong>
                      <div className="list-item-meta">
                        <span>{list.item_count} {list.item_count === 1 ? 'item' : 'items'}</span>
                        <span>{listItemPresenceById[list.id] || selectedListIds.includes(list.id) ? '✓' : ''}</span>
                      </div>
                    </div>
                  </div>
                ))
              : null}

            <div className="list-picker-save-actions">
              <button type="button" disabled={selectedListIds.length === 0} onClick={() => void handleSaveSelectedLists()}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {statusMessage ? <p className="action-status">{statusMessage}</p> : null}
      {errorMessage ? <p className="action-error">{errorMessage}</p> : null}
    </section>
  );
}
