import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { movieGenres, tvGenres } from './genres';
import { genrePreferencesStorageKey, readGenrePreferences, saveGenrePreferences } from './genrePreferences';

vi.mock('./session', () => ({ getAccountId: () => 42 }));

const storage = new Map<string, string>();
const key = `${genrePreferencesStorageKey}:42`;

beforeEach(() => {
  storage.clear();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (name: string) => storage.get(name) ?? null,
      setItem: (name: string, value: string) => storage.set(name, value),
    },
    dispatchEvent: vi.fn(),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe('genre preferences', () => {
  it('saves and reloads every available genre without truncation', () => {
    const preferences = {
      movies: movieGenres.map(({ id }) => id),
      tv: tvGenres.map(({ id }) => id),
    };
    expect(preferences.movies.length).toBeGreaterThan(6);
    expect(preferences.tv.length).toBeGreaterThan(6);

    saveGenrePreferences(preferences);

    expect(JSON.parse(storage.get(key)!)).toEqual(preferences);
    expect(readGenrePreferences()).toEqual(preferences);
    expect(window.dispatchEvent).toHaveBeenCalledOnce();
  });

  it('preserves empty selections after saving and reloading', () => {
    saveGenrePreferences({ movies: [], tv: [] });
    expect(readGenrePreferences()).toEqual({ movies: [], tv: [] });
  });

  it('still removes duplicates and invalid genre IDs', () => {
    storage.set(key, JSON.stringify({
      movies: [28, 28, -1, '35', 35],
      tv: [18, 18, null, 999999],
    }));
    expect(readGenrePreferences()).toEqual({ movies: [28, 35], tv: [18] });
  });
});
