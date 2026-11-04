import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDBFactory } from 'fake-indexeddb';
import type { AccountListsResponse, AccountStatesResponse, ListDetailsResponse, MovieListResponse } from '../types/media';
import { cacheContent, cacheLimit, readOfflineData, writeOfflineData } from './offlineStore';
import { tmdbDetailsCacheProjection } from './tmdbCache';

const origin = 'https://movie-library.test|account:1';
const identity = vi.hoisted(() => ({ id: 1 as number | null }));
vi.mock('./session', () => ({
  getAccountId: () => identity.id,
  assertAccount: (id: number | null) => {
    if (id !== identity.id) throw new Error('The signed-in account changed.');
  },
  sessionHeaders: () => identity.id === null ? {} : { 'X-TMDB-Account-Id': String(identity.id), 'X-CSRF-TOKEN': 'test-csrf' },
  expireSession: () => { identity.id = null; },
}));
let online = true;
let api: typeof import('./api');
const movie = {
  id: 42, title: 'Cached movie', original_title: 'Cached movie', overview: 'Overview',
  poster_path: '/poster.jpg', backdrop_path: null, release_date: '2026-01-01',
  original_language: 'en', vote_average: 8, vote_count: 100, popularity: 10,
  video: false, genre_ids: [],
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json' },
});
const success = { success: true, status_code: 1 };

beforeEach(async () => {
  vi.restoreAllMocks();
  vi.resetModules();
  online = true;
  identity.id = 1;
  vi.stubGlobal('indexedDB', new IDBFactory());
  let lock = Promise.resolve();
  vi.stubGlobal('navigator', {
    get onLine() { return online; },
    locks: {
      request: <T>(_name: string, action: () => Promise<T>) => {
        const result = lock.then(action);
        lock = result.then(() => undefined, () => undefined);
        return result;
      },
    },
  });
  vi.stubGlobal('window', { location: { origin: 'https://movie-library.test' }, addEventListener: vi.fn(), setInterval: vi.fn() });
  vi.stubGlobal('fetch', vi.fn());
  api = await import('./api');
});

