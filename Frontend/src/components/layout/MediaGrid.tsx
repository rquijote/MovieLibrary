import { useNavigate } from 'react-router-dom';
import { getImageUrl, getMediaDate, getMediaTitle, handleMediaImageError } from '../../lib/media';
import type { MediaItem, MediaType } from '../../types/media';

interface MediaGridProps {
  items: MediaItem[];
  mediaType: MediaType;
  showYearOnly?: boolean;
}

export function MediaGrid({ items, mediaType, showYearOnly = mediaType === 'movies' }: MediaGridProps) {
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
          <div className="media-grid-image-wrap">
            <img src={getImageUrl(item.poster_path)} alt={getMediaTitle(item)} onError={handleMediaImageError} />
          </div>
          <div className="media-grid-content">
            <h4>{getMediaTitle(item)}</h4>
            <p>{showYearOnly ? getMediaDate(item).slice(0, 4) : getMediaDate(item)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
