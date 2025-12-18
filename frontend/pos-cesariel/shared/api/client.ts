/**
 * Base API Client Configuration
 *
 * Provides configured axios instances with authentication and error handling
 */

import axios, { AxiosInstance } from 'axios';

// Function to get API base URL - evaluated at runtime on client side
function getApiBaseUrl(): string {
  // If environment variable is set, use it
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Client-side detection: if running in production (not localhost), use Railway backend
  if (typeof window !== 'undefined') {
    const isProduction = window.location.hostname !== 'localhost' &&
                        window.location.hostname !== '127.0.0.1';
    if (isProduction) {
      return 'https://backend-production-c20a.up.railway.app';
    }
  }

  // Default: localhost for development
  return 'http://localhost:8000';
}

/**
 * Main API client with authentication
 * Used for all authenticated endpoints
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: 'https://backend-production-c20a.up.railway.app', // Hardcoded for Railway
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Public API client without authentication
 * Used for public e-commerce endpoints
 */
export const publicApiClient: AxiosInstance = axios.create({
  baseURL: 'https://backend-production-c20a.up.railway.app', // Hardcoded for Railway
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - add authentication token to requests
 * Safely checks for browser environment before accessing localStorage
 */
apiClient.interceptors.request.use(
  (config) => {
    // Only access localStorage in browser environment (Next.js SSR safety)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - handle authentication errors
 * Safely handles localStorage and navigation in browser environment
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized and 403 Forbidden errors (only in browser)
    if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
      // Get Zustand store to call logout with reason
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          // Update the store with expired reason
          parsed.state.logoutReason = 'expired';
          parsed.state.isAuthenticated = false;
          parsed.state.token = null;
          parsed.state.user = null;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        } catch (e) {
          // If parsing fails, just clear storage
          console.error('Error updating auth storage:', e);
        }
      }

      // Clear invalid token
      localStorage.removeItem('token');

      // Only redirect to login if we're not already there
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Legacy exports for backward compatibility
 * @deprecated Use apiClient or publicApiClient instead
 */
export const api = apiClient;
export const publicApi = publicApiClient;
