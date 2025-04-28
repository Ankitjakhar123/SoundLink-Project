import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { PlayerContextProvider } from "./context/PlayerContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
