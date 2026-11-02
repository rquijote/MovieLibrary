import { useEffect, useState } from 'react';
import { movieGenres, tvGenres } from '../../lib/genres';
import {
  MAX_GENRE_SELECTIONS,
  readGenrePreferences,
  saveGenrePreferences,
  type GenrePreferences,
} from '../../lib/genrePreferences';
import './GenrePreferencesDialog.css';

interface GenrePreferencesDialogProps {
  onClose: () => void;
}

export function GenrePreferencesDialog({ onClose }: GenrePreferencesDialogProps) {
  const [draft, setDraft] = useState(readGenrePreferences);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleGenre = (type: keyof GenrePreferences, genreId: number) => {
    setDraft((current) => {
      const selected = current[type];
      return {
        ...current,
        [type]: selected.includes(genreId)
          ? selected.filter((id) => id !== genreId)
          : selected.length < MAX_GENRE_SELECTIONS ? [...selected, genreId] : selected,
      };
    });
  };

  const save = () => {
    saveGenrePreferences(draft);
    onClose();
  };

  return (
    <div
      className="genre-preferences-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section className="genre-preferences-dialog" role="dialog" aria-modal="true" aria-labelledby="genre-preferences-title">
        <header className="genre-preferences-header">
          <div>
            <h2 id="genre-preferences-title">Choose your genres</h2>
            <p>Select up to {MAX_GENRE_SELECTIONS} for each category.</p>
          </div>
          <button type="button" className="genre-preferences-close" onClick={onClose} aria-label="Close genre preferences">
            ×
          </button>
        </header>

        <div className="genre-preferences-groups">
          {([
            { type: 'movies', label: 'Movies', genres: movieGenres },
            { type: 'tv', label: 'TV shows', genres: tvGenres },
          ] as const).map(({ type, label, genres }) => (
            <fieldset className="genre-preferences-group" key={type}>
              <legend>{label}</legend>
              <div className="genre-preferences-options">
                {genres.map((genre) => {
                  const selected = draft[type].includes(genre.id);
                  return (
                    <label className="genre-preferences-option" key={genre.id}>
                      <input
                        type="checkbox"
                        checked={selected}
                        disabled={!selected && draft[type].length >= MAX_GENRE_SELECTIONS}
                        onChange={() => toggleGenre(type, genre.id)}
                      />
                      <span>{genre.name}</span>
                    </label>
                  );
                })}
              </div>
              <span className="genre-preferences-count">{draft[type].length} of {MAX_GENRE_SELECTIONS} selected</span>
            </fieldset>
          ))}
        </div>

        <footer className="genre-preferences-actions">
          <button className="genre-preferences-cancel" type="button" onClick={onClose}>Cancel</button>
          <button className="genre-preferences-save" type="button" onClick={save}>Save preferences</button>
        </footer>
      </section>
    </div>
  );
}