/** API de autenticación y gestión de sesión */

import { apiClient } from './client';
import type { User } from '@/features/users/types/users.types';

export interface LoginCredentials {
  username: string;
  password: string;
}

// React 19: Type-safe LoginResponse - user must match User interface
export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  /** Autenticar usuario con credenciales */
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/auth/login-json', credentials),

  /** Obtener datos del usuario autenticado actual */
  getCurrentUser: () => apiClient.get<User>('/users/me'),
};
