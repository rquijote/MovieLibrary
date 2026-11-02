import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { MovieDto } from '../../types/media';
import { SelectedMoviesList } from './SelectedMoviesList';

const movie: MovieDto = {
  id: 42, title: 'Sunday movie', original_title: 'Sunday movie', overview: '',
  poster_path: null, backdrop_path: null, release_date: '2020-01-01',
  original_language: 'en', vote_average: 8, vote_count: 100, popularity: 10,
  video: false, genre_ids: [],
};

describe('selected list movies', () => {
  it('explains how to start an empty list', () => {
    const markup = renderToStaticMarkup(<SelectedMoviesList items={[]} onRemove={() => {}} />);
    expect(markup).toContain('class="lists-empty"');
    expect(markup).toContain('Search above to add your first movie.');
    expect(markup).not.toContain('<button');
  });

  it('labels removal controls and keeps the selected title and year visible', () => {
    const markup = renderToStaticMarkup(<SelectedMoviesList items={[movie]} onRemove={() => {}} />);
    expect(markup).toContain('aria-label="Remove Sunday movie"');
    expect(markup).toContain('<h3>Sunday movie</h3>');
    expect(markup).toContain('2020');
    expect(markup).toContain('stroke-width="1.6"');
  });
});
