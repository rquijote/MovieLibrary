import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { SearchPage } from './SearchPage';

vi.mock('../lib/api', () => ({ apiGet: vi.fn() }));

describe('search year filters', () => {
  it('renders editable year boundaries, sliders and a separate actions row', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/search?q=batman&yearMin=1990&yearMax=2020']}>
        <SearchPage />
      </MemoryRouter>,
    );
    expect(markup).toContain('Released between');
    expect(markup).toContain('From');
    expect(markup).toContain('To');
    expect(markup).toContain('value="1990"');
    expect(markup).toContain('value="2020"');
    expect(markup.match(/type="range"/g)).toHaveLength(2);
    expect(markup).toContain('class="media-filter-actions"');
    expect(markup).not.toContain('type="number"');
    expect(markup).not.toContain('Min year');
    expect(markup).not.toContain('Max year');
    expect(markup).not.toContain('Apply filters');
    expect(markup).toContain('Clear filters');
  });
});
