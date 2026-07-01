const CACHE_NAME = 'x0gpt-v5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './nlp.js',
  './api.js',
  './engine.js',
  './app.js',
  './knowledge.json',
  './survival.json',
  './manifest.json'
];

/* ═══════════════════════════════════════════
   INSTALL — Cache all assets
   ═══════════════════════════════════════════ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          ASSETS.map(url => cache.add(url).catch(() => {
            console.warn('Failed to cache:', url);
          }))
        );
      })
      .then(() => self.skipWaiting())
  );
});

/* ═══════════════════════════════════════════
   ACTIVATE — Clean old caches
   ═══════════════════════════════════════════ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

/* ═══════════════════════════════════════════
   FETCH — Network-first for API, cache-first for assets
   ═══════════════════════════════════════════ */
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // API calls: Network first, cache fallback
  if (url.hostname === 'api.duckduckgo.com' || url.hostname.includes('wikipedia.org')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, clone);
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Local assets: Cache first, network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        return fetch(event.request)
          .then(response => {
            if (response.ok && url.origin === location.origin) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

/* ═══════════════════════════════════════════
   MESSAGE — Handle cache invalidation
   ═══════════════════════════════════════════ */
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  if (event.data === 'clearCache') {
    caches.delete(CACHE_NAME);
  }
});
