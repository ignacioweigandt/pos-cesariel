/**
 * Application route constants
 *
 * Defines all application routes and navigation paths
 */

/**
 * Public routes (no authentication required)
 */
export const PUBLIC_ROUTES = {
  LOGIN: '/',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
} as const;

/**
 * Protected routes (authentication required)
 */
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  POS: '/pos',
  INVENTORY: '/inventory',
  PRODUCTS: '/inventory/products',
  CATEGORIES: '/inventory/categories',
  REPORTS: '/reports',
  SALES_REPORT: '/reports/sales',
  INVENTORY_REPORT: '/reports/inventory',
  ECOMMERCE: '/ecommerce',
  ECOMMERCE_PRODUCTS: '/ecommerce/products',
  ECOMMERCE_BANNERS: '/ecommerce/banners',
  ECOMMERCE_ORDERS: '/ecommerce/orders',
  USERS: '/users',
  USER_LIST: '/users/list',
  USER_ROLES: '/users/roles',
  SETTINGS: '/settings',
  PROFILE: '/settings/profile',
  SYSTEM_CONFIG: '/settings/system',
} as const;

/**
 * All application routes
 */
export const APP_ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
} as const;

/**
 * API routes
 */
export const API_ROUTES = {
  AUTH: '/auth',
  USERS: '/users',
  PRODUCTS: '/products',
  CATEGORIES: '/categories',
  SALES: '/sales',
  BRANCHES: '/branches',
  REPORTS: '/reports',
  ECOMMERCE: '/ecommerce',
  CONFIG: '/config',
} as const;

/**
 * Navigation menu items
 */
export const NAVIGATION_ITEMS = [
  {
    name: 'Dashboard',
    href: PROTECTED_ROUTES.DASHBOARD,
    icon: 'HomeIcon',
    roles: ['ADMIN', 'MANAGER', 'SELLER', 'ECOMMERCE'],
  },
  {
    name: 'POS',
    href: PROTECTED_ROUTES.POS,
    icon: 'ShoppingCartIcon',
    roles: ['ADMIN', 'MANAGER', 'SELLER'],
  },
  {
    name: 'Inventario',
    href: PROTECTED_ROUTES.INVENTORY,
    icon: 'CubeIcon',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Reportes',
    href: PROTECTED_ROUTES.REPORTS,
    icon: 'ChartBarIcon',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'E-commerce',
    href: PROTECTED_ROUTES.ECOMMERCE,
    icon: 'GlobeAltIcon',
    roles: ['ADMIN', 'MANAGER', 'ECOMMERCE'],
  },
  {
    name: 'Usuarios',
    href: PROTECTED_ROUTES.USERS,
    icon: 'UsersIcon',
    roles: ['ADMIN', 'MANAGER'],
  },
  {
    name: 'Configuración',
    href: PROTECTED_ROUTES.SETTINGS,
    icon: 'CogIcon',
    roles: ['ADMIN', 'MANAGER'],
  },
] as const;
