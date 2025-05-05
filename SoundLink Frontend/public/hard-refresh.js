// This script forces browsers and PWAs to update their caches
(function() {
  // Set a version stamp to track updates
  const APP_VERSION = '1.0.2'; // Increment this when making icon changes
  
  // Check if we need to refresh the app
  function checkForAppUpdate() {
    const lastVersion = localStorage.getItem('app_version');
    
    // If version has changed or doesn't exist, perform cleanup
    if (lastVersion !== APP_VERSION) {
      console.log(`App updated from ${lastVersion || 'initial'} to ${APP_VERSION}. Clearing caches...`);
      
      // Store the new version
      localStorage.setItem('app_version', APP_VERSION);
      
      // Clear all local storage except the version
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'app_version') {
          localStorage.removeItem(key);
        }
      }
      
      // Clear cache API if available
      if ('caches' in window) {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        });
      }
      
      // Clear session storage
      sessionStorage.clear();
      
      // If it's a PWA and there's a service worker, update it
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.update();
          });
        });
      }
      
      // Force reload after a brief delay to allow cache clearing
      setTimeout(() => {
        console.log('Forcing page reload to apply new version...');
        window.location.reload(true);
      }, 1000);
    }
  }
  
  // Run the check when the app loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkForAppUpdate);
  } else {
    checkForAppUpdate();
  }
})(); 