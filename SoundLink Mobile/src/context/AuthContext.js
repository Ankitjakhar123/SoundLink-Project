import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

export const AuthContext = createContext();

const API_URL = 'http://10.0.2.2:4000/api'; // Use 10.0.2.2 for Android emulator to access localhost

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from storage
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        
        if (storedToken) {
          setToken(storedToken);
          // Fetch user data using the token
          try {
            const response = await axios.get(`${API_URL}/user/me`, {
              headers: {
                Authorization: `Bearer ${storedToken}`
              }
            });
            
            if (response.data.success) {
              setUser(response.data.user);
            } else {
              // Token might be invalid
              await AsyncStorage.removeItem('token');
              setToken(null);
            }
          } catch (error) {
            // Handle API errors
            console.error('Error fetching user data:', error);
            await AsyncStorage.removeItem('token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/user/login`, {
        email,
        password,
      });

      if (response.data.success) {
        const { token, user } = response.data;
        
        // Save token to storage
        await AsyncStorage.setItem('token', token);
        
        // Update state
        setToken(token);
        setUser(user);
        
        Toast.show({
          type: 'success',
          text1: 'Login Successful',
          text2: `Welcome back, ${user.username}!`,
        });
        
        return true;
      } else {
        setError(response.data.message || 'Login failed');
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: response.data.message || 'Invalid credentials',
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: errorMessage,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/user/register`, {
        username,
        email,
        password,
      });

      if (response.data.success) {
        Toast.show({
          type: 'success',
          text1: 'Registration Successful',
          text2: 'Your account has been created!',
        });
        return true;
      } else {
        setError(response.data.message || 'Registration failed');
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: response.data.message,
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: errorMessage,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      setUser(null);
      setToken(null);
      
      Toast.show({
        type: 'success',
        text1: 'Logged Out',
        text2: 'You have successfully logged out',
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(
        `${API_URL}/user/update`, 
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUser(response.data.user);
        
        Toast.show({
          type: 'success',
          text1: 'Profile Updated',
          text2: 'Your profile has been successfully updated',
        });
        
        return true;
      } else {
        setError(response.data.message || 'Failed to update profile');
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: response.data.message,
        });
        return false;
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Network error. Please try again.';
      setError(errorMessage);
      
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: errorMessage,
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 