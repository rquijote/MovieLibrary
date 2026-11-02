import { useNavigate } from 'react-router-dom';
import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { PersonCreditDto } from '../../types/media';

export function PersonFilmographyGrid({ credits }: { credits: PersonCreditDto[] }) {
  const navigate = useNavigate();
  const sortedCredits = [...credits].sort((a, b) => {
    const aDate = a.release_date ?? a.first_air_date ?? '';
    const bDate = b.release_date ?? b.first_air_date ?? '';
    return bDate.localeCompare(aDate) || b.vote_average - a.vote_average;
  });

  if (sortedCredits.length === 0) {
    return <p>No titles found for this category.</p>;
  }

  return (
    <div className="media-grid">
      {sortedCredits.map((credit, index) => {
        const title = credit.title ?? credit.name ?? 'Untitled';
        const release = credit.release_date ?? credit.first_air_date ?? '';
        const role = credit.character ?? credit.job;
        const mediaType = credit.media_type === 'movie' ? 'movie' : 'tv';
        return (
          <button
            key={`${credit.media_type}-${credit.id}-${role ?? ''}-${index}`}
            type="button"
            className="media-grid-item"
            onClick={() => navigate(`/${mediaType}/${credit.id}`)}
          >
            <div className="media-grid-image-wrap">
              <img src={getImageUrl(credit.poster_path)} alt={title} onError={handleMediaImageError} loading="lazy" />
            </div>
            <div className="media-grid-content">
              <h4>{title}</h4>
              <p>{release.slice(0, 4)}{role ? ` · ${role}` : ''}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
