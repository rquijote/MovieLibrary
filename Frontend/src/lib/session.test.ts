import { beforeEach, describe, expect, it, vi } from 'vitest';

let session: typeof import('./session');
const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), {
  status, headers: { 'Content-Type': 'application/json' },
});

beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('fetch', vi.fn());
  vi.stubGlobal('window', { location: { assign: vi.fn() } });
  session = await import('./session');
});

describe('TMDB session boundary', () => {
  it('requires a verified account and never persists a TMDB credential in browser storage', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({
      authenticated: true, account: { id: 42, username: 'test-user', name: 'Test' }, csrfToken: 'anti-csrf',
    }));
    await session.initializeSession();
    expect(session.getAccountId()).toBe(42);
    expect(session.sessionHeaders()).toEqual({ 'X-TMDB-Account-Id': '42', 'X-CSRF-TOKEN': 'anti-csrf' });
    expect(fetch).toHaveBeenCalledWith('/api/Auth/session', expect.objectContaining({
      cache: 'no-store', credentials: 'include',
    }));
    session.expireSession();
    expect(session.getAccountId()).toBeNull();
    expect(() => session.assertAccount(42)).toThrow('account changed');
  });

  it('rejects invalid account responses', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ authenticated: true, account: { id: -1 }, csrfToken: 'token' }));
    await expect(session.initializeSession()).rejects.toThrow('invalid TMDB account');
    expect(session.getAccountId()).toBeNull();
  });

  it('returns only the official TMDB approval page and its completion mode', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ authenticated: false, csrfToken: 'token' }))
      .mockResolvedValueOnce(json({ approvalUrl: 'https://www.themoviedb.org/authenticate/request-token', completion: 'manual' }));
    await expect(session.startTmdbLogin()).resolves.toEqual({
      approvalUrl: 'https://www.themoviedb.org/authenticate/request-token', completion: 'manual',
    });
    expect(vi.mocked(fetch).mock.calls[1][1]).toMatchObject({
      method: 'POST', credentials: 'include', headers: { 'X-CSRF-TOKEN': 'token' },
    });
  });

  it('keeps approval in a new tab without a callback redirect', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ authenticated: false, csrfToken: 'token' }))
      .mockResolvedValueOnce(json({
        approvalUrl: 'https://www.themoviedb.org/authenticate/request-token?redirect_to=https%3A%2F%2Fexample.test%2Fapi%2FAuth%2Fcallback',
        completion: 'redirect',
      }));
    await expect(session.startTmdbLogin()).resolves.toEqual({
      approvalUrl: 'https://www.themoviedb.org/authenticate/request-token', completion: 'manual',
    });
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('rejects a foreign approval URL', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ authenticated: false, csrfToken: 'token' }))
      .mockResolvedValueOnce(json({ approvalUrl: 'https://example.test/authenticate/request-token' }));
    await expect(session.startTmdbLogin()).rejects.toThrow('invalid TMDB approval link');
  });

  it('reports pending, completed, and expired TMDB approvals', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 409 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status: 400 }));
    await expect(session.completeTmdbLogin()).resolves.toBe(false);
    await expect(session.completeTmdbLogin()).resolves.toBe(true);
    await expect(session.completeTmdbLogin()).rejects.toThrow('expired');
    expect(fetch).toHaveBeenCalledWith('/api/Auth/complete', expect.objectContaining({
      method: 'POST', credentials: 'include',
    }));
  });

  it('does not clear local login after a failed logout request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({
      authenticated: true, account: { id: 42, username: 'test-user' }, csrfToken: 'token',
    })).mockResolvedValueOnce(json({}, 503));
    await session.initializeSession();
    await expect(session.logoutFromTmdb()).rejects.toThrow('logout failed');
    expect(session.getAccountId()).toBe(42);
  });

  it('clears local identity only after TMDB logout succeeds', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({
      authenticated: true, account: { id: 42, username: 'test-user' }, csrfToken: 'token',
    })).mockResolvedValueOnce(json({ success: true }));
    await session.initializeSession();
    await session.logoutFromTmdb();
    expect(session.getAccountId()).toBeNull();
    expect(vi.mocked(fetch).mock.calls[1][1]).toMatchObject({
      method: 'POST', credentials: 'include',
      headers: { 'X-TMDB-Account-Id': '42', 'X-CSRF-TOKEN': 'token' },
    });

  });

  it('clears local identity when the API confirms local logout but TMDB revocation failed', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({
      authenticated: true, account: { id: 42, username: 'test-user' }, csrfToken: 'token',
    })).mockResolvedValueOnce(json({}, 502));
    await session.initializeSession();
    expect(await session.logoutFromTmdb()).toBe(false);
    expect(session.getAccountId()).toBeNull();
  });
});
