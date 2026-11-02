import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { MovieDto } from '../../types/media';
import { MediaRow } from './MediaRow';

const movie: MovieDto = {
  id: 1, title: 'Movie without artwork', original_title: 'Movie without artwork',
  overview: '', poster_path: null, backdrop_path: null, release_date: '2026-01-01',
  original_language: 'en', vote_average: 8, vote_count: 100, popularity: 1,
  video: false, genre_ids: [],
};

function render(posterPath: string | null) {
  return renderToStaticMarkup(
    <MemoryRouter>
      <MediaRow title="Movies" items={[{ ...movie, poster_path: posterPath }]} mediaType="movies" category="popular" />
    </MemoryRouter>,
  );
}

describe('media row artwork', () => {
  it('reveals the existing hover title by default when the poster is absent', () => {
    const markup = render(null);
    expect(markup).toContain('media-row-item media-row-item-no-image');
    expect(markup).toContain('media-row-poster-placeholder');
    expect(markup).toContain('<span class="media-row-item-title">Movie without artwork</span>');
    expect(markup).not.toContain('<img');
    expect(markup).not.toContain('No Image');
  });

  it('preserves the regular hover behavior when artwork is available', () => {
    const markup = render('/poster.jpg');
    expect(markup).toContain('https://image.tmdb.org/t/p/w185/poster.jpg');
    expect(markup).not.toContain('media-row-item-no-image');
    expect(markup).not.toContain('media-row-poster-placeholder');
  });
});
