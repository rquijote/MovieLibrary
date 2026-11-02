import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MediaExtras } from './MediaExtras';

describe('media extras', () => {
  it('only renders supported YouTube videos', () => {
    const markup = renderToStaticMarkup(<MediaExtras videos={{ results: [
      { id: '1', name: 'Official trailer', key: 'trailer', site: 'YouTube', type: 'Trailer', official: true, published_at: '' },
      { id: '2', name: 'Other host', key: 'other', site: 'Vimeo', type: 'Clip', official: false, published_at: '' },
    ] }} />);
    expect(markup).toContain('Trailers &amp; Videos');
    expect(markup).toContain('https://www.youtube.com/watch?v=trailer');
    expect(markup).not.toContain('Other host');
  });

  it('does not render sections for removed metadata, even if the API supplies it', () => {
    const apiData = {
      images: { posters: [{ file_path: '/poster.jpg' }] },
      keywords: [{ id: 1, name: 'keyword' }],
      externalIds: { imdb_id: 'tt123' },
      releaseDates: { results: [{ iso_3166_1: 'US', release_dates: [{ certification: 'PG' }] }] },
      translations: { translations: [{ name: 'English' }] },
      videos: null,
      reviews: { results: [{ id: 'review', content: 'Do not show this review' }] },
    };
    expect(renderToStaticMarkup(<MediaExtras {...apiData} />)).toBe('');
  });
});
