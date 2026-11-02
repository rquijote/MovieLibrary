import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { ExpandedMediaListPage } from './ExpandedMediaListPage';

vi.mock('../lib/api', () => ({ apiGet: vi.fn() }));

function render(path: string) {
  return renderToStaticMarkup(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/:mediaType/:sourceId/:category" element={<ExpandedMediaListPage />} />
        <Route path="/:mediaType/:category" element={<ExpandedMediaListPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('expanded related-title routes', () => {
  it.each([
    ['/movies/155/recommendations', 'Recommended movies'],
    ['/movies/155/similar', 'Similar movies'],
    ['/tvshows/1399/recommendations', 'Recommended TV shows'],
    ['/tvshows/1399/similar', 'Similar TV shows'],
  ])('supports %s with the existing pagination and filters', (path, title) => {
    const markup = render(path);
    expect(markup).toContain(title);
    expect(markup).toContain('Jump to page');
    expect(markup).toContain('Media filters');
    expect(markup).not.toContain('Route not found.');
  });

  it.each(['/tvshows/invalid/similar', '/movies/155/popular', '/people/1/recommendations'])(
    'rejects invalid related-title route %s', (path) => {
      expect(render(path)).toContain('Route not found.');
    },
  );

  it('preserves ordinary category lists', () => {
    const markup = render('/movies/popular');
    expect(markup).toContain('popular movies');
    expect(markup).toContain('Jump to page');
  });

  it('renders two year sliders, editable text boundaries, and a text page field', () => {
    const markup = render('/movies/popular?yearMin=1990&yearMax=2020');
    expect(markup.match(/type="range"/g)).toHaveLength(2);
    expect(markup).toMatch(/<input type="text"[^>]*name="yearMin"/);
    expect(markup).toMatch(/<input type="text"[^>]*name="yearMax"/);
    expect(markup).toContain('value="1990"');
    expect(markup).toContain('value="2020"');
    expect(markup).toMatch(/<input[^>]*type="text"[^>]*name="page"/);
    expect(markup).not.toContain('type="number"');
    expect(markup).not.toContain('Apply filters');
    expect(markup).toContain('Clear filters');
  });

  it('keeps legacy single-year links as equal min/max boundaries', () => {
    const markup = render('/tvshows/popular?year=2020');
    expect(markup.match(/value="2020"/g)).toHaveLength(2);
    expect(markup).toContain('Premiered between');
    expect(markup).toContain('media-filter-actions');
  });
});
