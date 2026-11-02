import { useNavigate } from 'react-router-dom';
import { getImageUrl, getMediaTitle, handleMediaImageError } from '../../lib/media';
import type { MediaCategory, MediaItem, MediaType } from '../../types/media';

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  mediaType: MediaType;
  category: MediaCategory;
  genreId?: number;
}

export function MediaRow({ title, items, mediaType, category, genreId }: MediaRowProps) {
  const navigate = useNavigate();
  const expandedRoute = mediaType === 'tv' ? `/tvshows/${category}` : `/${mediaType}/${category}`;
  const expandedRouteWithGenre = genreId === undefined ? expandedRoute : `${expandedRoute}?genreId=${genreId}`;

  return (
    <section className="media-row-container">
      <div className="media-row-header">
        <h3>{title}</h3>
        <button className="view-more-btn" type="button" onClick={() => navigate(expandedRouteWithGenre)}>
          View More
        </button>
      </div>

      <div className="media-row">
        {items.map((item) => {
          const route = mediaType === 'movies' ? `/movie/${item.id}` : `/tv/${item.id}`;
          const itemTitle = getMediaTitle(item);

          return (
            <button
              key={`${mediaType}-${item.id}`}
              type="button"
              className="media-row-item"
              onClick={() => navigate(route)}
            >
              <img src={getImageUrl(item.poster_path, 'w185')} alt={itemTitle} onError={handleMediaImageError} />
              <span className="media-row-item-title">{itemTitle}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
