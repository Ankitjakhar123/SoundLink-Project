/**
 * Centralized API configuration
 * This file provides a single source of truth for API URL configuration
 */

// Get the backend URL from environment variables with a fallback for development
export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://replace-with-your-backend-url.com';

// Helper function to construct API URLs
export const getApiUrl = (endpoint) => {
  // Make sure the endpoint starts with a slash if not already
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${formattedEndpoint}`;
};

// Common API request headers
export const getAuthHeaders = (token) => {
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Example usage:
// import { getApiUrl, getAuthHeaders } from '../utils/api';
// const fetchData = async () => {
//   const response = await axios.get(getApiUrl('api/song/list'), { 
//     headers: getAuthHeaders(token) 
//   });
// }; 