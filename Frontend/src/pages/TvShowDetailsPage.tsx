import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MediaActionsPanel } from '../components/media-actions/MediaActionsPanel';
import { apiGet } from '../lib/api';
import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { TvShowDto } from '../types/media';

export function TvShowDetailsPage() {
  const { id } = useParams();
  const [tvShow, setTvShow] = useState<TvShowDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setTvShow(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await apiGet<TvShowDto>(`/api/TvShow/${id}`);
        setTvShow(result);
      } catch {
        setTvShow(null);
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, [id]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!tvShow) {
    return <p>TV show not found.</p>;
  }

  return (
    <div className="details-view">
      {tvShow.backdrop_path ? (
        <div
          className="details-hero"
          style={{ backgroundImage: `url(${getImageUrl(tvShow.backdrop_path, 'original')})` }}
          aria-hidden="true"
        />
      ) : null}

      <div className="details-header">
        <img
          src={getImageUrl(tvShow.poster_path ?? tvShow.backdrop_path)}
          alt={tvShow.name}
          className="details-poster"
          onError={handleMediaImageError}
        />

        <div>
          <h1>{tvShow.name}</h1>
          {tvShow.original_name && tvShow.original_name !== tvShow.name ? (
            <p>
              <strong>Original Name:</strong> {tvShow.original_name}
            </p>
          ) : null}
          <p>
            <strong>First Air Year:</strong> {tvShow.first_air_date ? tvShow.first_air_date.slice(0, 4) : 'N/A'}
          </p>
          <p>
            <strong>Rating:</strong> {tvShow.vote_average.toFixed(1)} / 10 ({tvShow.vote_count} votes)
          </p>
          <p>
            <strong>Popularity:</strong> {tvShow.popularity.toFixed(1)}
          </p>
          <p>
            <strong>Original Language:</strong> {tvShow.original_language.toUpperCase()}
          </p>
          <p>
            <strong>ID:</strong> {tvShow.id}
          </p>
          {tvShow.origin_country.length > 0 ? (
            <p>
              <strong>Origin Country:</strong> {tvShow.origin_country.join(', ')}
            </p>
          ) : null}

          <MediaActionsPanel mediaId={tvShow.id} mediaType="tv" showListActions={false} />
        </div>
      </div>

      {tvShow.overview ? (
        <section>
          <h2>Overview</h2>
          <p>{tvShow.overview}</p>
        </section>
      ) : null}

      {tvShow.genres && tvShow.genres.length > 0 ? (
        <section>
          <h3>Genres</h3>
          <p>{tvShow.genres.map((genre) => genre.name).join(', ')}</p>
        </section>
      ) : null}

      {tvShow.genre_ids.length > 0 ? (
        <section>
          <h3>Genre IDs</h3>
          <p>{tvShow.genre_ids.join(', ')}</p>
        </section>
      ) : null}
    </div>
  );
}
