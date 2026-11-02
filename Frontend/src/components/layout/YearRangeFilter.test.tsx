import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { MovieDto } from '../../types/media';
import { getMediaYearBounds } from '../../lib/media';
import { YearRangeFilter } from './YearRangeFilter';

function movie(release_date: string, id = 1): MovieDto {
  return {
    id, release_date, title: 'Movie', original_title: 'Movie', overview: '',
    poster_path: null, backdrop_path: null, original_language: 'en', vote_average: 0,
    vote_count: 0, popularity: 0, video: false, genre_ids: [],
  };
}

describe('result-based year slider limits', () => {
  it('uses the earliest and latest dated titles, ignoring missing dates', () => {
    const items = [movie('1989-06-23'), movie('2022-03-04', 2), movie('', 3)];
    expect(getMediaYearBounds(items)).toEqual({ min: 1989, max: 2022 });
    const markup = renderToStaticMarkup(<YearRangeFilter items={items} label="Released between" />);
    expect(markup.match(/min="1989" max="2022"/g)).toHaveLength(2);
    expect(markup).toContain('placeholder="1989"');
    expect(markup).toContain('placeholder="2022"');
    expect(markup).not.toContain('1870');
    expect(markup).not.toContain('2036');
  });

  it('does not narrow the available limits to the selected years', () => {
    const markup = renderToStaticMarkup(
      <YearRangeFilter items={[movie('1989-06-23'), movie('2022-03-04', 2)]}
        min={1990} max={2020} label="Released between" />,
    );
    expect(markup.match(/min="1989" max="2022"/g)).toHaveLength(2);
    expect(markup).toContain('value="1990"');
    expect(markup).toContain('value="2020"');
  });

  it('disables sliders without dated results or when all titles have the same year', () => {
    for (const items of [[], [movie('')], [movie('1999-01-01')]]) {
      const markup = renderToStaticMarkup(<YearRangeFilter items={items} label="Released between" />);
      expect(markup.match(/type="range" disabled=""/g)).toHaveLength(2);
      expect(markup).not.toContain('NaN');
      expect(markup).not.toContain('Infinity');
    }
  });
});
