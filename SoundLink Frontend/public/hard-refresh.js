/**
 * hard-refresh.js - Script to ensure proper cache refreshes on app updates
 * This helps avoid stale cache issues often seen in PWAs
 */

// Check if this is a new deployment by comparing build timestamps
(function() {
  const BUILD_TIMESTAMP = '2024-05-14T12:00:00Z'; // This value would be replaced by the build script
  const lastBuildTimestamp = localStorage.getItem('build_timestamp');
  
  if (lastBuildTimestamp && lastBuildTimestamp !== BUILD_TIMESTAMP) {
    // New deployment detected, clear caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          console.log('Clearing cache:', cacheName);
          caches.delete(cacheName);
        });
      });
    }
    
    // Clear certain localStorage items that might cause issues
    const keysToKeep = ['auth_token', 'user_id', 'theme_preference', 'volume_level'];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!keysToKeep.includes(key) && !key.startsWith('persist:')) {
        localStorage.removeItem(key);
      }
    }
    
    // Force a hard reload if this isn't the first visit
    if (sessionStorage.getItem('app_loaded_once')) {
      console.log('New version detected. Reloading app...');
      window.location.reload(true); // true forces a reload from server, not cache
    }
  }
  
  // Update the stored timestamp
  localStorage.setItem('build_timestamp', BUILD_TIMESTAMP);
  sessionStorage.setItem('app_loaded_once', 'true');
  
  // Listen for service worker updates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker activated
      console.log('New service worker activated, refreshing...');
      window.location.reload(true);
    });
  }
  
  // Check for network connectivity changes
  window.addEventListener('online', () => {
    // When coming back online, check for updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }
  });
})(); 