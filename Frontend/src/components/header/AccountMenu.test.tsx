import { renderToStaticMarkup } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AccountMenu } from './AccountMenu';
import { AccountDialog } from './AccountDialog';
import { MediaActionsPanel } from '../media-actions/MediaActionsPanel';

const mocks = vi.hoisted(() => ({
  session: { authenticated: false, csrfToken: '', account: undefined as { id: number; username: string; avatarPath?: string } | undefined },
  start: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('../../lib/session', () => ({
  useSession: () => mocks.session,
  startTmdbLogin: mocks.start,
  completeTmdbLogin: vi.fn(),
  logoutFromTmdb: vi.fn(),
  getAccountId: () => mocks.session.account?.id ?? null,
}));

vi.mock('../../lib/api', () => ({
  apiGet: mocks.get,
  apiPost: mocks.post,
  apiDelete: mocks.remove,
  getOfflineStatus: () => ({ pending: 0 }),
  clearAccountOfflineData: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.session.authenticated = false;
  mocks.session.account = undefined;
});

describe('account confirmation UI', () => {
  it('uses the TMDB account photo when available', () => {
    mocks.session.authenticated = true;
    mocks.session.account = { id: 42, username: 'movie-fan', avatarPath: '/avatar.jpg' };
    const markup = renderToStaticMarkup(<AccountMenu profile />);
    expect(markup).toContain('https://image.tmdb.org/t/p/w185/avatar.jpg');
    expect(markup).not.toContain('profile-avatar-icon');
  });

  it('uses an account initial when the TMDB photo is missing', () => {
    mocks.session.authenticated = true;
    mocks.session.account = { id: 42, username: 'movie-fan' };
    const markup = renderToStaticMarkup(<AccountMenu profile />);
    expect(markup).toContain('profile-initial');
    expect(markup).toContain('>M</span>');
  });

  it('renders only the profile trigger until it is clicked', () => {
    const markup = renderToStaticMarkup(<AccountMenu profile />);
    expect(markup).toContain('profile-placeholder');
    expect(markup).toContain('aria-label="Log in"');
    expect(markup).toContain('profile-avatar-icon');
    expect(markup).not.toContain('<dialog');
    expect(markup).not.toContain('Continue with TMDB');
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('shows a confirmation prompt without starting TMDB login', () => {
    const markup = renderToStaticMarkup(
      <AccountDialog onClose={() => {}} reason="Log in to rate this title." />,
    );
    expect(markup).toContain('<dialog');
    expect(markup).toContain('Log in to rate this title.');
    expect(markup).toContain('Continue with TMDB');
    expect(markup).not.toContain('Import Letterboxd CSV');
    expect(mocks.start).not.toHaveBeenCalled();
  });

  it('keeps save and rating controls visible for signed-out visitors without private requests', () => {
    const markup = renderToStaticMarkup(<MediaActionsPanel mediaId={1} mediaType="movie" />);
    expect(markup).toContain('Add to list');
    expect(markup).toContain('Add to favorites');
    expect(markup).toContain('Mark as watched');
    expect(markup).toContain('Rate this title out of 5 stars');
    expect(markup).not.toContain('<dialog');
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.get).not.toHaveBeenCalled();
    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.remove).not.toHaveBeenCalled();
  });

  it('offers settings and direct logout in a signed-in dropdown, not a dialog', () => {
    mocks.session.authenticated = true;
    mocks.session.account = { id: 42, username: 'movie-fan' };
    const markup = renderToStaticMarkup(<MemoryRouter><AccountMenu profile initiallyOpen /></MemoryRouter>);
    expect(markup).toContain('aria-expanded="true"');
    expect(markup).toContain('movie-fan');
    expect(markup).toContain('href="/settings"');
    expect(markup).toContain('Settings');
    expect(markup).toContain('Log out');
    expect(markup).not.toContain('Genre preferences');
    expect(markup).not.toContain('Import Letterboxd CSV');
    expect(markup).not.toContain('<dialog');
    expect(markup).not.toContain('Continue with TMDB');
  });
});
