import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { apiDelete, apiGet, apiPost } from '../lib/api';
import type { AccountListSummary, AccountListsResponse, AccountStatesResponse, StatusDto } from '../types/media';
import { ActionToast } from './ActionToast';
import { ListPickerModal } from './ListPickerModal';
import { RatingControl } from './RatingControl';

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
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistHovered, setIsWatchlistHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const [isListPickerOpen, setIsListPickerOpen] = useState(false);
  const [isListsLoading, setIsListsLoading] = useState(false);
  const [accountLists, setAccountLists] = useState<AccountListSummary[]>([]);
  const [listItemPresenceById, setListItemPresenceById] = useState<Record<number, boolean>>({});
  const [selectedListIds, setSelectedListIds] = useState<number[]>([]);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [toast, setToast] = useState<{ id: number; kind: 'success' | 'error'; message: string } | null>(null);
  const toastIdRef = useRef(0);
  const ratingEndpointPrefix = mediaType === 'movie' ? 'Movie' : 'TvShow';

  const showToast = (kind: 'success' | 'error', message: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, kind, message });
  };

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
      } catch (error) {
        if (isDisposed) {
          return;
        }

        showToast('error', error instanceof Error ? error.message : 'Loading initial account state failed.');
      }
    };

    void loadAccountState();

    return () => {
      isDisposed = true;
    };
  }, [mediaId, mediaType, ratingEndpointPrefix]);

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

  const loadAccountLists = async (force: boolean) => {
    if (isListsLoading) {
      return;
    }

    if (!force && accountLists.length > 0) {
      return;
    }

    try {
      setIsListsLoading(true);
      const result = await apiGet<AccountListsResponse>('/api/Account/lists?page=1');
      const sortedLists = [...result.results].sort((left, right) => right.id - left.id);
      setAccountLists(sortedLists);
      await loadListItemPresence(sortedLists);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to load account lists.');
    } finally {
      setIsListsLoading(false);
    }
  };

  const handleCreateList = async (event: FormEvent) => {
    event.preventDefault();

    const trimmedName = newListName.trim();
    if (!trimmedName) {
      showToast('error', 'List name is required.');
      return;
    }

    try {
      const result = await apiPost<StatusDto>('/api/Lists', {
        name: trimmedName,
        description: newListDescription.trim() || null,
        language: 'en',
      });

      showToast('success', result.status_message ?? 'List created.');
      setNewListName('');
      setNewListDescription('');
      await loadAccountLists(true);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Failed to create list.');
    }
  };

  const handleSaveSelectedLists = async () => {
    if (selectedListIds.length === 0) {
      showToast('error', 'Select at least one list.');
      return;
    }

    try {
      for (const listId of selectedListIds) {
        await apiPost<StatusDto>(`/api/Lists/${listId}/add_movie`, mediaId);
      }

      showToast(
        'success',
        selectedListIds.length === 1 ? 'Added to 1 list.' : `Added to ${selectedListIds.length} lists.`,
      );

      setSelectedListIds([]);
      setIsListPickerOpen(false);
      await loadAccountLists(true);
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'List update failed.');
    }
  };

  const handleWatchlistToggle = async () => {
    const nextState = !isWatchlisted;

    try {
      const result = await apiPost<StatusDto>('/api/Account/watchlist', {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: nextState,
      });
      setIsWatchlisted(nextState);
      showToast(
        result.success ? 'success' : 'error',
        result.status_message ?? (result.success ? 'Watchlist updated.' : 'Watchlist update failed.'),
      );
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Watchlist update failed.');
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
      showToast('success', result.status_message ?? (add ? 'Added to favorites.' : 'Removed from favorites.'));
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Favorites update failed.');
    }
  };

  const watchlistLabel = isWatchlisted && isWatchlistHovered ? 'Remove' : 'Watchlist';
  const favoriteLabel = isFavorited && isFavoriteHovered ? 'Remove' : 'Favorite';
  const openListPicker = () => {
    setIsListPickerOpen(true);
    void loadAccountLists(false);
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

      <RatingControl
        ratingOutOf5={ratingOutOf5}
        onSetRating={async (nextRatingOutOf5) => {
          try {
            const result = await apiPost<StatusDto>(
              `/api/${ratingEndpointPrefix}/${mediaId}/rating?rating=${nextRatingOutOf5 * 2}`,
              null,
            );
            setRatingOutOf5(nextRatingOutOf5);
            showToast('success', result.status_message ?? `Rating updated to ${nextRatingOutOf5.toFixed(1)} / 5.`);
          } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Rating update failed.');
          }
        }}
        onDeleteRating={async () => {
          try {
            const result = await apiDelete<StatusDto>(`/api/${ratingEndpointPrefix}/${mediaId}/rating`);
            setRatingOutOf5(0);
            showToast('success', result.status_message ?? 'Rating removed.');
          } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Deleting rating failed.');
          }
        }}
      />

      <ListPickerModal
        isOpen={showListActions && isListPickerOpen}
        isListsLoading={isListsLoading}
        accountLists={accountLists}
        listItemPresenceById={listItemPresenceById}
        selectedListIds={selectedListIds}
        setSelectedListIds={setSelectedListIds}
        newListName={newListName}
        setNewListName={setNewListName}
        newListDescription={newListDescription}
        setNewListDescription={setNewListDescription}
        onCreateListSubmit={handleCreateList}
        onSave={handleSaveSelectedLists}
        onClose={() => setIsListPickerOpen(false)}
      />

      <ActionToast
        toast={toast}
        onDismiss={(toastId) => setToast((currentToast) => (currentToast?.id === toastId ? null : currentToast))}
      />
    </section>
  );
}
