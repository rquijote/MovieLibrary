import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getImageUrl, getMediaTitle, prioritizeMediaWithPoster } from '../../lib/media';
import type { MediaCategory, MediaItem, MediaType } from '../../types/media';

type MediaRowProps = {
  title: string;
  items: MediaItem[];
  mediaType: MediaType;
  genreId?: number;
  preferImages?: boolean;
  fillRow?: boolean;
} & (
  | { category: MediaCategory; expandedPath?: never }
  | { category?: never; expandedPath: string }
);

export function MediaRow({ title, items, mediaType, category, genreId, expandedPath, preferImages = false, fillRow = false }: MediaRowProps) {
  const navigate = useNavigate();
  const rowRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(6);
  const orderedItems = preferImages ? prioritizeMediaWithPoster(items) : items;
  const displayItems = fillRow ? orderedItems.slice(0, columnCount) : orderedItems;
  useEffect(() => {
    const row = rowRef.current;
    if (!fillRow || !row) return;
    const observer = new ResizeObserver(() => {
      const columns = getComputedStyle(row).gridTemplateColumns.split(' ').filter(Boolean).length;
      setColumnCount(Math.max(1, columns));
    });
    observer.observe(row);
    return () => observer.disconnect();
  }, [fillRow]);
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

      <div className="media-row" ref={rowRef}>
        {displayItems.map((item) => (
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
