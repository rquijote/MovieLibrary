import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { MovieDto } from '../types/media';

interface SelectedMoviesListProps {
  items: MovieDto[];
  onRemove: (movieId: number) => void;
}

export function SelectedMoviesList({ items, onRemove }: SelectedMoviesListProps) {
  if (items.length === 0) {
    return <p className="muted">No movies selected yet.</p>;
  }

  return (
    <div className="selected-movies-list">
      {items.map((movie) => (
        <article key={movie.id} className="selected-movie-row">
          <img src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} onError={handleMediaImageError} />
          <div className="selected-movie-main">
            <h3>{movie.title}</h3>
            <p>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</p>
          </div>
          <button type="button" className="remove-selected-movie" onClick={() => onRemove(movie.id)} aria-label={`Remove ${movie.title}`}>
            🗑️
          </button>
        </article>
      ))}
    </div>
  );
}
