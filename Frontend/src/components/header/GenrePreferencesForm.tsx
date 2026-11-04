import { useState } from 'react';
import { movieGenres, tvGenres } from '../../lib/genres';
import {
  readGenrePreferences,
  saveGenrePreferences,
  type GenrePreferences,
} from '../../lib/genrePreferences';
import './GenrePreferencesForm.css';

export function GenrePreferencesForm() {
  const [draft, setDraft] = useState(readGenrePreferences);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleGenre = (type: keyof GenrePreferences, genreId: number) => {
    setSaved(false);
    setError(null);
    setDraft((current) => {
      const selected = current[type];
      return {
        ...current,
        [type]: selected.includes(genreId)
          ? selected.filter((id) => id !== genreId)
          : [...selected, genreId],
      };
    });
  };

  const save = () => {
    setSaved(false);
    setError(null);
    try {
      saveGenrePreferences(draft);
      setSaved(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your genre preferences.');
    }
  };

  return (
      <form aria-labelledby="genre-preferences-title" autoComplete="off" onSubmit={(event) => { event.preventDefault(); save(); }}>
        <header className="genre-preferences-header">
          <div>
            <h2 id="genre-preferences-title">Genre preferences</h2>
            <p>Select as many genres as you like for each category.</p>
            <p>These preferences are saved for your account on this browser.</p>
          </div>
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
                        autoComplete="off"
                        checked={selected}
                        onChange={() => toggleGenre(type, genre.id)}
                      />
                      <span>{genre.name}</span>
                    </label>
                  );
                })}
              </div>
              <span className="genre-preferences-count">{draft[type].length} selected</span>
            </fieldset>
          ))}
        </div>

        <footer className="genre-preferences-actions">
          <button className="genre-preferences-cancel" type="button" onClick={() => {
            setDraft({ movies: [], tv: [] });
            setSaved(false);
            setError(null);
          }}>Remove all</button>
          <button className="genre-preferences-cancel" type="button" onClick={() => {
            setDraft(readGenrePreferences());
            setSaved(false);
            setError(null);
          }}>Reset changes</button>
          <button className="genre-preferences-save" type="submit">Save preferences</button>
        </footer>
        {saved ? <p role="status">Genre preferences saved.</p> : null}
        {error ? <p className="account-menu-error" role="alert">{error}</p> : null}
      </form>
  );
}