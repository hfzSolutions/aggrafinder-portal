const CACHE_NAME = 'deeplistai-v1';
const MANIFEST_CACHE = 'deeplistai-manifests-v1';

// Basic service worker for PWA functionality
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installed');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== MANIFEST_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
    ])
  );
});

// Enhanced fetch handler for dynamic manifests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle dynamic manifest requests
  if (url.pathname.startsWith('/api/manifest/')) {
    event.respondWith(
      caches.open(MANIFEST_CACHE).then((cache) => {
        return fetch(event.request)
          .then((response) => {
            // Cache the manifest for quick access
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Return cached version if network fails
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  // Let the browser handle all other fetch requests normally
  return;
});
