// Minimal service worker — exists mainly to satisfy PWA installability
// requirements (needed for PWABuilder to package this as an APK). Caches
// the app shell so the last-loaded version opens even with a flaky
// connection; it does NOT cache live market data or Firestore data.

const CACHE_NAME = 'alphanxt-shell-v1';
const APP_SHELL = ['/', '/manifest.json', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Network-first for everything — this app is data-driven (Firestore,
  // live prices), so stale cached responses would be actively misleading.
  // The cache here only exists as a last-resort fallback if the network
  // request fails outright (e.g. brief connectivity drop).
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
