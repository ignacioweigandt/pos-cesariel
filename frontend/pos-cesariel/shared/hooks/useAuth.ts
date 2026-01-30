import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'seller' | 'ecommerce';
  branch_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: {
    id: number;
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
}

export type LogoutReason =
  | 'manual'       // Logout manual
  | 'inactivity'   // Inactividad (4 horas)
  | 'expired'      // Token expirado (401/403)
  | null;

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logoutReason: LogoutReason;
  login: (token: string, user: User) => void;
  logout: (reason?: LogoutReason) => void;
  updateUser: (user: User) => void;
  clearLogoutReason: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      logoutReason: null,
      login: (token: string, user: User) => {
        localStorage.setItem('token', token);
        set({ token, user, isAuthenticated: true, logoutReason: null });
      },
      logout: (reason: LogoutReason = 'manual') => {
        localStorage.removeItem('token');
        set({ token: null, user: null, isAuthenticated: false, logoutReason: reason });
      },
      updateUser: (user: User) => {
        set({ user });
      },
      clearLogoutReason: () => {
        set({ logoutReason: null });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const hasPermission = (user: User | null, requiredRole: string[]): boolean => {
  if (!user) return false;
  
  const roleHierarchy = {
    admin: 4,
    manager: 3,
    seller: 2,
    ecommerce: 1,
    ADMIN: 4,
    MANAGER: 3,
    SELLER: 2,
    ECOMMERCE: 1,
  };
  
  const userLevel = roleHierarchy[user.role] || 0;
  const requiredLevel = Math.max(...requiredRole.map(role => roleHierarchy[role] || 0));
  
  return userLevel >= requiredLevel;
};

/** Verifica si el usuario puede acceder a un módulo específico según su rol */
export const canAccessModule = (user: User | null, module: string): boolean => {
  if (!user) return false;
  
  const modulePermissions = {
    pos: ['admin', 'manager', 'seller', 'ADMIN', 'MANAGER', 'SELLER'],
    inventory: ['admin', 'manager', 'seller', 'ADMIN', 'MANAGER', 'SELLER'],
    reports: ['admin', 'manager', 'ADMIN', 'MANAGER'],
    ecommerce: ['admin', 'manager', 'ecommerce', 'ADMIN', 'MANAGER', 'ECOMMERCE'],
    users: ['admin', 'manager', 'ADMIN', 'MANAGER'],
    settings: ['admin', 'manager', 'ADMIN', 'MANAGER'],
  };
  
  return modulePermissions[module]?.includes(user.role) || false;
};