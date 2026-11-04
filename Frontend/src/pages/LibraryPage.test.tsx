import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { LibraryPage } from './LibraryPage';

vi.mock('../lib/api', () => ({ apiGet: vi.fn() }));

describe('library heading', () => {
  it('keeps the title without promotional taglines', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter initialEntries={['/library?tab=lists']}><LibraryPage /></MemoryRouter>,
    );

    expect(markup).toContain('<h1>Your library</h1>');
    expect(markup).not.toContain('Made for you');
    expect(markup).not.toContain('The stories you love');
    expect(markup).not.toContain('yet to discover');
    expect(markup).toContain('Library categories');
  });
});
