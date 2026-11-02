import { Link } from 'react-router-dom';
import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { PersonSearchResultDto } from '../../types/media';

export function PeopleSearchGrid({ people }: { people: PersonSearchResultDto[] }) {
  if (people.length === 0) {
    return <p>No people found.</p>;
  }

  return (
    <div className="person-credit-grid">
      {people.map((person) => (
        <Link className="person-credit-card" key={person.id} to={`/person/${person.id}`}>
          <img
            src={getImageUrl(person.profile_path, 'w185')}
            alt=""
            onError={handleMediaImageError}
            loading="lazy"
          />
          <span className="person-credit-name">{person.name}</span>
          <span className="person-credit-description">{person.known_for_department || 'Person'}</span>
        </Link>
      ))}
    </div>
  );
}
