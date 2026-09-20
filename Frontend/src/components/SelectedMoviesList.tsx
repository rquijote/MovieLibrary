import { getImageUrl, handleMediaImageError } from '../lib/media';
import type { MovieDto } from '../types/media';

interface SelectedMoviesListProps {
  items: MovieDto[];
  onRemove: (movieId: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

export function SelectedMoviesList({ items, onRemove, onReorder }: SelectedMoviesListProps) {
  const handleDrop = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    onReorder(fromIndex, toIndex);
  };

  if (items.length === 0) {
    return <p className="muted">No movies selected yet.</p>;
  }

  return (
    <div className="selected-movies-list">
      {items.map((movie, index) => (
        <article
          key={movie.id}
          className="selected-movie-row"
          draggable
          onDragStart={(event) => {
            event.dataTransfer.setData('text/plain', String(index));
            event.dataTransfer.effectAllowed = 'move';
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'move';
          }}
          onDrop={(event) => {
            event.preventDefault();
            const fromIndex = Number(event.dataTransfer.getData('text/plain'));
            handleDrop(fromIndex, index);
          }}
        >
          <span className="drag-handle" aria-hidden="true">⋮⋮</span>
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
