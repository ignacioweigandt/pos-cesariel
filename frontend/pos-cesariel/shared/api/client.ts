/**
 * Cliente HTTP base configurado con autenticación y manejo de errores.
 * Proporciona dos instancias: apiClient (autenticado) y publicApiClient (público).
 */

import axios, { AxiosInstance } from 'axios';

const PRODUCTION_BACKEND_URL = 'https://backend-production-c20a.up.railway.app';

/**
 * Determina la URL base del API según el entorno.
 * Prioridad: NEXT_PUBLIC_API_URL > detección por hostname > localhost.
 */
function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const isProduction = hostname !== 'localhost' && hostname !== '127.0.0.1';
    if (isProduction) {
      return PRODUCTION_BACKEND_URL;
    }
  }

  return 'http://localhost:8000';
}

/**
 * Cliente principal con autenticación JWT automática.
 * baseURL se establece dinámicamente en cada request (importante para SSR).
 */
export const apiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Cliente para endpoints públicos sin autenticación (e-commerce).
 * baseURL se establece dinámicamente en cada request.
 */
export const publicApiClient: AxiosInstance = axios.create({
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();

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

publicApiClient.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuesta: maneja errores 401/403 limpiando sesión y redirigiendo.
 * Actualiza el store de Zustand con logoutReason='expired'.
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && (error.response?.status === 401 || error.response?.status === 403)) {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const parsed = JSON.parse(authStorage);
          parsed.state.logoutReason = 'expired';
          parsed.state.isAuthenticated = false;
          parsed.state.token = null;
          parsed.state.user = null;
          localStorage.setItem('auth-storage', JSON.stringify(parsed));
        } catch (e) {
          console.error('Error updating auth storage:', e);
        }
      }

      localStorage.removeItem('token');

      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

/** @deprecated Usar apiClient o publicApiClient directamente */
export const api = apiClient;
export const publicApi = publicApiClient;
