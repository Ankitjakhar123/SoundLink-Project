import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/api";
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(getCombinedToken());
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  // Get token from either cookies or localStorage (fallback)
  function getCombinedToken() {
    return Cookies.get('auth_token') || localStorage.getItem("token") || "";
  }

  // Save token to both storage methods
  function saveTokenToStorage(newToken) {
    if (newToken) {
      // Save to cookie (expires in 7 days, secure in production)
      Cookies.set('auth_token', newToken, { 
        expires: 7, 
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax'
      });
      // Also save to localStorage as fallback
      localStorage.setItem("token", newToken);
    } else {
      // Remove token
      Cookies.remove('auth_token');
      localStorage.removeItem("token");
    }
  }

  // Process any pending actions that were stored during login attempts
  const processPendingActions = async () => {
    const pendingAction = localStorage.getItem('pendingAction');
    
    if (!pendingAction) return;
    
    try {
      const action = JSON.parse(pendingAction);
      
      if (action.type === 'favorite' && action.songId) {
        // Add song to favorites
        await axios.post(
          `${API_BASE_URL}/api/favorite/like`, 
          { songId: action.songId }, 
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Added to favorites");
      } 
      else if (action.type === 'playlist' && action.songId && action.playlistId) {
        // Add song to playlist
        await axios.post(
          `${API_BASE_URL}/api/playlist/add-song`, 
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

  // Load user data if token exists
  useEffect(() => {
    setLoading(true);
    if (token) {
      axios
        .get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.user);
            setIsEmailVerified(res.data.user.isEmailVerified || false);
            // Process any pending actions
            processPendingActions();
          }
          else {
            setUser(null);
            saveTokenToStorage(""); // Clear invalid token
          }
        })
        .catch(() => {
          setUser(null);
          saveTokenToStorage(""); // Clear invalid token
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      if (res.data.success) {
        const newToken = res.data.token;
        setToken(newToken);
        saveTokenToStorage(newToken);
        setUser(res.data.user);
        setIsEmailVerified(res.data.user.isEmailVerified || false);
        return { success: true };
      }
      return { success: false, message: "Invalid credentials" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { username, email, password, avatar } = userData;
      
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/register`, 
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      
      if (res.data.success) {
        return { success: true };
      }
      return { success: false, message: res.data.message || "Registration failed" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed" 
      };
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    saveTokenToStorage("");
  };

  const sendVerificationEmail = async () => {
    if (!user || !token) return { success: false, message: "Not authenticated" };
    
    try {
      setVerificationEmailSent(false);
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/send-verification-email`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setVerificationEmailSent(true);
        return { success: true };
      }
      return { success: false, message: res.data.message || "Failed to send verification email" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to send verification email" 
      };
    }
  };

  const verifyEmail = async (code) => {
    if (!user || !token) return { success: false, message: "Not authenticated" };
    
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/verify-email`,
        { code },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data.success) {
        setIsEmailVerified(true);
        // Update user object with verified email status
        setUser(prev => ({...prev, isEmailVerified: true}));
        return { success: true };
      }
      return { success: false, message: res.data.message || "Invalid verification code" };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Email verification failed" 
      };
    }
  };

  // Attach token to all axios requests
  useEffect(() => {
    axios.defaults.headers.common["Authorization"] = token ? `Bearer ${token}` : "";
  }, [token]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      register, 
      logout,
      isEmailVerified,
      verificationEmailSent,
      sendVerificationEmail,
      verifyEmail,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 