describe('persistent offline reads', () => {
  it('never returns another account snapshot or projects its pending edits', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ page: 1, results: [movie] }));
    await api.apiGet('/api/Account/watchlist/movies');
    online = false;
    await api.apiPost('/api/Account/watchlist', { media_id: 43, media_type: 'movie', watchlist: true });
    identity.id = 2;
    await expect(api.apiGet('/api/Account/watchlist/movies')).rejects.toThrow('has not been saved');
    expect(await api.syncOfflineChanges()).toEqual(new Map());
    expect((await readOfflineData(origin)).queue).toHaveLength(1);
    identity.id = 1;
    await expect(api.apiGet('/api/Account/watchlist/movies')).resolves.toMatchObject({
      results: expect.arrayContaining([expect.objectContaining({ id: 42 })]),
    });
  });

  it('does not send another account queue after a cookie/session mismatch', async () => {
    online = false;
    await api.apiPost('/api/Account/favorite', { media_id: 42, media_type: 'movie', favorite: true });
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json({}, 403));
    await api.syncOfflineChanges();
    expect(identity.id).toBeNull();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch).mock.calls[0][1]).toMatchObject({
      credentials: 'include', headers: expect.objectContaining({ 'X-TMDB-Account-Id': '1' }),
    });
    expect((await readOfflineData(origin)).queue).toHaveLength(1);
  });

  it('blocks anonymous private reads and writes before fetching or queuing', async () => {
    identity.id = null;
    await expect(api.apiGet('/api/Lists/42/details')).rejects.toThrow('Log in with TMDB');
    await expect(api.apiPost('/api/Lists', { name: 'Private' })).rejects.toThrow('Log in with TMDB');
    await api.syncOfflineChanges();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('clears only the logging-out account cache and edits', async () => {
    online = false;
    await api.apiPost('/api/Lists', { name: 'Account one' });
    identity.id = 2;
    await api.apiPost('/api/Lists', { name: 'Account two' });
    await api.clearAccountOfflineData(1);
    expect((await readOfflineData(origin)).queue).toEqual([]);
    expect((await readOfflineData('https://movie-library.test|account:2')).queue).toHaveLength(1);
  });

  it('quarantines legacy unowned snapshots and queues', async () => {
    const data = await readOfflineData('https://movie-library.test');
    cacheContent(data, '/api/Account/lists?page=1', { results: [{ id: 22, name: 'Old shared list' }] });
    data.queue.push({
      id: 'legacy', method: 'DELETE', path: '/api/Lists/22', state: 'pending',
    });
    await writeOfflineData('https://movie-library.test', data);
    await api.syncOfflineChanges();
    expect(fetch).not.toHaveBeenCalled();
    online = false;
    await expect(api.apiGet('/api/Account/lists?page=1')).rejects.toThrow('has not been saved');
  });

  it('rejects a private response if the local account changed while it was in flight', async () => {
    let finish: ((response: Response) => void) | undefined;
    let started: (() => void) | undefined;
    const requestStarted = new Promise<void>((resolve) => { started = resolve; });
    vi.mocked(fetch).mockImplementationOnce(() => {
      started?.();
      return new Promise<Response>((resolve) => { finish = resolve; });
    });
    const pending = api.apiGet('/api/Account/lists?page=1');
    const rejected = expect(pending).rejects.toThrow('account changed');
    await requestStarted;
    identity.id = 2;
    finish?.(json({ results: [{ id: 22, name: 'Private account one' }] }));
    await rejected;
    expect((await readOfflineData('https://movie-library.test|account:2')).cache).toEqual({});
  });

  it('returns extended details online and persists the compact core for offline refresh', async () => {
    const extended = {
      ...movie, credits: { cast: [{ id: 8, name: 'Actor' }] },
      recommendations: { results: [movie] }, videos: { results: [] },
    };
    vi.mocked(fetch).mockResolvedValueOnce(json(extended));
    const path = '/api/Movie/42';
    expect(await api.apiGet(path, tmdbDetailsCacheProjection(path))).toEqual(extended);
    vi.resetModules();
    api = await import('./api');
    online = false;
    expect(await api.apiGet(path, tmdbDetailsCacheProjection(path))).toEqual(movie);
  });

  it('uses the network first, persists across module reloads, and falls back on disconnect', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json(movie)).mockResolvedValueOnce(json({ ...movie, title: 'Updated' }));
    expect(await api.apiGet('/api/Movie/42')).toEqual(movie);
    expect(await api.apiGet('/api/Movie/42')).toMatchObject({ title: 'Updated' });
    vi.resetModules();
    api = await import('./api');
    online = false;
    expect(await api.apiGet('/api/Movie/42')).toMatchObject({ title: 'Updated' });
    expect(api.getOfflineStatus()).toMatchObject({ offline: true, cached: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it('handles API-only disconnects and timeouts with cached data', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json(movie));
    await api.apiGet('/api/Movie/42');
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));
    expect(await api.apiGet('/api/Movie/42')).toEqual(movie);
    vi.mocked(fetch).mockRejectedValueOnce(new DOMException('Timed out', 'TimeoutError'));
    expect(await api.apiGet('/api/Movie/42')).toEqual(movie);
    vi.mocked(fetch).mockResolvedValueOnce(json({}, 503));
    expect(await api.apiGet('/api/Movie/42')).toEqual(movie);
  });

  it('reports an uncached request instead of inventing an empty result', async () => {
    online = false;
    await expect(api.apiGet('/api/Movie/999')).rejects.toThrow('has not been saved');
  });

  it.each([401, 403, 404, 400])('does not hide HTTP %i with a cached result', async (code) => {
    vi.mocked(fetch).mockResolvedValueOnce(json(movie)).mockResolvedValueOnce(json({}, code));
    await api.apiGet('/api/Movie/42');
    await expect(api.apiGet('/api/Movie/42')).rejects.toThrow(`(${code})`);
  });

  it('bounds cache entries and isolates API scopes', async () => {
    const data = await readOfflineData(origin);
    for (let index = 0; index <= cacheLimit; index++) cacheContent(data, `/api/Movie/${index}`, { index });
    expect(Object.keys(data.cache)).toHaveLength(cacheLimit);
    await writeOfflineData(origin, data);
    expect((await readOfflineData('https://another-api.test')).cache).toEqual({});
  });

  it('reports unavailable storage while preserving online reads', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('indexedDB', undefined);
    vi.mocked(fetch).mockResolvedValueOnce(json(movie));
    expect(await api.apiGet('/api/Movie/42')).toEqual(movie);
    expect(api.getOfflineStatus().error).not.toBeNull();
    await expect(api.apiPost('/api/Account/favorite', {})).rejects.toThrow();
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});

