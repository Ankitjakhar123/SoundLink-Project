// This is the service worker file for SoundLink PWA

// Cache names
const STATIC_CACHE_NAME = 'soundlink-static-v1';
const MUSIC_CACHE_NAME = 'soundlink-music-v1';
const IMAGES_CACHE_NAME = 'soundlink-images-v1';

// Static assets to cache
const staticAssetsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/soundlink-icon.svg',
  '/icons/icon-72x72.svg',
  '/icons/icon-96x96.svg',
  '/icons/icon-128x128.svg',
  '/icons/icon-144x144.svg',
  '/icons/icon-152x152.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-384x384.svg',
  '/icons/icon-512x512.svg',
  '/assets/default-album.png',
  '/assets/default-artist.png',
  '/assets/default-avatar.svg'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(staticAssetsToCache);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => {
          return cacheName.startsWith('soundlink-') && 
                 cacheName !== STATIC_CACHE_NAME &&
                 cacheName !== MUSIC_CACHE_NAME &&
                 cacheName !== IMAGES_CACHE_NAME;
        }).map((cacheName) => {
          console.log('[Service Worker] Removing old cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    })
  );
  // Ensure the service worker takes control right away
  return self.clients.claim();
});

// Fetch event with improved caching strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 1. Handle API requests - don't cache but provide fallback for offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Return a custom offline message for API requests
          if (event.request.method === 'GET') {
            return new Response(JSON.stringify({
              success: false,
              message: 'You are currently offline. Please check your connection.'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          }
        })
    );
    return;
  }
  
  // 2. Cache music files with a dedicated cache
  if (url.pathname.includes('.mp3') || url.pathname.includes('/audio/')) {
    event.respondWith(
      caches.open(MUSIC_CACHE_NAME)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              // Return cached response if available
              if (response) {
                return response;
              }
              
              // Fetch and cache music file if online
              return fetch(event.request)
                .then(networkResponse => {
                  // Cache copy of the response
                  cache.put(event.request, networkResponse.clone());
                  return networkResponse;
                })
                .catch(() => {
                  // Provide a fallback silent audio file or error message
                  return new Response('No audio available offline', {
                    status: 503,
                    statusText: 'Service Unavailable'
                  });
                });
            });
        })
    );
    return;
  }
  
  // 3. Cache images with a dedicated cache
  if (
    url.pathname.includes('.jpg') || 
    url.pathname.includes('.jpeg') || 
    url.pathname.includes('.png') || 
    url.pathname.includes('.svg') || 
    url.pathname.includes('/images/') || 
    url.pathname.includes('/avatars/')
  ) {
    event.respondWith(
      caches.open(IMAGES_CACHE_NAME)
        .then(cache => {
          return cache.match(event.request)
            .then(response => {
              // Return cached image if available
              if (response) {
                return response;
              }
              
              // Fetch and cache image if online
              return fetch(event.request)
                .then(networkResponse => {
                  // Check if valid response
                  if (networkResponse.ok) {
                    // Cache copy of the response
                    cache.put(event.request, networkResponse.clone());
                  }
                  return networkResponse;
                })
                .catch(() => {
                  // Return appropriate fallback image based on URL pattern
                  if (url.pathname.includes('/avatars/')) {
                    return caches.match('/assets/default-avatar.svg');
                  } else if (url.pathname.includes('artist')) {
                    return caches.match('/assets/default-artist.png');
                  } else {
                    return caches.match('/assets/default-album.png');
                  }
                });
            });
        })
    );
    return;
  }
  
  // 4. Default strategy for other assets (Static cache first, then network)
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response
        if (response) {
          return response;
        }
        
        // Clone the request
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest)
          .then((networkResponse) => {
            // Check if valid response to cache
            if (
              !networkResponse || 
              networkResponse.status !== 200 || 
              networkResponse.type !== 'basic'
            ) {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache the response for future
            caches.open(STATIC_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(() => {
            // If not found in cache and network fails, return fallback HTML
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            return new Response('Network error happened', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Handle background sync for pending operations
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background Syncing', event.tag);
  
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

// Helper function to sync pending favorites operations
function syncFavorites() {
  // This would be implemented to retrieve pending operations from IndexedDB
  // and send them to the server when online
  console.log('[Service Worker] Syncing favorites...');
  return Promise.resolve();
} 