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

// Fetch event - DISABLED for troubleshooting refresh loops
self.addEventListener('fetch', () => {
  // Completely bypass service worker and use network
  // This ensures no caching affects the application while debugging
  return;
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