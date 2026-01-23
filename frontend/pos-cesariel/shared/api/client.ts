/**
 * Base API Client Configuration
 *
 * Provides configured axios instances with authentication and error handling
 */

import axios, { AxiosInstance } from 'axios';

// Production backend URL for Railway deployment
const PRODUCTION_BACKEND_URL = 'https://backend-production-c20a.up.railway.app';

/**
 * Get API base URL dynamically at request time
 * This function is called on each request to ensure correct URL in all environments
 */
function getApiBaseUrl(): string {
  // If environment variable is set, use it (highest priority)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Client-side: detect production by hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    if (isProduction) {
      return PRODUCTION_BACKEND_URL;
    }
  }

  // Default: localhost for development
  return 'http://localhost:8000';
}

/**
 * Main API client with authentication
 * Used for all authenticated endpoints
 *
 * NOTE: baseURL is set dynamically via interceptor to handle SSR correctly
 */
export const apiClient: AxiosInstance = axios.create({
  timeout: 30000, // 30 second timeout (Railway cold starts can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Public API client without authentication
 * Used for public e-commerce endpoints
 *
 * NOTE: baseURL is set dynamically via interceptor to handle SSR correctly
 */
export const publicApiClient: AxiosInstance = axios.create({
  timeout: 30000, // 30 second timeout (Railway cold starts can be slow)
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - dynamically set baseURL and add authentication
 * This ensures correct URL detection on client-side after hydration
 */
apiClient.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically on each request (important for SSR/hydration)
    config.baseURL = getApiBaseUrl();

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
 * Request interceptor for public client - dynamically set baseURL
 */
publicApiClient.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically on each request
    config.baseURL = getApiBaseUrl();
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
