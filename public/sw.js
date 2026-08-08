/* The Ascent Blueprint — offline-first service worker */
const CACHE = 'ascent-cache-v1';
// Relative paths: resolve against the SW scope, so this works on subpath
// deploys (e.g. GitHub Pages) as well as a domain root.
const BASE = new URL('.', self.location).href;
const p = (rel) => new URL(rel, BASE).href;
const PRECACHE = [
  p('./'),
  p('./index.html'),
  p('./manifest.webmanifest'),
  p('./favicon.svg'),
  p('./icons/icon-192.svg'),
  p('./icons/icon-512.svg'),
  p('./icons/maskable-512.svg'),
  p('./icons/icon-192.png'),
  p('./icons/icon-512.png'),
  p('./icons/maskable-512.png'),
  p('./icons/apple-touch-icon.png'),
];
const FALLBACK_INDEX = p('./index.html');

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // Never cache cross-origin (Google Fonts etc.)
  if (url.origin !== self.location.origin) {
    // Network-first for font/style assets so updates arrive, fallback cache.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // App shell / navigation: network-first, fallback to cached index.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(FALLBACK_INDEX, copy));
          return res;
        })
        .catch(() => caches.match(FALLBACK_INDEX))
    );
    return;
  }

  // Static assets: cache-first.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(request, copy));
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
