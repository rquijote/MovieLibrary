import { useEffect, useRef, useState } from 'react';
import { apiDelete, apiGet, apiPost } from '../../lib/api';
import type { AccountStatesResponse } from '../../types/media';
import { ActionToast } from './ActionToast';
import { ListPickerModal } from './ListPickerModal';
import { RatingControl } from './RatingControl';
import { useSession } from '../../lib/session';
import { AccountDialog } from '../header/AccountDialog';

interface MediaActionsPanelProps {
  mediaId: number;
  mediaType: 'movie' | 'tv';
  showListActions?: boolean;
}

export function MediaActionsPanel({ mediaId, mediaType, showListActions = true }: MediaActionsPanelProps) {
  const session = useSession();
  const [ratingOutOf5, setRatingOutOf5] = useState(0);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isWatchlistHovered, setIsWatchlistHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);
  const [isListPickerOpen, setIsListPickerOpen] = useState(false);
  const [loginReason, setLoginReason] = useState<string | null>(null);
  const [toast, setToast] = useState<{ id: number; kind: 'success' | 'error' | 'pending'; message: string } | null>(null);
  const toastIdRef = useRef(0);
  const ratingEndpointPrefix = mediaType === 'movie' ? 'Movie' : 'TvShow';

  const showToast = (kind: 'success' | 'error' | 'pending', message: string) => {
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, kind, message });
  };

  useEffect(() => {
    let isDisposed = false;
    if (!session.authenticated) return;

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
  }, [mediaId, mediaType, ratingEndpointPrefix, session.authenticated, session.account?.id]);

  const handleWatchlistToggle = async () => {
    if (!session.authenticated) {
      setLoginReason('Log in to save this title to your watchlist.');
      return;
    }
    const nextState = !isWatchlisted;

    try {
      const result = await apiPost('/api/Account/watchlist', {
        media_type: mediaType,
        media_id: mediaId,
        watchlist: nextState,
      });
      setIsWatchlisted(nextState);
      showToast(
        result.queued ? 'pending' : 'success',
        result.status_message ?? 'Watchlist updated.',
      );
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Watchlist update failed.');
    }
  };

  const handleFavorite = async (add: boolean) => {
    if (!session.authenticated) {
      setLoginReason('Log in to save this title to your favourites.');
      return;
    }
    try {
      const result = await apiPost('/api/Account/favorite', {
        media_type: mediaType,
        media_id: mediaId,
        favorite: add,
      });
      setIsFavorited(add);
      showToast(result.queued ? 'pending' : 'success', result.status_message ?? (add ? 'Added to favorites.' : 'Removed from favorites.'));
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : 'Favorites update failed.');
    }
  };

  const watchlistLabel = isWatchlisted && isWatchlistHovered ? 'Remove' : 'Watchlist';
  const favoriteLabel = isFavorited && isFavoriteHovered ? 'Remove' : 'Favorite';
  const openListPicker = () => {
    if (!session.authenticated) {
      setLoginReason('Log in to add this title to your personal lists.');
      return;
    }
    setIsListPickerOpen(true);
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
          if (!session.authenticated) {
            setLoginReason('Log in to rate this title.');
            return;
          }
          try {
            const result = await apiPost(
              `/api/${ratingEndpointPrefix}/${mediaId}/rating`,
              {
                value: nextRatingOutOf5 * 2,
              },
            );
            setRatingOutOf5(nextRatingOutOf5);
            showToast(result.queued ? 'pending' : 'success', result.status_message ?? `Rating updated to ${nextRatingOutOf5.toFixed(1)} / 5.`);
          } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Rating update failed.');
          }
        }}
        onDeleteRating={async () => {
          if (!session.authenticated) {
            setLoginReason('Log in to change your rating.');
            return;
          }
          try {
            const result = await apiDelete(`/api/${ratingEndpointPrefix}/${mediaId}/rating`);
            setRatingOutOf5(0);
            showToast(result.queued ? 'pending' : 'success', result.status_message ?? 'Rating removed.');
          } catch (error) {
            showToast('error', error instanceof Error ? error.message : 'Deleting rating failed.');
          }
        }}
      />

      {loginReason ? <AccountDialog reason={loginReason} onClose={() => setLoginReason(null)} /> : null}

      {session.authenticated ? <ListPickerModal
        isOpen={showListActions && isListPickerOpen}
        mediaId={mediaId}
        mediaType={mediaType}
        onNotify={showToast}
        onClose={() => setIsListPickerOpen(false)}
      /> : null}

      <ActionToast
        toast={toast}
        onDismiss={(toastId) => setToast((currentToast) => (currentToast?.id === toastId ? null : currentToast))}
      />
    </section>
  );
}
