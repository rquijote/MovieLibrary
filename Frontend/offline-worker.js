const shellCache = 'movie-library-shell-__VERSION__';
const imageCache = 'movie-library-images-v1';
const precache = __PRECACHE__.map((path) => new URL(path, self.registration.scope).href);
const imageLimit = 150;
const shellUrl = new URL('index.html', self.registration.scope).href;

function isMediaImage(url) {
  return url.origin === 'https://image.tmdb.org' && url.pathname.startsWith('/t/p/');
}

async function reportError(error) {
  console.error('Offline cache:', error);
  const clients = await self.clients.matchAll();
  for (const client of clients) client.postMessage({ type: 'offline-cache-error', message: String(error) });
}

async function cacheImage(request, response) {
  const cache = await caches.open(imageCache);
  await cache.put(request, response);
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - imageLimit))) await cache.delete(key);
}

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(shellCache).then((cache) => cache.addAll(precache)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('movie-library-shell-') && key !== shellCache)
      .map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.pathname.startsWith('/api/') || url.pathname === '/health') return;

  if (isMediaImage(url)) {
    event.respondWith((async () => {
      const cached = await caches.match(request, { cacheName: imageCache, ignoreVary: true });
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok || response.type === 'opaque') {
        event.waitUntil(cacheImage(request, response.clone()).catch(reportError));
      }
      return response;
    })());
  } else if (url.origin === self.location.origin && request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        if (response.ok) return response;
        throw new Error(`Navigation failed (${response.status}).`);
      } catch {
        const shell = await caches.match(shellUrl, { cacheName: shellCache, ignoreVary: true });
        return shell ?? Response.error();
      }
    })());
  } else if (precache.includes(url.href)) {
    // Hashed, same-origin build assets are identical regardless of CORS request headers.
    event.respondWith(caches.match(request, { cacheName: shellCache, ignoreVary: true })
      .then((cached) => cached ?? fetch(request)));
  }
});

self.addEventListener('message', (event) => {
  if (event.data?.type !== 'cache-images' || !Array.isArray(event.data.urls)) return;
  event.waitUntil(Promise.all(event.data.urls.filter((url) => {
    try { return isMediaImage(new URL(url)); } catch { return false; }
  }).slice(-imageLimit).map(async (url) => {
    const request = new Request(url, { mode: 'no-cors' });
    if (await caches.match(request, { cacheName: imageCache, ignoreVary: true })) return;
    const response = await fetch(request);
    if (response.ok || response.type === 'opaque') await cacheImage(request, response);
  })).catch(reportError));
});
