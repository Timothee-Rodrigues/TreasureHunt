const CACHE_NAME = 'treasure-hunt-v5';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './clues.json',
  './config.json',
  './dist/app.js',
  './dist/types.js',
  './dist/storage.js',
  './dist/geolocation.js',
  './dist/sync.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

/**
 * Install event - cache all assets
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching assets');
        // Try to cache all assets, but don't fail if we're running locally (file://)
        return cache.addAll(ASSETS).catch((error) => {
          console.warn('Service Worker: Could not cache all assets (may be running locally):', error);
          // Continue anyway - the app can still work offline with localStorage
        });
      })
      .then(() => {
        console.log('Service Worker: Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Service Worker: Installation error:', error);
      })
  );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cache);
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated successfully');
        return self.clients.claim(); // Take control immediately
      })
  );
});

/**
 * Fetch event - serve from cache first, fallback to network
 */
self.addEventListener('fetch', (event) => {
  // Skip caching for non-HTTP(S) requests (e.g., file://)
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return cached response
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }
        
        // Cache miss - fetch from network
        console.log('Service Worker: Fetching from network', event.request.url);
        return fetch(event.request)
          .then((networkResponse) => {
            // Don't cache non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response (can only be consumed once)
            const responseToCache = networkResponse.clone();
            
            // Cache the fetched response for future use
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', error);
            // Could return a custom offline page here
            throw error;
          });
      })
  );
});
