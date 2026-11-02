import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

const origin = 'https://movie-library.test';
const assets = [`${origin}/index.html`, `${origin}/assets/app.js`, `${origin}/assets/app.css`];

function worker() {
  const contents = new Map<string, Map<string, Response>>();
  const match = vi.fn(async (request: Request | string, options: { cacheName: string; ignoreVary?: boolean }) => {
    // Model a server's Vary: Origin header differing between install and module requests.
    if (!options.ignoreVary) return undefined;
    return contents.get(options.cacheName)?.get(typeof request === 'string' ? request : request.url)?.clone();
  });
  const addAll = vi.fn();
  const cacheStorage = {
    keys: async () => [...contents.keys()],
    delete: async (name: string) => contents.delete(name),
    match,
    open: async (name: string) => {
      if (!contents.has(name)) contents.set(name, new Map());
      const entries = contents.get(name)!;
      return {
        addAll,
        put: async (request: Request, response: Response) => { entries.set(request.url, response); },
        keys: async () => [...entries.keys()].map((url) => new Request(url)),
        delete: async (request: Request) => entries.delete(request.url),
      };
    },
  };
  type WorkerEvent = {
    request: Request;
    data?: { type: string; urls: string[] };
    waitUntil: (promise: Promise<unknown>) => void;
    respondWith: (response: Promise<Response>) => void;
  };
  const handlers: Record<string, (event: WorkerEvent) => void> = {};
  const fetch = vi.fn(async () => new Response('network'));
  const claim = vi.fn();
  const source = readFileSync(new URL('./offline-worker.js', import.meta.url), 'utf8')
    .replace('__VERSION__', 'test')
    .replace('__PRECACHE__', JSON.stringify(assets));
  runInNewContext(source, {
    URL, Request, Response, caches: cacheStorage, fetch, console,
    self: {
      registration: { scope: `${origin}/` }, location: { origin },
      clients: { claim, matchAll: async () => [] },
      addEventListener: (type: string, handler: (event: WorkerEvent) => void) => { handlers[type] = handler; },
    },
  });
  const dispatch = async (type: string, request = new Request(`${origin}/`)) => {
    let response: Promise<Response> | undefined;
    const tasks: Promise<unknown>[] = [];
    handlers[type]({
      request, waitUntil: (promise) => { tasks.push(promise); },
      respondWith: (promise) => { response = promise; },
    });
    const result = await response;
    await Promise.all(tasks);
    return result;
  };
  return { contents, match, addAll, fetch, claim, dispatch };
}

describe('production service worker', () => {
  it('precaches the complete shell and retires only its own old builds', async () => {
    const service = worker();
    service.contents.set('movie-library-shell-old', new Map());
    service.contents.set('unrelated-cache', new Map());
    await service.dispatch('install');
    expect(service.addAll).toHaveBeenCalledWith(assets);
    await service.dispatch('activate');
    expect(service.contents.has('movie-library-shell-old')).toBe(false);
    expect(service.contents.has('unrelated-cache')).toBe(true);
    expect(service.claim).toHaveBeenCalledOnce();
  });

  it('serves hashed modules offline despite differing Vary headers', async () => {
    const service = worker();
    service.contents.set('movie-library-shell-test', new Map([[assets[1], new Response('cached module')]]));
    service.fetch.mockRejectedValue(new TypeError('Offline'));
    const response = await service.dispatch('fetch', new Request(assets[1]));
    expect(await response?.text()).toBe('cached module');
    expect(service.fetch).not.toHaveBeenCalled();
    expect(service.match).toHaveBeenCalledWith(expect.any(Request), expect.objectContaining({ ignoreVary: true }));
  });

  it('serves the shell for offline deep links and never intercepts APIs', async () => {
    const service = worker();
    service.contents.set('movie-library-shell-test', new Map([[assets[0], new Response('cached shell')]]));
    service.fetch.mockRejectedValue(new TypeError('Offline'));
    const navigation = new Request(`${origin}/movie/42`);
    Object.defineProperty(navigation, 'mode', { value: 'navigate' });
    expect(await (await service.dispatch('fetch', navigation))?.text()).toBe('cached shell');
    expect(await service.dispatch('fetch', new Request(`${origin}/api/Movie/42`))).toBeUndefined();
  });

  it('bounds previously viewed images to 150 and serves them without the network', async () => {
    const service = worker();
    for (let id = 0; id < 151; id++) {
      await service.dispatch('fetch', new Request(`https://image.tmdb.org/t/p/w500/${id}.jpg`));
    }
    const images = service.contents.get('movie-library-images-v1')!;
    expect(images.size).toBe(150);
    expect(images.has('https://image.tmdb.org/t/p/w500/0.jpg')).toBe(false);
    service.fetch.mockRejectedValue(new TypeError('Offline'));
    expect(await (await service.dispatch('fetch', new Request('https://image.tmdb.org/t/p/w500/150.jpg')))?.text())
      .toBe('network');
    expect(service.fetch).toHaveBeenCalledTimes(151);
  });
});
