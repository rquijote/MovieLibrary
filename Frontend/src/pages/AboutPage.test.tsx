import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Layout } from '../components/layout/Layout';
import { AboutPage } from './AboutPage';

vi.mock('../components/header/AppHeader', () => ({ AppHeader: () => null }));
vi.mock('../components/layout/OfflineStatus', () => ({ OfflineStatus: () => null }));

const notice = 'This product uses the TMDB API but is not endorsed or certified by TMDB.';

describe('TMDB attribution', () => {
  it('credits TMDB with the official linked logo and exact notice', () => {
    const markup = renderToStaticMarkup(<AboutPage />);
    expect(markup).toContain(notice);
    expect(markup).toContain('href="https://www.themoviedb.org"');
    expect(markup).toContain('src="/tmdb-logo.svg"');
    expect(markup).toContain('alt="The Movie Database (TMDB)"');
    expect(markup).toContain('About &amp; Credits');
  });

  it('makes credits and the notice available in the shared footer', () => {
    const markup = renderToStaticMarkup(<MemoryRouter><Layout /></MemoryRouter>);
    expect(markup).toContain('href="/about"');
    expect(markup).toContain(notice);
    expect(markup).toContain('<footer');
  });
});
