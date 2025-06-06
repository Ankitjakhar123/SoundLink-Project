import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { API_BASE_URL } from "../utils/api";
import Cookies from 'js-cookie';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [token, setToken] = useState(getCombinedToken());
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  // Detect iOS devices on mount
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    setIsIOS(isiOS);
    
    // Log device info for debugging
    console.log("Device detection:", { 
      isIOS: isiOS,
      userAgent 
    });
  }, []);

  // Get token from either cookies or localStorage (fallback)
  function getCombinedToken() {
    // Check if we're on iOS first - user agent detection happens after initial render
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isiOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    
    // For iOS devices, prioritize localStorage to avoid cookie issues
    if (isiOS) {
      return localStorage.getItem("token") || "";
    }
    
    // For other devices, try cookie first, then localStorage
    return Cookies.get('auth_token') || localStorage.getItem("token") || "";
  }

  // Save token to storage methods based on device
  function saveTokenToStorage(newToken) {
    if (newToken) {
      // For iOS devices, prioritize localStorage and avoid cookies
      if (isIOS) {
        localStorage.setItem("token", newToken);
        try {
          // Still try to set cookie as fallback, but with minimal options
          Cookies.set('auth_token', newToken, { 
            expires: 7,
            sameSite: 'Lax'
          });
        } catch(err) {
          console.log("Could not set cookie on iOS, using localStorage only:", err.message);
        }
      } else {
        // For non-iOS devices, use both storage methods
        Cookies.set('auth_token', newToken, { 
          expires: 7, 
          secure: window.location.protocol === 'https:',
          sameSite: 'Lax'
        });
        localStorage.setItem("token", newToken);
      }
      
      // Set token in axios headers immediately
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    } else {
      // Remove token
      Cookies.remove('auth_token');
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
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
    const loadUserData = async () => {
      setLoading(true);
      
      try {
        // Double-check that we have the token in headers
        const currentToken = token || getCombinedToken();
        if (!currentToken) {
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Ensure token is in axios headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${currentToken}`;
        
        // Add a flag to localStorage to prevent infinite refresh loops
        const authAttemptCount = parseInt(localStorage.getItem('authAttemptCount') || '0');
        const authStartTime = parseInt(localStorage.getItem('authStartTime') || '0');
        const now = Date.now();
        
        // Reset counter if it's been more than 2 minutes since first attempt
        if (authStartTime && (now - authStartTime) > 2 * 60 * 1000) {
          localStorage.setItem('authAttemptCount', '0');
          localStorage.setItem('authStartTime', now.toString());
        }
        
        // If this is the first attempt in this session, record the start time
        if (authAttemptCount === 0) {
          localStorage.setItem('authStartTime', now.toString());
        }
        
        // If we've tried to authenticate too many times in a short period, stop trying
        if (authAttemptCount > 3) {
          console.log("Too many auth attempts, stopping to prevent refresh loop");
          localStorage.removeItem('token');
          Cookies.remove('auth_token');
          delete axios.defaults.headers.common["Authorization"];
          setUser(null);
          setToken("");
          setLoading(false);
          
          // Tell the user what happened
          if (typeof window !== 'undefined') {
            // Create a toast-like message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fixed top-4 left-0 right-0 mx-auto w-max max-w-md bg-red-600 text-white p-4 rounded-lg shadow-lg z-50';
            errorDiv.style.zIndex = '9999';
            errorDiv.innerHTML = `
              <p class="font-medium">Authentication error detected</p>
              <p class="text-sm">The app has been reset to solve refresh issues.</p>
              <button class="mt-2 bg-white text-red-600 px-3 py-1 rounded w-full">Reload app</button>
            `;
            document.body.appendChild(errorDiv);
            
            errorDiv.querySelector('button').addEventListener('click', () => {
              window.location.href = '/';
            });
            
            // Auto remove after 10 seconds
            setTimeout(() => {
              if (document.body.contains(errorDiv)) {
                document.body.removeChild(errorDiv);
              }
            }, 10000);
          }
          
          // Reset the counter
          localStorage.setItem('authAttemptCount', '0');
          return;
        }
        
        // Increment auth attempt counter
        localStorage.setItem('authAttemptCount', (authAttemptCount + 1).toString());
        
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`);
        
        if (res.data.success) {
          setUser(res.data.user);
          setIsEmailVerified(res.data.user.isEmailVerified || false);
          // Process any pending actions
          processPendingActions();
          
          // Reset auth attempt counter on success
          localStorage.setItem('authAttemptCount', '0');
        } else {
          console.log("Failed to load user data: Invalid response");
          setUser(null);
          saveTokenToStorage(""); // Clear invalid token
        }
      } catch (error) {
        console.log("Failed to load user data:", error);
        setUser(null);
        saveTokenToStorage(""); // Clear invalid token
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [token]);

  // Special login method for iOS devices
  const iOSLogin = async (email, password) => {
    console.log("Using iOS-specific login method");
    try {
      // Clear any existing tokens
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      
      // Direct API call without using stored tokens
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { 
        email, 
        password,
        deviceType: 'ios' // Let the server know this is an iOS device
      });
      
      if (res.data.success) {
        const newToken = res.data.token;
        
        // Set in localStorage only first
        localStorage.setItem("token", newToken);
        
        // Small delay before updating state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Update token in state and axios headers
        setToken(newToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        
        // Then update user data
        setUser(res.data.user);
        setIsEmailVerified(res.data.user.isEmailVerified || false);
        
        return { success: true };
      } else if (res.data.requiresVerification) {
        // Handle case where email verification is required
        return {
          success: false,
          requiresVerification: true,
          userId: res.data.userId,
          message: res.data.message
        };
      }
      
      return { success: false, message: res.data.message || "Login failed" };
    } catch (error) {
      console.error("iOS login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed on iOS device" 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
      
      if (res.data.success) {
        const newToken = res.data.token;
        saveTokenToStorage(newToken);
        setToken(newToken);
        setUser(res.data.user);
        setIsEmailVerified(res.data.user.isEmailVerified || false);
        return { success: true };
      } else if (res.data.requiresVerification) {
        // Handle case where email verification is required
        return { 
          success: false, 
          requiresVerification: true,
          userId: res.data.userId,
          message: "Please verify your email to continue."
        };
      } else {
        return { success: false, message: res.data.message || "Login failed" };
      }
    } catch (error) {
      console.error("Login error:", error);
      // Handle 403 Forbidden response for unverified email
      if (error.response?.status === 403 && error.response?.data?.requiresVerification) {
        return {
          success: false,
          requiresVerification: true,
          userId: error.response.data.userId,
          message: error.response.data.message || "Please verify your email to continue."
        };
      }
      return { 
        success: false, 
        message: error.response?.data?.message || "Login failed. Please try again." 
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
      
      // Add device info for iOS-specific handling on the server
      if (isIOS) {
        formData.append('deviceType', 'ios');
      }
      
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
    // Special handling for iOS devices
    if (isIOS) {
      // For iOS, focus on localStorage
      localStorage.removeItem("token");
      try {
        Cookies.remove('auth_token');
      } catch (err) {
        console.log("Could not remove cookie on iOS:", err.message);
      }
    } else {
      // Normal logout for other devices
      Cookies.remove('auth_token');
      localStorage.removeItem("token");
    }
    
    // Reset auth attempt counter on logout
    localStorage.setItem('authAttemptCount', '0');
    
    setToken("");
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    
    // Force refresh on iOS to clear any session issues
    if (isIOS) {
      setTimeout(() => {
        window.location.href = "/auth";
      }, 100);
    }
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

  // Update the user profile data in context
  const updateUserData = (userData) => {
    if (!userData) return;
    
    // Log the incoming user data
    console.log("Updating user data in context:", userData);
    
    // Check if we need to update image URL format
    let updatedData = { ...userData };
    
    // If there's an image URL, ensure it's properly formatted
    if (updatedData.image) {
      // For Cloudinary URLs, ensure using HTTPS
      if (updatedData.image.includes('cloudinary.com')) {
        updatedData.image = updatedData.image.replace('http://', 'https://');
        console.log("Fixed Cloudinary URL in user data:", updatedData.image);
      }
      
      // For relative upload paths, ensure they'll be processed correctly later
      console.log("Image URL in updated user data:", updatedData.image);
    }
    
    // Update the user state with merged data
    setUser(prevUser => {
      const newUserData = {
        ...prevUser,
        ...updatedData
      };
      console.log("New merged user data:", newUserData);
      return newUserData;
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      isIOS,
      login, 
      register, 
      logout,
      isEmailVerified,
      verificationEmailSent,
      sendVerificationEmail,
      verifyEmail,
      loading,
      updateUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 