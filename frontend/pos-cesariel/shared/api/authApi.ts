/** API de autenticación y gestión de sesión */

import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: any;
}

export const authApi = {
  /** Autenticar usuario con credenciales */
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/auth/login-json', credentials),

  /** Obtener datos del usuario autenticado actual */
  getCurrentUser: () => apiClient.get('/users/me'),
};
