/**
 * SoundLink hard refresh utility
 * Helps prevent and solve caching issues that can cause refresh loops
 */

(function() {
  // Force reload if we have a query parameter
  if (window.location.href.includes('force_reload=true')) {
    // Clear potential problematic data
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Remove the force_reload parameter for clean URL
    const url = new URL(window.location.href);
    url.searchParams.delete('force_reload');
    window.history.replaceState({}, document.title, url.toString());
    
    console.log('Force reload parameter detected and processed');
  }
  
  // Version check for cache busting
  const currentVersion = '1.0.2'; // Update this when deploying
  const lastVersion = localStorage.getItem('appVersion');
  
  if (lastVersion !== currentVersion) {
    console.log(`Version changed from ${lastVersion || 'none'} to ${currentVersion}, refreshing resources`);
    
    // Clear cache for major version changes
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('soundlink-cache')) {
            caches.delete(cacheName);
            console.log(`Deleted cache: ${cacheName}`);
          }
        });
      });
    }
    
    // Update stored version
    localStorage.setItem('appVersion', currentVersion);
  }
  
  // Handle network reconnection
  window.addEventListener('online', () => {
    // Refresh API data but not the page when coming back online
    console.log('Network connection restored');
    
    // Dispatch a custom event that app components can listen for
    window.dispatchEvent(new CustomEvent('networkRestored'));
  });
  
  // Add a helper function to the window
  window.hardRefresh = function() {
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          caches.delete(cacheName);
        });
        console.log('All caches cleared');
        
        // Unregister service workers
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
              registration.unregister();
            }
            console.log('Service workers unregistered');
            
            // Finally reload the page
            window.location.reload(true);
          });
        } else {
          window.location.reload(true);
        }
      });
    } else {
      window.location.reload(true);
    }
  };
  
  // Expose a simple API for emergencies
  window.soundlinkEmergencyFix = function() {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Emergency storage reset complete');
    window.location.href = '/?force_reload=true';
  };
})(); 