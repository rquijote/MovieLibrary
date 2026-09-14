import { useNavigate } from 'react-router-dom';
import { getImageUrl, getMediaDate, getMediaTitle, handleMediaImageError } from '../lib/media';
import type { MediaItem, MediaType } from '../types/media';

interface MediaGridProps {
  items: MediaItem[];
  mediaType: MediaType;
}

export function MediaGrid({ items, mediaType }: MediaGridProps) {
  const navigate = useNavigate();

  return (
    <div className="media-grid">
      {items.map((item) => (
        <button
          key={`${mediaType}-grid-${item.id}`}
          type="button"
          className="media-grid-item"
          onClick={() => navigate(mediaType === 'movies' ? `/movie/${item.id}` : `/tv/${item.id}`)}
        >
          <img src={getImageUrl(item.poster_path)} alt={getMediaTitle(item)} onError={handleMediaImageError} />
          <h4>{getMediaTitle(item)}</h4>
          <p>{getMediaDate(item)}</p>
        </button>
      ))}
    </div>
  );
}