describe('durable edits and replay', () => {
  async function seedLibrary() {
    const data = await readOfflineData(origin);
    cacheContent(data, '/api/Movie/42', movie);
    cacheContent(data, '/api/Movie/42/account-states', { id: 42, favorite: false, watchlist: false, rated: null });
    cacheContent(data, '/api/Account/lists?page=1', { page: 1, results: [], total_pages: 0, total_results: 0 });
    cacheContent(data, '/api/Account/watchlist/movies', { page: 1, results: [], total_pages: 0, total_results: 0 });
    await writeOfflineData(origin, data);
  }

  it('queues explicit pending receipts and projects watchlist/favorite/rating after reload', async () => {
    await seedLibrary();
    online = false;
    expect(await api.apiPost('/api/Account/watchlist', { media_type: 'movie', media_id: 42, watchlist: true }))
      .toMatchObject({ queued: true, status_message: expect.stringContaining('not yet saved') });
    await api.apiPost('/api/Account/favorite', { media_type: 'movie', media_id: 42, favorite: true });
    await api.apiPost('/api/Movie/42/rating', { value: 9 });
    vi.resetModules();
    api = await import('./api');
    expect(await api.apiGet<AccountStatesResponse>('/api/Movie/42/account-states'))
      .toMatchObject({ favorite: true, watchlist: true, rated: { value: 9 } });
    expect((await api.apiGet<MovieListResponse>('/api/Account/watchlist/movies')).results).toEqual([movie]);
    expect(fetch).not.toHaveBeenCalled();
    expect((await readOfflineData(origin)).queue).toHaveLength(3);
    await api.apiDelete('/api/Movie/42/rating');
    expect((await api.apiGet<AccountStatesResponse>('/api/Movie/42/account-states')).rated).toBeNull();
  });

  it('synchronizes in order, commits local snapshots, and removes only acknowledged edits', async () => {
    await seedLibrary();
    online = false;
    await api.apiPost('/api/Account/watchlist', { media_type: 'movie', media_id: 42, watchlist: true });
    await api.apiPost('/api/Account/watchlist', { media_type: 'movie', media_id: 42, watchlist: false });
    online = true;
    vi.mocked(fetch).mockImplementation(async () => json(success));
    await Promise.all([api.syncOfflineChanges(), api.syncOfflineChanges()]);
    expect(vi.mocked(fetch).mock.calls.map((call) => JSON.parse(String(call[1]?.body)).watchlist)).toEqual([true, false]);
    expect((await readOfflineData(origin)).queue).toHaveLength(0);
    online = false;
    expect((await api.apiGet<AccountStatesResponse>('/api/Movie/42/account-states')).watchlist).toBe(false);
  });

  it('creates offline lists, resolves dependent edits and old routes to real IDs', async () => {
    await seedLibrary();
    online = false;
    const created = await api.apiPost('/api/Lists', { name: 'Offline list', description: 'Local' });
    expect(created.list_id).toBe(-1);
    await api.apiPost(`/api/Lists/${created.list_id}/add_movie`, movie.id);
    expect((await api.apiGet<AccountListsResponse>('/api/Account/lists?page=1')).results)
      .toMatchObject([{ id: -1, name: 'Offline list', item_count: 1 }]);
    expect((await api.apiGet<ListDetailsResponse>('/api/Lists/-1/details')).items).toEqual([movie]);
    expect(await api.apiGet('/api/Lists/-1/item_status?media_type=movie&media_id=42'))
      .toEqual({ id: -1, item_present: true });
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy'))
      .mockResolvedValueOnce(json({ ...success, list_id: 72 })).mockResolvedValueOnce(json(success));
    await api.syncOfflineChanges();
    expect(vi.mocked(fetch).mock.calls[2]).toMatchObject(['/api/Lists/72/add_movie', { body: '42' }]);
    online = false;
    expect((await api.apiGet<ListDetailsResponse>('/api/Lists/-1/details')).id).toBe(72);
    expect((await api.apiGet<ListDetailsResponse>('/api/Lists/72/details')).items).toEqual([movie]);
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });

  it('does not silently retry an uncertain create after a lost response or reload', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Connection lost'));
    const result = await api.apiPost('/api/Lists', { name: 'Possibly created' });
    expect(result.queued).toBe(true);
    vi.resetModules();
    api = await import('./api');
    await api.syncOfflineChanges();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(api.getOfflineStatus().needsConfirmation).toBe(true);
    vi.mocked(fetch).mockResolvedValueOnce(json({ ...success, list_id: 88 }));
    await api.syncOfflineChanges(true);
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });

  it('blocks rejected writes and preserves dependent edits without automatic retries', async () => {
    online = false;
    await api.apiPost('/api/Lists', { name: 'New list' });
    await api.apiPost('/api/Lists/-1/add_movie', 42);
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json({}, 401));
    await api.syncOfflineChanges();
    await api.syncOfflineChanges();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect((await readOfflineData(origin)).queue).toHaveLength(2);
    expect(api.getOfflineStatus().error).toContain('session changed or expired');
    expect(identity.id).toBeNull();
    identity.id = 1;
    await api.discardPendingChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });

  it('treats a 200 response with success=false as a rejected edit', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({ success: false, status_message: 'Rejected' }));
    await expect(api.apiPost('/api/Movie/42/rating', { value: 100 })).rejects.toThrow('Rejected');
    expect((await readOfflineData(origin)).queue[0].state).toBe('blocked');
  });

  it('retains the sending record if durable acknowledgement fails', async () => {
    online = false;
    await api.apiPost('/api/Lists', { name: 'Create once' });
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json({ ...success, list_id: 99 }));
    const store = await import('./offlineStore');
    const originalWrite = store.writeOfflineData;
    const write = vi.spyOn(store, 'writeOfflineData');
    write.mockImplementationOnce(originalWrite).mockRejectedValueOnce(new Error('Disk full'));
    await expect(api.syncOfflineChanges()).rejects.toThrow('Disk full');
    write.mockRestore();
    expect((await readOfflineData(origin)).queue[0].state).toBe('sending');
    await api.syncOfflineChanges();
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('does not advertise a queued deletion as available offline content', async () => {
    const data = await readOfflineData(origin);
    cacheContent(data, '/api/Lists/1/details', { id: 1, name: 'Old', items: [], item_count: 0 });
    await writeOfflineData(origin, data);
    online = false;
    await api.apiDelete('/api/Lists/1');
    await expect(api.apiGet('/api/Lists/1/details')).rejects.toThrow('deleted on this device');
  });

  it('does not overwrite acknowledged edits with a GET that started before the edit', async () => {
    await seedLibrary();
    let respond!: (value: Response) => void;
    const response = new Promise<Response>((resolve) => { respond = resolve; });
    vi.mocked(fetch).mockImplementationOnce(() => response);
    const read = api.apiGet<AccountStatesResponse>('/api/Movie/42/account-states');
    await vi.waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    vi.mocked(fetch).mockResolvedValueOnce(json(success));
    await api.apiPost('/api/Account/favorite', { media_type: 'movie', media_id: 42, favorite: true });
    respond(json({ id: 42, favorite: false, watchlist: false, rated: null }));
    expect((await read).favorite).toBe(true);
  });

  it('enforces the 100 pending edit limit without losing earlier edits', async () => {
    const data = await readOfflineData(origin);
    data.queue = Array.from({ length: 100 }, (_, id) => ({
      id: String(id), path: '/api/Movie/42/rating', method: 'POST', body: { value: 8 }, state: 'pending',
    }));
    await writeOfflineData(origin, data);
    online = false;
    await expect(api.apiPost('/api/Movie/42/rating', { value: 9 })).rejects.toThrow('at most 100 edits');
    expect((await readOfflineData(origin)).queue).toHaveLength(100);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('probes known API outages before sending queued edits, then resumes when healthy', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    await seedLibrary();
    vi.mocked(fetch).mockRejectedValue(new TypeError('API disconnected'));
    await api.apiGet('/api/Movie/42');
    expect((await api.apiPost('/api/Lists', { name: 'Wait for connection' })).queued).toBe(true);
    expect(vi.mocked(fetch).mock.calls.map(([url]) => url)).toEqual(['/api/Movie/42', '/health']);
    expect((await readOfflineData(origin)).queue[0].state).toBe('pending');
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy')).mockResolvedValueOnce(json({ ...success, list_id: 11 }));
    await api.syncOfflineChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });

  it('replays idempotent account edits automatically after an interrupted send', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Lost response'));
    expect((await api.apiPost('/api/Account/favorite', { media_type: 'movie', media_id: 42, favorite: true })).queued)
      .toBe(true);
    expect(api.getOfflineStatus().needsConfirmation).toBe(false);
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy')).mockResolvedValueOnce(json(success));
    await api.syncOfflineChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });

  it('does not project server-rejected ratings into saved account state', async () => {
    await seedLibrary();
    vi.mocked(fetch).mockResolvedValueOnce(json({ success: false, status_message: 'Invalid rating' }));
    await expect(api.apiPost('/api/Movie/42/rating', { value: 100 })).rejects.toThrow('Invalid rating');
    online = false;
    expect((await api.apiGet<AccountStatesResponse>('/api/Movie/42/account-states')).rated).toBeNull();
  });

  it('saves list metadata and membership as one durable batch without recreating the list', async () => {
    const data = await readOfflineData(origin);
    cacheContent(data, '/api/Movie/42', movie);
    cacheContent(data, '/api/Lists/7/details', {
      id: 7, name: 'Original', description: '', items: [{ ...movie, id: 41 }], item_count: 1,
    });

    await writeOfflineData(origin, data);
    online = false;
    const results = await api.apiUpdateList(7, { name: 'Updated', description: 'Offline', language: 'en' }, [41], [42]);
    expect(results).toHaveLength(3);
    expect(results.every((result) => result.queued)).toBe(true);
    const queued = (await readOfflineData(origin)).queue;
    expect(queued.map(({ method, path }) => [method, path])).toEqual([
      ['PUT', '/api/Lists/7'], ['POST', '/api/Lists/7/remove_movie'], ['POST', '/api/Lists/7/add_movie'],
    ]);
    expect(await api.apiGet('/api/Lists/7/details')).toMatchObject({
      id: 7, name: 'Updated', description: 'Offline', items: [{ id: 42 }], item_count: 1,
    });
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy')).mockImplementation(async () => json(success));
    await api.syncOfflineChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
    expect(vi.mocked(fetch).mock.calls.map(([url, init]) => [url, init?.method])).toEqual([
      ['/health', undefined], ['/api/Lists/7', 'PUT'], ['/api/Lists/7/remove_movie', 'POST'], ['/api/Lists/7/add_movie', 'POST'],
    ]);
  });

  it('persists tags and movie order across offline edits, additions, and queue replay', async () => {
    const data = await readOfflineData(origin);
    cacheContent(data, '/api/Account/lists?page=1', {
      page: 1, total_pages: 1, total_results: 1,
      results: [{ id: 7, name: 'Original', description: '', tags: [], item_count: 1 }],
    });
    cacheContent(data, '/api/Movie/42', movie);
    cacheContent(data, '/api/Lists/7/details', {
      id: 7, name: 'Original', description: '', tags: [], items: [{ ...movie, id: 41 }], item_count: 1,
    });
    await writeOfflineData(origin, data);
    online = false;
    await api.apiUpdateList(7, { name: 'Ordered', description: '', language: 'en', tags: ['Weekend'] }, [41], [42, 41]);
    expect(await api.apiGet('/api/Lists/7/details')).toMatchObject({
      tags: ['Weekend'], movie_order: [42, 41], items: [{ id: 42 }, { id: 41 }],
    });
    expect(await api.apiGet('/api/Account/lists?page=1')).toMatchObject({
      results: [{ id: 7, tags: ['Weekend'] }],
    });
    const queued = (await readOfflineData(origin)).queue;
    expect(queued[0].body).toMatchObject({ tags: ['Weekend'], movie_order: [42, 41] });
    online = true;
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy')).mockImplementation(async () => json(success));
    await api.syncOfflineChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
    online = false;
    expect(await api.apiGet('/api/Lists/7/details')).toMatchObject({
      tags: ['Weekend'], items: [{ id: 42 }, { id: 41 }],
    });
    expect(await api.apiGet('/api/Account/lists?page=1')).toMatchObject({
      results: [{ id: 7, tags: ['Weekend'] }],
    });
  });

  it('preserves omitted summary tags and allows clearing them without cached list details', async () => {
    const data = await readOfflineData(origin);
    cacheContent(data, '/api/Account/lists?page=2', {
      page: 2, total_pages: 2, total_results: 21,
      results: [{ id: 7, name: 'Original', description: '', tags: ['Weekend'], item_count: 0 }],
    });
    await writeOfflineData(origin, data);
    online = false;
    await api.apiUpdateList(7, { name: 'Renamed', description: '', language: 'en' }, [], []);
    expect(await api.apiGet('/api/Account/lists?page=2')).toMatchObject({
      results: [{ id: 7, tags: ['Weekend'] }],
    });
    await api.apiUpdateList(7, { name: 'Renamed', description: '', language: 'en', tags: [] }, [], []);
    expect(await api.apiGet('/api/Account/lists?page=2')).toMatchObject({
      results: [{ id: 7, tags: [] }],
    });
  });

  it('does not enqueue a partial list edit when the durable queue is full', async () => {
    const data = await readOfflineData(origin);
    data.queue = Array.from({ length: 99 }, (_, id) => ({
      id: String(id), path: '/api/Movie/42/rating', method: 'POST', body: { value: 8 }, state: 'pending',
    }));
    await writeOfflineData(origin, data);
    online = false;
    await expect(api.apiUpdateList(7, { name: 'Updated', description: null, language: 'en' }, [41], [42]))
      .rejects.toThrow('at most 100 edits');
    expect((await readOfflineData(origin)).queue).toHaveLength(99);
  });

  it('retries idempotent edits after a temporary server error without user confirmation', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(json({}, 503));
    expect(await api.apiPost('/api/Account/watchlist', { media_type: 'movie', media_id: 42, watchlist: true }))
      .toMatchObject({ queued: true });
    expect(api.getOfflineStatus()).toMatchObject({ needsConfirmation: false, offline: true });
    vi.mocked(fetch).mockResolvedValueOnce(json('Healthy')).mockResolvedValueOnce(json(success));
    await api.syncOfflineChanges();
    expect((await readOfflineData(origin)).queue).toEqual([]);
  });
});
