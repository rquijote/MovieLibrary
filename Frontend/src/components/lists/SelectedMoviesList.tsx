import { useRef, useState } from 'react';
import { getImageUrl, handleMediaImageError } from '../../lib/media';
import type { MovieDto } from '../../types/media';

interface SelectedMoviesListProps {
  items: MovieDto[];
  onRemove: (movieId: number) => void;
  onReorder?: (movieId: number, targetId: number) => void;
}

export function SelectedMoviesList({ items, onRemove, onReorder }: SelectedMoviesListProps) {
  const draggedId = useRef<number | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const move = (movieId: number, targetId: number) => {
    onReorder?.(movieId, targetId);
    setAnnouncement(`Moved ${items.find((movie) => movie.id === movieId)?.title} to position ${items.findIndex((movie) => movie.id === targetId) + 1}.`);
  };
  if (items.length === 0) {
    return <div className="lists-empty"><strong>Your next great list starts here.</strong>Search above to add your first movie.</div>;
  }

  return (
    <div className="selected-movies-list">
      <span className="sr-only" role="status">{announcement}</span>
      {items.map((movie, index) => (
        <article key={movie.id} className="selected-movie-row"
          onDragOver={(event) => { if (onReorder && draggedId.current !== null) event.preventDefault(); }}
          onDrop={(event) => {
            if (draggedId.current === null) return;
            event.preventDefault();
            move(draggedId.current, movie.id);
            draggedId.current = null;
          }}>
          {onReorder ? <div className="movie-order-controls">
            <button type="button" className="movie-drag-handle" draggable
              aria-label={`Drag ${movie.title} to reorder`}
              onDragStart={(event) => {
                draggedId.current = movie.id;
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', String(movie.id));
              }} onDragEnd={() => { draggedId.current = null; }}>⠿</button>
            <button type="button" disabled={index === 0} aria-label={`Move ${movie.title} up`}
              onClick={() => move(movie.id, items[index - 1].id)}>↑</button>
            <button type="button" disabled={index === items.length - 1} aria-label={`Move ${movie.title} down`}
              onClick={() => move(movie.id, items[index + 1].id)}>↓</button>
          </div> : null}
          <img draggable={false} src={getImageUrl(movie.poster_path, 'w92')} alt={movie.title} onError={handleMediaImageError} />
          <div className="selected-movie-main">
            <h3>{movie.title}</h3>
            <p>{movie.release_date ? movie.release_date.slice(0, 4) : 'N/A'}</p>
          </div>
          <button type="button" className="remove-selected-movie" onClick={() => onRemove(movie.id)} aria-label={`Remove ${movie.title}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M9 3.75A1.75 1.75 0 0 1 10.75 2h2.5A1.75 1.75 0 0 1 15 3.75V4h3.25a.75.75 0 0 1 0 1.5h-.72l-.78 11.04A2.25 2.25 0 0 1 14.5 18.5h-5A2.25 2.25 0 0 1 7.25 16.54L6.47 5.5h-.72a.75.75 0 0 1 0-1.5H9v-.25Zm1.5 0V4h2V3.75a.25.25 0 0 0-.25-.25h-1.5a.25.25 0 0 0-.25.25ZM8 5.5l.74 10.93c.02.4.36.72.76.72h5a.75.75 0 0 0 .75-.72L16 5.5H8Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </article>
      ))}
    </div>
  );
}
