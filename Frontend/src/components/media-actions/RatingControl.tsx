import { useState } from 'react';
import type { MouseEvent } from 'react';

interface RatingControlProps {
  ratingOutOf5: number;
  onSetRating: (nextRatingOutOf5: number) => Promise<void>;
  onDeleteRating: () => Promise<void>;
}

export function RatingControl({
  ratingOutOf5,
  onSetRating,
  onDeleteRating,
}: RatingControlProps) {
  const [hoverRatingOutOf5, setHoverRatingOutOf5] = useState<number | null>(null);

  const getPointerRating = (event: MouseEvent<HTMLButtonElement>, starIndex: number) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const isLeftHalf = event.clientX - rect.left < rect.width / 2;
    return isLeftHalf ? starIndex - 0.5 : starIndex;
  };

  const getStarState = (starIndex: number, currentRating: number) => {
    if (currentRating >= starIndex) {
      return 'full';
    }

    if (currentRating === starIndex - 0.5) {
      return 'half';
    }

    return 'empty';
  };

  const handleSetRating = async (nextRatingOutOf5: number) => {
    await onSetRating(nextRatingOutOf5);
  };

  const handleDeleteRating = async () => {
    await onDeleteRating();
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

  const activeRatingOutOf5 = hoverRatingOutOf5 ?? ratingOutOf5;
  const isPreviewActive = hoverRatingOutOf5 !== null;

  return (
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
  );
}
