import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { MovieDto } from '../../types/media';

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
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 3.75A1.75 1.75 0 0 1 10.75 2h2.5A1.75 1.75 0 0 1 15 3.75V4h3.25a.75.75 0 0 1 0 1.5h-.72l-.78 11.04A2.25 2.25 0 0 1 14.5 18.5h-5A2.25 2.25 0 0 1 7.25 16.54L6.47 5.5h-.72a.75.75 0 0 1 0-1.5H9v-.25Zm1.5 0V4h2V3.75a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25ZM8 5.5l.74 10.93c.02.4.36.72.76.72h5a.75.75 0 0 0 .75-.72L16 5.5H8Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </article>
      ))}
    </div>
  );
}
