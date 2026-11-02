import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, getMediaTitle } from '../../lib/media';
import type { MediaCategory, MediaItem, MediaType } from '../../types/media';

type MediaRowProps = {
  title: string;
  items: MediaItem[];
  mediaType: MediaType;
  genreId?: number;
} & (
  | { category: MediaCategory; expandedPath?: never }
  | { category?: never; expandedPath: string }
);

export function MediaRow({ title, items, mediaType, category, genreId, expandedPath }: MediaRowProps) {
  const navigate = useNavigate();
  const expandedRoute = mediaType === 'tv' ? `/tvshows/${category}` : `/${mediaType}/${category}`;
  const expandedRouteWithGenre = genreId === undefined ? expandedRoute : `${expandedRoute}?genreId=${genreId}`;

  return (
    <section className="media-row-container">
      <div className="media-row-header">
        <h3>{title}</h3>
        <button className="view-more-btn" type="button" onClick={() => navigate(expandedPath ?? expandedRouteWithGenre)}>
          View More
        </button>
      </div>

      <div className="media-row">
        {items.map((item) => (
          <MediaRowItem
            key={`${mediaType}-${item.id}-${item.poster_path ?? ''}`}
            item={item}
            onSelect={() => navigate(mediaType === 'movies' ? `/movie/${item.id}` : `/tv/${item.id}`)}
          />
        ))}
      </div>
    </section>
  );
}

function MediaRowItem({ item, onSelect }: { item: MediaItem; onSelect: () => void }) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = Boolean(item.poster_path) && !imageFailed;
  const title = getMediaTitle(item);

  return (
    <button
      type="button"
      className={`media-row-item${hasImage ? '' : ' media-row-item-no-image'}`}
      onClick={onSelect}
    >
      {hasImage ? (
        <img src={getImageUrl(item.poster_path, 'w185')} alt={title} onError={() => setImageFailed(true)} />
      ) : (
        <div className="media-row-poster-placeholder" aria-hidden="true" />
      )}
      <span className="media-row-item-title">{title}</span>
    </button>
  );
}
