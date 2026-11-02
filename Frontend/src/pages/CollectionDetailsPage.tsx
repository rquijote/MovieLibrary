import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaGrid } from '../components/layout/MediaGrid';
import { apiGet } from '../lib/api';
import { getImageUrl } from '../lib/media';
import type { MovieCollectionDto } from '../types/media';

export function CollectionDetailsPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<MovieCollectionDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Collection ID was not specified.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setCollection(await apiGet<MovieCollectionDto>(`/api/Collection/${id}`));
        setError(null);
      } catch (loadError) {
        setCollection(null);
        setError(loadError instanceof Error ? loadError.message : 'Collection could not be loaded.');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) return <LoadingState variant="grid" label="Loading collection" />;
  if (!collection) return <p role="alert">{error ?? 'Collection not found.'}</p>;

  return (
    <div className="details-view">
      {collection.backdrop_path ? (
        <div
          className="details-hero"
          style={{ backgroundImage: `url(${getImageUrl(collection.backdrop_path, 'original')})` }}
          aria-hidden="true"
        />
      ) : null}
      <section className="media-detail-section">
        <h1>{collection.name}</h1>
        {collection.overview ? <p>{collection.overview}</p> : null}
      </section>
      <section className="media-detail-section">
        <h2>Movies in this collection</h2>
        <MediaGrid items={collection.parts} mediaType="movies" showYearOnly />
      </section>
    </div>
  );
}
import { LoadingState } from '../components/layout/LoadingState';
