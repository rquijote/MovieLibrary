import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LoadingState } from './LoadingState';

describe('loading placeholders', () => {
  it.each(['rows', 'grid', 'details', 'inline'] as const)('announces %s loading without exposing decorative blocks', (variant) => {
    const markup = renderToStaticMarkup(<LoadingState variant={variant} label="Loading movies" />);
    expect(markup).toContain('role="status"');
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toContain('Loading movies');
    expect(markup).toContain('aria-hidden="true"');
    expect(markup).not.toContain('<button');
  });

  it('uses two preview rows or a full results grid', () => {
    const rows = renderToStaticMarkup(<LoadingState />);
    const grid = renderToStaticMarkup(<LoadingState variant="grid" />);
    expect(rows.match(/class="loading-card"/g)).toHaveLength(12);
    expect(grid.match(/class="loading-card"/g)).toHaveLength(8);
  });

  it('keeps inline loading compact', () => {
    const markup = renderToStaticMarkup(<LoadingState variant="inline" label="Finding titles" />);
    expect(markup).toContain('class="loading-label"');
    expect(markup).not.toContain('loading-poster');
  });
});
