import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PersonFilmographyGrid } from '../components/media-details/PersonFilmographyGrid';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import { formatPersonDate } from '../lib/pageHelpers';
import { tmdbDetailsCacheProjection } from '../lib/tmdbCache';
import type { PersonDetailsDto } from '../types/media';

type FilmographyTab = 'cast' | 'crew';

export function PersonDetailsPage() {
  const { id } = useParams();
  const [person, setPerson] = useState<PersonDetailsDto | null>(null);
  const [activeTab, setActiveTab] = useState<FilmographyTab>('cast');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setPerson(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const path = `/api/Person/${id}`;
        setPerson(await apiGet<PersonDetailsDto>(path, tmdbDetailsCacheProjection(path)));
      } catch {
        setPerson(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) return <LoadingState variant="details" label="Loading person details" />;
  if (!person) return <p>Person not found.</p>;

  const castCredits = person.combined_credits?.cast ?? [];
  const crewCredits = person.combined_credits?.crew ?? [];

  return (
    <div className="details-view">
      <div className="person-profile-header">
        <img
          className="person-profile-image"
          src={getImageUrl(person.profile_path, 'w500')}
          alt={person.name}
          onError={handleMediaImageError}
        />
        <div>
          <h1>{person.name}</h1>
          {person.birthday ? <p><strong>Born:</strong> {formatPersonDate(person.birthday)}</p> : null}
          {person.deathday ? <p><strong>Died:</strong> {formatPersonDate(person.deathday)}</p> : null}
          {person.place_of_birth ? <p><strong>Place of birth:</strong> {person.place_of_birth}</p> : null}
          {person.also_known_as.length > 0 ? <p><strong>Also known as:</strong> {person.also_known_as.join(', ')}</p> : null}
          <div className="external-id-list">
            {person.homepage ? <a href={person.homepage} target="_blank" rel="noreferrer">Official website</a> : null}
            {person.imdb_id ? (
              <a href={`https://www.imdb.com/name/${person.imdb_id}/`} target="_blank" rel="noreferrer">
                IMDb: {person.imdb_id}
              </a>
            ) : null}
          </div>
        </div>
      </div>

      {person.biography ? (
        <section className="media-detail-section">
          <h2>Biography</h2>
          <p className="biography-text">{person.biography}</p>
        </section>
      ) : null}

      {person.images?.profiles && person.images.profiles.length > 0 ? (
        <section className="media-detail-section">
          <h2>Photos</h2>
          <div className="artwork-grid">
            {person.images.profiles.slice(0, 12).map((image) => (
              <a href={getImageUrl(image.file_path, 'original')} key={image.file_path} target="_blank" rel="noreferrer">
                <img
                  src={getImageUrl(image.file_path, 'w500')}
                  alt={`${person.name} photo`}
                  onError={handleMediaImageError}
                  loading="lazy"
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="media-detail-section">
        <h2>Filmography</h2>
        <div className="filmography-tabs" role="tablist" aria-label="Filmography type">
          <button type="button" aria-selected={activeTab === 'cast'} onClick={() => setActiveTab('cast')}>
            Acting ({castCredits.length})
          </button>
          <button type="button" aria-selected={activeTab === 'crew'} onClick={() => setActiveTab('crew')}>
            Crew ({crewCredits.length})
          </button>
        </div>
        <PersonFilmographyGrid credits={activeTab === 'cast' ? castCredits : crewCredits} />
      </section>
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
