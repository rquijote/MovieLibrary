import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineStatus } from './OfflineStatus';

const mocks = vi.hoisted(() => ({
  status: {
    offline: false, cached: false, pending: 0, syncing: false,
    error: null as string | null, needsConfirmation: false, synced: false,
  },
}));

vi.mock('../../lib/api', () => ({
  getOfflineStatus: () => mocks.status,
  subscribeOfflineStatus: () => () => {},
  discardPendingChanges: vi.fn(),
  reportOfflineError: vi.fn(),
  syncOfflineChanges: vi.fn(),
}));
vi.mock('../../lib/session', () => ({
  useSession: () => ({ authenticated: true }),
}));

beforeEach(() => {
  Object.assign(mocks.status, {
    offline: false, cached: false, pending: 0, syncing: false,
    error: null, needsConfirmation: false, synced: false,
  });
  vi.stubGlobal('navigator', { onLine: true });
});

afterEach(() => vi.unstubAllGlobals());

describe('offline notifications', () => {
  it('shows completed synchronisation in the existing success toast', () => {
    mocks.status.synced = true;
    const markup = renderToStaticMarkup(<OfflineStatus />);
    expect(markup).toContain('action-toast-success');
    expect(markup).toContain('Edits synchronised.');
    expect(markup).not.toContain('offline-status');
    expect(markup).not.toContain('Refresh content');
  });

  it('hides the saved-content-only banner', () => {
    mocks.status.cached = true;
    expect(renderToStaticMarkup(<OfflineStatus />)).toBe('');
  });

  it('preserves pending-edit recovery actions and error messages', () => {
    mocks.status.pending = 2;
    mocks.status.error = 'Synchronization failed.';
    const markup = renderToStaticMarkup(<OfflineStatus />);
    expect(markup).toContain('2 edit(s)');
    expect(markup).toContain('Synchronization failed.');
    expect(markup).toContain('Retry synchronization');
    expect(markup).toContain('Discard pending edits');
    expect(markup).not.toContain('Refresh content');
    expect(markup).not.toContain('action-toast-success');
  });

  it('still warns when offline', () => {
    mocks.status.offline = true;
    expect(renderToStaticMarkup(<OfflineStatus />)).toContain('Connection unavailable.');
  });
});
