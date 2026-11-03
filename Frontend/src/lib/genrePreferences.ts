import { useEffect, useState } from 'react';
import { movieGenres, tvGenres } from './genres';
import { getAccountId } from './session';

export const MAX_GENRE_SELECTIONS = 6;
export const genrePreferencesStorageKey = 'movie-library-genre-preferences';

export interface GenrePreferences {
  movies: number[];
  tv: number[];
}

const defaultPreferences: GenrePreferences = {
  movies: [28, 35, 18, 878, 53],
  tv: [10759, 35, 18, 80, 10765],
};

const preferencesChangedEvent = 'movie-library:genre-preferences-changed';
const storageKey = () => `${genrePreferencesStorageKey}:${getAccountId() ?? 'public'}`;

function sanitizeIds(value: unknown, validIds: Set<number>, fallback: number[]): number[] {
  if (!Array.isArray(value)) {
    return [...fallback];
  }

  return [...new Set(value.filter((id): id is number => typeof id === 'number' && validIds.has(id)))]
    .slice(0, MAX_GENRE_SELECTIONS);
}

export function readGenrePreferences(): GenrePreferences {
  try {
    const stored = window.localStorage.getItem(storageKey());
    if (!stored) {
      return { movies: [...defaultPreferences.movies], tv: [...defaultPreferences.tv] };
    }

    const parsed: unknown = JSON.parse(stored);
    if (typeof parsed !== 'object' || parsed === null) {
      return { movies: [...defaultPreferences.movies], tv: [...defaultPreferences.tv] };
    }

    const values = parsed as Partial<Record<keyof GenrePreferences, unknown>>;
    return {
      movies: sanitizeIds(values.movies, new Set(movieGenres.map(({ id }) => id)), defaultPreferences.movies),
      tv: sanitizeIds(values.tv, new Set(tvGenres.map(({ id }) => id)), defaultPreferences.tv),
    };
  } catch {
    return { movies: [...defaultPreferences.movies], tv: [...defaultPreferences.tv] };
  }
}

export function saveGenrePreferences(preferences: GenrePreferences): void {
  const sanitized: GenrePreferences = {
    movies: sanitizeIds(preferences.movies, new Set(movieGenres.map(({ id }) => id)), []),
    tv: sanitizeIds(preferences.tv, new Set(tvGenres.map(({ id }) => id)), []),
  };

  window.localStorage.setItem(storageKey(), JSON.stringify(sanitized));
  window.dispatchEvent(new Event(preferencesChangedEvent));
}

export function useGenrePreferences(): GenrePreferences {
  const [preferences, setPreferences] = useState(readGenrePreferences);

  useEffect(() => {
    const refreshPreferences = () => setPreferences(readGenrePreferences());
    window.addEventListener(preferencesChangedEvent, refreshPreferences);
    window.addEventListener('storage', refreshPreferences);
    return () => {
      window.removeEventListener(preferencesChangedEvent, refreshPreferences);
      window.removeEventListener('storage', refreshPreferences);
    };
  }, []);

  return preferences;
}