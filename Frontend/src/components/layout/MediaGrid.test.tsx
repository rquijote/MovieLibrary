import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { MovieDto } from '../../types/media';
import { MediaGrid } from './MediaGrid';

const noPoster: MovieDto = {
  id: 1, title: 'No poster', original_title: 'No poster', overview: '',
  poster_path: null, backdrop_path: null, release_date: '2026-01-01',
  original_language: 'en', vote_average: 8, vote_count: 100, popularity: 1,
  video: false, genre_ids: [],
};

describe('media grid artwork preference', () => {
  it('places poster-backed titles first and keeps titles without posters', () => {
    const withPoster = { ...noPoster, id: 2, title: 'Has poster', poster_path: '/poster.jpg' };
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <MediaGrid items={[noPoster, withPoster]} mediaType="movies" preferImages />
      </MemoryRouter>,
    );
    expect(markup.indexOf('Has poster')).toBeLessThan(markup.indexOf('No poster'));
    expect(markup).toContain('No poster');
  });
});
