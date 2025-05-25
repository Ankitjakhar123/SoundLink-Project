import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./theme.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { PlayerContextProvider } from "./context/PlayerContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { RadioContextProvider } from "./context/RadioContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { initializeDeviceStyles } from "./utils/deviceUtils.js";
// import { registerSW } from 'virtual:pwa-register';

// Initialize device-specific styles for notches and safe areas
initializeDeviceStyles();

// TEMPORARY: Disable service workers to troubleshoot refresh loop issue
console.log('Service workers have been temporarily disabled to troubleshoot refresh issues');

// Force unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('Unregistered service worker to stop refresh loop');
    }
  }).catch(err => {
    console.error('Error unregistering service workers:', err);
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RadioContextProvider>
          <PlayerContextProvider>
            <App />
            <ToastContainer
              position="top-right"
              autoClose={1800}
              hideProgressBar={true}
              newestOnTop={true}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss={false}
              draggable={false}
              pauseOnHover={false}
              theme="dark"
              toastClassName="!rounded-xl !bg-neutral-900 !text-white !shadow-lg !border !border-fuchsia-500/40 !backdrop-blur-md !p-4 !text-base !max-w-xs sm:!max-w-sm md:!max-w-md !w-full !m-2"
              bodyClassName="!font-semibold !text-base !p-0"
              style={{ zIndex: 9999 }}
            />
          </PlayerContextProvider>
        </RadioContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
