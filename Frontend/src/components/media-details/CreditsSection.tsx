import { Link } from 'react-router-dom';
import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { CastCreditDto } from '../../types/media';

interface CreditsSectionProps {
  cast: CastCreditDto[];
  aggregate?: boolean;
}

export function CreditsSection({ cast, aggregate = false }: CreditsSectionProps) {
  const sortedCast = [...cast].sort((a, b) => a.order - b.order);
  const featuredCast = sortedCast.slice(0, 12);
  const remainingCast = sortedCast.slice(12);
  if (cast.length === 0) {
    return null;
  }

  return (
    <section className="media-detail-section">
      <h2>Cast</h2>
      {cast.length > 0 ? (
        <div>
          <div className="person-credit-grid">
            {featuredCast.map((person) => (
              <PersonCreditCard
                key={`${person.id}-${person.character ?? person.roles[0]?.character ?? ''}`}
                id={person.id}
                name={person.name}
                imagePath={person.profile_path}
                description={person.character ?? person.roles.map((role) => role.character).filter(Boolean).join(', ')}
                count={aggregate ? person.total_episode_count : null}
              />
            ))}
          </div>
          {remainingCast.length > 0 ? (
            <details className="credit-overflow">
              <summary>Show all {cast.length} cast members</summary>
              <div className="person-credit-grid">
                {remainingCast.map((person) => (
                  <PersonCreditCard
                    key={`${person.id}-${person.character ?? person.roles[0]?.character ?? ''}`}
                    id={person.id}
                    name={person.name}
                    imagePath={person.profile_path}
                    description={person.character ?? person.roles.map((role) => role.character).filter(Boolean).join(', ')}
                    count={aggregate ? person.total_episode_count : null}
                  />
                ))}
              </div>
            </details>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function PersonCreditCard({
  id,
  name,
  imagePath,
  description,
  count,
}: {
  id: number;
  name: string;
  imagePath: string | null;
  description: string;
  count: number | null;
}) {
  return (
    <Link className="person-credit-card" to={`/person/${id}`}>
      <span className="person-credit-image">
        <img src={getImageUrl(imagePath, 'w185')} alt="" width={185} height={278}
          onError={handleMediaImageError} loading="lazy" />
      </span>
      <span className="person-credit-name">{name}</span>
      <span className="person-credit-description">{description || 'Cast'}</span>
      {count !== null ? <span className="person-credit-description">{count} episodes</span> : null}
    </Link>
  );
}
