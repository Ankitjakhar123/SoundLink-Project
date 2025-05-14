import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { PlayerContextProvider } from "./context/PlayerContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { registerSW } from 'virtual:pwa-register';

// Register service worker with improved options for better performance
const updateSW = registerSW({
  // Check for new content less frequently to reduce chances of refresh loops
  intervalMS: 24 * 60 * 60 * 1000, // Once per day
  immediate: false, // Don't check immediately on page load
  // Customize the update notification with a toast instead of a browser confirm dialog
  onNeedRefresh() {
    // Check if we're in a refresh loop before showing update notification
    const lastUpdateTime = localStorage.getItem('lastUpdateTime');
    const now = Date.now();
    
    // If we've shown an update notification in the last 10 minutes, don't show another
    if (lastUpdateTime && (now - parseInt(lastUpdateTime)) < 10 * 60 * 1000) {
      console.log('Skipping update notification to prevent refresh loop');
      return;
    }
    
    // Record this update notification time
    localStorage.setItem('lastUpdateTime', now.toString());
    
    // Create a toast notification for better UX
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-fuchsia-600 text-white p-4 rounded-lg shadow-lg z-50 flex items-center justify-between';
    toast.innerHTML = `
      <div>
        <p class="font-medium">New content available!</p>
        <p class="text-sm opacity-90">Update now for the latest features.</p>
      </div>
      <div class="flex space-x-2">
        <button id="update-app" class="bg-white text-fuchsia-600 px-3 py-1 rounded font-medium">Update</button>
        <button id="dismiss-update" class="bg-fuchsia-700 px-3 py-1 rounded">Later</button>
      </div>
    `;
    document.body.appendChild(toast);
    
    // Handle update action
    document.getElementById('update-app').addEventListener('click', () => {
      updateSW(true);
      document.body.removeChild(toast);
    });
    
    // Handle dismiss action
    document.getElementById('dismiss-update').addEventListener('click', () => {
      document.body.removeChild(toast);
    });
  },
  onOfflineReady() {
    console.log('SoundLink is ready to work offline');
    
    // Notify users they can use the app offline
    const offlineToast = document.createElement('div');
    offlineToast.className = 'fixed bottom-4 left-4 bg-green-600 text-white p-3 rounded-lg shadow-lg z-50';
    offlineToast.innerHTML = 'SoundLink is ready for offline use!';
    document.body.appendChild(offlineToast);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(offlineToast)) {
        document.body.removeChild(offlineToast);
      }
    }, 3000);
  },
  // Handle registration errors
  onRegisterError(error) {
    console.error('Service worker registration error:', error);
  }
});

// Also register our custom service worker for advanced caching strategies
if ('serviceWorker' in navigator) {
  // Check if we've had refresh issues
  const refreshCount = parseInt(localStorage.getItem('pageRefreshCount') || '0');
  localStorage.setItem('pageRefreshCount', (refreshCount + 1).toString());
  
  // If we're reloading too frequently, don't register the service worker
  if (refreshCount > 3) {
    console.log('Detected potential refresh loop, skipping service worker registration');
    
    // Try to unregister any existing service workers to break the cycle
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for(let registration of registrations) {
        registration.unregister();
        console.log('Unregistered service worker to stop refresh loop');
      }
    });
    
    // Reset counter after a delay
    setTimeout(() => {
      localStorage.setItem('pageRefreshCount', '0');
    }, 30000);
  } else {
    // Normal registration flow
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
        .then(registration => {
          console.log('Custom service worker registered with scope:', registration.scope);
          
          // Reset refresh counter after successful registration
          setTimeout(() => {
            localStorage.setItem('pageRefreshCount', '0');
          }, 5000);
        })
        .catch(error => {
          console.error('Custom service worker registration failed:', error);
        });
    });
  }
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <PlayerContextProvider>
          <App />
          <ToastContainer position="bottom-right" theme="dark" />
        </PlayerContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
