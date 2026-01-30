/** Definiciones de tipos para gestión de usuarios, sucursales y control de acceso basado en roles */

export type UserRole = "admin" | "manager" | "seller" | "ecommerce";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: Branch;
}

export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

export interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: string;
  branch_id: number | null;
  is_active: boolean;
}

export interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
}

export interface RoleInfo {
  name: string;
  key: UserRole;
  description: string;
  permissions: string[];
  color: string;
}

export interface FormErrors {
  [key: string]: string;
}
