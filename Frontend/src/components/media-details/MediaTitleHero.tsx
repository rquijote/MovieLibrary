import type { ReactNode } from 'react';
import { getImageUrl, handleMediaImageError } from '../../lib/media';

interface MediaTitleHeroProps {
  title: string;
  originalTitle?: string | null;
  backdropPath: string | null;
  posterPath: string | null;
  posterAlt: string;
  metadata: string[];
  rating?: number;
  voteCount?: number;
  genres?: string[];
  tagline?: string | null;
  children?: ReactNode;
}

export function MediaTitleHero({
  title,
  originalTitle,
  backdropPath,
  posterPath,
  posterAlt,
  metadata,
  rating,
  voteCount,
  genres = [],
  tagline,
  children,
}: MediaTitleHeroProps) {
  return (
    <header className="media-title-hero">
      {backdropPath ? (
        <div
          className="details-hero"
          style={{ backgroundImage: `url(${getImageUrl(backdropPath, 'original')})` }}
          aria-hidden="true"
        />
      ) : null}
      <div className="media-title-content">
        <div className="media-title-poster-frame">
          <img
            src={getImageUrl(posterPath ?? backdropPath)}
            alt={posterAlt}
            className="media-title-poster"
            onError={handleMediaImageError}
          />
        </div>
        <div className="media-title-copy">
          <h1>{title}</h1>
          {originalTitle && originalTitle !== title ? <p className="media-original-title">{originalTitle}</p> : null}
          <div className="media-title-meta">
            {metadata.map((item) => <span key={item}>{item}</span>)}
            {rating !== undefined ? (
              <span className="media-rating">
                ★ {rating.toFixed(1)}{voteCount !== undefined ? ` · ${voteCount.toLocaleString()} ratings` : ''}
              </span>
            ) : null}
          </div>
          {genres.length > 0 ? (
            <div className="media-title-genres">
              {genres.map((genre) => <span className="media-title-genre" key={genre}>{genre}</span>)}
            </div>
          ) : null}
          {tagline ? <p className="media-tagline">{tagline}</p> : null}
          {children}
        </div>
      </div>
    </header>
  );
}
