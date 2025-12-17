/**
 * Authentication API
 *
 * Handles user authentication and session management
 */

import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: any; // Use proper User type from shared/types
}

/**
 * Authentication API methods
 */
export const authApi = {
  /**
   * Login with username and password
   * @param credentials - Username and password
   * @returns Access token and user data
   */
  login: (credentials: LoginCredentials) =>
    apiClient.post<LoginResponse>('/auth/login-json', credentials),

  /**
   * Get current authenticated user
   * @returns Current user data
   */
  getCurrentUser: () => apiClient.get('/users/me'),
};
