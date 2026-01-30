/** Roles de usuario y permisos por módulo */

export const USER_ROLES = {
  ADMIN: 'ADMIN',
  MANAGER: 'MANAGER',
  SELLER: 'SELLER',
  ECOMMERCE: 'ECOMMERCE',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  SELLER: 'Vendedor',
  ECOMMERCE: 'E-commerce',
};

/** Jerarquía de roles (mayor número = más permisos) */
export const ROLE_HIERARCHY: Record<string, number> = {
  ADMIN: 4,
  admin: 4,
  MANAGER: 3,
  manager: 3,
  SELLER: 2,
  seller: 2,
  ECOMMERCE: 1,
  ecommerce: 1,
};

/** Permisos de módulos por rol */
export const MODULE_PERMISSIONS: Record<string, string[]> = {
  pos: ['ADMIN', 'MANAGER', 'SELLER', 'admin', 'manager', 'seller'],
  inventory: ['ADMIN', 'MANAGER', 'admin', 'manager'],
  reports: ['ADMIN', 'MANAGER', 'admin', 'manager'],
  ecommerce: ['ADMIN', 'MANAGER', 'ECOMMERCE', 'admin', 'manager', 'ecommerce'],
  users: ['ADMIN', 'MANAGER', 'admin', 'manager'],
  settings: ['ADMIN', 'MANAGER', 'admin', 'manager'],
  dashboard: ['ADMIN', 'MANAGER', 'SELLER', 'ECOMMERCE', 'admin', 'manager', 'seller', 'ecommerce'],
};
