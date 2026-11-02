import './LoadingState.css';

interface LoadingStateProps {
  variant?: 'rows' | 'grid' | 'details' | 'inline';
  label?: string;
}

export function LoadingState({ variant = 'rows', label = 'Loading content' }: LoadingStateProps) {
  return (
    <div className={`loading-state loading-state-${variant}`} role="status" aria-live="polite">
      <span className={variant === 'inline' ? 'loading-label' : 'loading-sr-only'}>{label}</span>
      {variant === 'inline' ? <span className="loading-dot" aria-hidden="true" /> : (
        <div className="loading-placeholder" aria-hidden="true">
          {variant === 'details' ? (
            <div className="loading-details">
              <div className="loading-block loading-poster" />
              <div className="loading-copy">
                <div className="loading-block loading-heading" />
                <div className="loading-block loading-meta" />
                <div className="loading-block loading-line" />
                <div className="loading-block loading-line" />
                <div className="loading-block loading-meta" />
              </div>
            </div>
          ) : Array.from({ length: variant === 'rows' ? 2 : 1 }, (_, row) => (
            <div className="loading-section" key={row}>
              {variant === 'rows' ? <div className="loading-block loading-heading" /> : null}
              <div className="loading-cards">
                {Array.from({ length: variant === 'rows' ? 6 : 8 }, (_, card) => (
                  <div className="loading-card" key={card}>
                    <div className="loading-block loading-poster" />
                    <div className="loading-block loading-line" />
                    <div className="loading-block loading-meta" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
