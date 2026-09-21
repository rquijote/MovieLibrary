import type { MouseEvent } from 'react';

interface RatingControlProps {
  activeRatingOutOf5: number;
  isPreviewActive: boolean;
  onRatingHover: (event: MouseEvent<HTMLButtonElement>, starIndex: number) => void;
  onRatingClick: (event: MouseEvent<HTMLButtonElement>, starIndex: number) => Promise<void>;
  onClearHover: () => void;
  getStarState: (starIndex: number, currentRatingOutOf5: number) => 'full' | 'half' | 'empty';
}

export function RatingControl({
  activeRatingOutOf5,
  isPreviewActive,
  onRatingHover,
  onRatingClick,
  onClearHover,
  getStarState,
}: RatingControlProps) {
  return (
    <div className="action-group rating-group">
      <span className="watchlist-hint rate-label">Rate</span>
      <div
        className="star-rating"
        role="group"
        aria-label="Rate this title out of 5 stars"
        onMouseLeave={onClearHover}
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
              onClick={(event) => void onRatingClick(event, starIndex)}
              onMouseMove={(event) => onRatingHover(event, starIndex)}
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
