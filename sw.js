/**
 * Gomoku 3D - Service Worker
 * Offline caching for PWA
 */

const CACHE_NAME = 'gomoku-3d-v6';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/themes.js',
  './js/game-engine.js',
  './js/ai-engine.js',
  './js/ai-tutor.js',
  './js/ai-worker.js',
  './js/render-engine.js',
  './js/sound.js',
  './js/game-history.js',
  './js/network.js',
  './js/app.js',
  './manifest.json',
  // External CDN resources (best-effort cache)
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
  'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('Cache addAll error (some resources may fail):', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip WebSocket upgrade
  if (request.headers.get('upgrade') === 'websocket') return;

  const url = new URL(request.url);

  // Same-origin: cache-first
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          // Update cache in background
          fetch(request).then(response => {
            if (response.ok) {
              caches.open(CACHE_NAME).then(cache => cache.put(request, response));
            }
          }).catch(() => {});
          return cached;
        }
        return fetch(request).then(response => {
          if (response.ok && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => {
          // Offline fallback
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
    );
    return;
  }

  // Cross-origin (CDN): stale-while-revalidate
  if (url.origin === 'https://cdnjs.cloudflare.com' ||
      url.origin === 'https://cdn.jsdelivr.net' ||
      url.origin === 'https://unpkg.com') {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }
});
