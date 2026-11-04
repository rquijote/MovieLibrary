import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { CastCreditDto } from '../../types/media';
import { CreditsSection } from './CreditsSection';

describe('cast section', () => {
  it('hides the section when no cast is available', () => {
    expect(renderToStaticMarkup(<CreditsSection cast={[]} />)).toBe('');
  });

  it('preserves cast links, episode counts and overflow without rendering crew', () => {
    const cast: CastCreditDto[] = Array.from({ length: 13 }, (_, index) => ({
      id: index + 1,
      name: `Actor ${index + 1}`,
      profile_path: null,
      character: null,
      order: index,
      roles: [{ character: `Character ${index + 1}`, episode_count: 10 }],
      total_episode_count: 10,
    }));
    const apiCredits = { cast, crew: [{ id: 100, name: 'Hidden director' }] };
    const markup = renderToStaticMarkup(
      <MemoryRouter><CreditsSection {...apiCredits} aggregate /></MemoryRouter>,
    );

    expect(markup).toContain('<h2>Cast</h2>');
    expect(markup).toContain('href="/person/1"');
    expect(markup).toContain('Character 1');
    expect(markup).toContain('10 episodes');
    expect(markup).toContain('Show all 13 cast members');
    expect(markup.match(/class="person-credit-image"/g)).toHaveLength(13);
    expect(markup.match(/width="185" height="278"/g)).toHaveLength(13);
    expect(markup).not.toContain('Crew');
    expect(markup).not.toContain('Hidden director');
  });
});
