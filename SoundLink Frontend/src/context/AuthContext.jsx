import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const url = import.meta.env.VITE_BACKEND_URL;

  // Process any pending actions that were stored during login attempts
  const processPendingActions = async () => {
    const pendingAction = localStorage.getItem('pendingAction');
    
    if (!pendingAction) return;
    
    try {
      const action = JSON.parse(pendingAction);
      
      if (action.type === 'favorite' && action.songId) {
        // Add song to favorites
        await axios.post(
          `${url}/api/favorite/like`, 
          { songId: action.songId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to favorites");
      } 
      else if (action.type === 'playlist' && action.songId && action.playlistId) {
        // Add song to playlist
        await axios.post(
          `${url}/api/playlist/add-song`, 
          { songId: action.songId, playlistId: action.playlistId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to playlist");
      }
      
      // Clear the pending action
      localStorage.removeItem('pendingAction');
    } catch (error) {
      console.error("Error processing pending action:", error);
    }
  };

  useEffect(() => {
    if (token) {
      axios
        .get(`${url}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            // Process any pending actions
            processPendingActions();
          }
          else setUser(null);
        })
        .catch(() => setUser(null));
    } else {
      setUser(null);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await axios.post(`${url}/api/auth/login`, { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      return true;
    }
    return false;
  };

  const register = async (username, email, password) => {
    const res = await axios.post(`${url}/api/auth/register`, { username, email, password });
    return res.data.success;
  };

  const logout = () => {
    setToken("");
    setUser(null);
    localStorage.removeItem("token");
  };

  // Attach token to all axios requests
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 