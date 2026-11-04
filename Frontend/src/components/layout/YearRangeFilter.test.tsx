import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { YearRangeFilter } from './YearRangeFilter';

describe('year range filter', () => {
  it('shows unrestricted boundaries without suggesting page-specific limits', () => {
    const markup = renderToStaticMarkup(<YearRangeFilter label="Released between" />);
    expect(markup.match(/placeholder="Any year"/g)).toHaveLength(2);
    expect(markup).not.toContain('1870');
    expect(markup).not.toContain('2036');
    expect(markup).not.toContain('type="range"');
    expect(markup.match(/autoComplete="off"/g)).toHaveLength(2);
  });

  it('preserves selected years instead of deriving them from results', () => {
    const markup = renderToStaticMarkup(
      <YearRangeFilter min={1990} max={2020} label="Released between" />,
    );
    expect(markup.match(/placeholder="Any year"/g)).toHaveLength(2);
    expect(markup).toContain('value="1990"');
    expect(markup).toContain('value="2020"');
  });

  it('allows a single open boundary', () => {
    const markup = renderToStaticMarkup(<YearRangeFilter min={1999} label="Premiered between" />);
    expect(markup).toMatch(/name="yearMin"[^>]*value="1999"/);
    expect(markup).toMatch(/name="yearMax"[^>]*value=""/);
  });

  it('keeps open-ended placeholders even with explicit selected years', () => {
    const markup = renderToStaticMarkup(
      <YearRangeFilter min={1990} max={2020} label="Released between" />,
    );
    expect(markup.match(/placeholder="Any year"/g)).toHaveLength(2);
    expect(markup).toMatch(/name="yearMin"[^>]*value="1990"/);
    expect(markup).toMatch(/name="yearMax"[^>]*value="2020"/);
    expect(markup).not.toContain('min="1895"');
    expect(markup).not.toContain('max="2026"');
  });
});
