/**
 * Gomoku 3D - Service Worker v9
 * Network-first strategy: always fetch fresh code, fallback to cache when offline
 */

const CACHE_NAME = 'gomoku-3d-v10';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/vendor/three.min.js',
  './js/vendor/OrbitControls.js',
  './js/vendor/peerjs.min.js',
  './js/themes.js',
  './js/game-engine.js',
  './js/ai-engine.js',
  './js/ai-tutor.js',
  './js/ai-worker.js',
  './js/render-engine.js',
  './js/sound.js',
  './js/game-history.js',
  './js/network.js',
  './js/pro-players.js',
  './js/player-data.js',
  './js/app.js',
  './manifest.json'
];

// Install - pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.log('SW: Some assets failed to cache:', err);
      });
    })
  );
  // Force immediate activation
  self.skipWaiting();
});

// Activate - purge ALL old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log('SW: Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch - network-first for everything (ensures fresh code)
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip WebSocket/PeerJS signaling
  if (request.headers.get('upgrade') === 'websocket') return;

  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    // Let cross-origin requests pass through normally
    return;
  }

  // Network-first: try network, fall back to cache
  event.respondWith(
    fetch(request).then((response) => {
      // Clone and cache successful responses
      if (response.ok && response.type === 'basic') {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(request, responseClone);
        });
      }
      return response;
    }).catch(() => {
      // Network failed (offline) - try cache
      return caches.match(request).then((cached) => {
        if (cached) return cached;
        // Final fallback for navigation requests
        if (request.destination === 'document') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
