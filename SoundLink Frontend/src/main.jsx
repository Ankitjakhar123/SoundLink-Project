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
  // Check for new content more frequently - every 60 minutes
  intervalMS: 60 * 60 * 1000,
  // Customize the update notification with a toast instead of a browser confirm dialog
  onNeedRefresh() {
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
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js', { scope: '/' })
      .then(registration => {
        console.log('Custom service worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('Custom service worker registration failed:', error);
      });
  });
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
