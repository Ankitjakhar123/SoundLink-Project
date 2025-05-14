// SoundLink Service Worker for improved performance and offline capabilities
const CACHE_NAME = 'soundlink-cache-v1';

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/soundlink-icon-192.png',
  '/icons/soundlink-icon-512.png',
  '/offline.html', // Fallback page when offline
];

// Assets to cache on network request
const RUNTIME_CACHE_URLS = [
  // Images, fonts, and other static assets
  /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
  /\.(?:woff|woff2|ttf|otf)$/,
  
  // API endpoints that should be cached but prioritize network
  /\/api\/songs\/trending/,
  /\/api\/albums/,
  /\/api\/artists/,
];

// Install event - precache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Pre-caching assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => console.error('Pre-cache failed:', error))
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName));
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            console.log('Cleaning old cache:', cacheToDelete);
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - network-first strategy for API requests, cache-first for assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }
  
  // Special handling for API requests - network first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the successful response
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If it's an API request and we have no cache, fallback to offline content
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
  
  // Cache-first strategy for static assets
  const isAsset = RUNTIME_CACHE_URLS.some(pattern => 
    pattern instanceof RegExp ? pattern.test(url.pathname) : url.pathname === pattern
  );
  
  if (isAsset || PRECACHE_ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            // Found in cache, serve from there
            return cachedResponse;
          }
          
          // Not in cache, fetch from network and cache for next time
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200) {
                return response;
              }
              
              // Clone the response
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
                
              return response;
            })
            .catch(() => {
              // If fetch fails (offline), fall back to a generic offline page
              if (event.request.mode === 'navigate') {
                return caches.match('/offline.html');
              }
              return null;
            });
        })
    );
    return;
  }
  
  // Default strategy for everything else: Network first, falling back to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200) {
          return response;
        }
        
        // Clone the response to cache it
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
        return response;
      })
      .catch(() => {
        // If the network is unavailable, try the cache
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If it's a navigation request, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            
            return null;
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-playlist') {
    event.waitUntil(syncPlaylistChanges());
  } else if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavoritesChanges());
  }
});

// Handle background sync for playlist changes
async function syncPlaylistChanges() {
  try {
    const db = await openDB();
    const pendingChanges = await db.getAll('pendingPlaylistChanges');
    
    if (pendingChanges.length === 0) return;
    
    for (const change of pendingChanges) {
      try {
        const response = await fetch('/api/playlists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${change.token}`
          },
          body: JSON.stringify(change.data)
        });
        
        if (response.ok) {
          await db.delete('pendingPlaylistChanges', change.id);
        }
      } catch (error) {
        console.error('Failed to sync playlist change:', error);
      }
    }
  } catch (error) {
    console.error('Error during playlist sync:', error);
  }
}

// Handle background sync for favorites changes
async function syncFavoritesChanges() {
  // Similar implementation as syncPlaylistChanges
  console.log('Syncing favorites changes');
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SoundLinkOfflineDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('pendingPlaylistChanges')) {
        db.createObjectStore('pendingPlaylistChanges', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('pendingFavoritesChanges')) {
        db.createObjectStore('pendingFavoritesChanges', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
} 