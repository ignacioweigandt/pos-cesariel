/**
 * User and Branch Type Definitions
 *
 * Type definitions for user management, branch management, and role-based access control
 */

/**
 * User role types in the system
 */
export type UserRole = "admin" | "manager" | "seller" | "ecommerce";

/**
 * User entity with authentication and authorization details
 */
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

/**
 * Branch entity representing physical store locations
 */
export interface Branch {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
}

/**
 * Form data for creating/updating users
 */
export interface UserFormData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role: string;
  branch_id: number | null;
  is_active: boolean;
}

/**
 * Form data for creating/updating branches
 */
export interface BranchFormData {
  name: string;
  address: string;
  phone: string;
  email: string;
  is_active: boolean;
}

/**
 * Role information with permissions
 */
export interface RoleInfo {
  name: string;
  key: UserRole;
  description: string;
  permissions: string[];
  color: string;
}

/**
 * Form validation errors
 */
export interface FormErrors {
  [key: string]: string;
}
