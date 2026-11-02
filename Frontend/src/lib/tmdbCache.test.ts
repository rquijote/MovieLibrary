import { describe, expect, it } from 'vitest';
import { projectTmdbDetailsForOfflineCache } from './tmdbCache';

describe('TMDB detail cache projection', () => {
  it('keeps core movie details but omits large appended data from offline snapshots', () => {
    const response = {
      id: 11,
      title: 'Star Wars',
      belongs_to_collection: { id: 10, name: 'Star Wars Collection' },
      credits: { cast: [{ id: 1 }] },
      images: { posters: [{ file_path: '/poster.jpg' }] },
      recommendations: { results: [{ id: 2 }] },
      videos: { results: [{ id: 'trailer' }] },
    };

    expect(projectTmdbDetailsForOfflineCache('/api/Movie/11', response)).toEqual({
      id: 11,
      title: 'Star Wars',
      belongs_to_collection: { id: 10, name: 'Star Wars Collection' },
    });
  });

  it('leaves other cached API responses unchanged', () => {
    const response = { results: [{ id: 11, title: 'Star Wars' }] };
    expect(projectTmdbDetailsForOfflineCache('/api/MovieLists/popular', response)).toBe(response);
  });
});
