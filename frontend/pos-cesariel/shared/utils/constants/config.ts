/** Constantes de configuración de la aplicación */

export const APP_CONFIG = {
  NAME: 'POS Cesariel',
  DESCRIPTION: 'Sistema de Punto de Venta con E-commerce Integrado',
  VERSION: '1.0.0',
  AUTHOR: 'Ignacio Weigandt',
} as const;

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  DISPLAY_WITH_TIME: 'DD/MM/YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
  API: 'YYYY-MM-DD HH:mm:ss',
} as const;

export const CURRENCY = {
  CODE: 'ARS',
  SYMBOL: '$',
  LOCALE: 'es-AR',
  DECIMALS: 2,
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
} as const;

export const NOTIFICATION = {
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 5000,
  INFO_DURATION: 4000,
  WARNING_DURATION: 4000,
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  AUTH_STORAGE: 'auth-storage',
  THEME: 'theme',
  LANGUAGE: 'language',
  CART: 'cart',
  RECENT_SEARCHES: 'recent-searches',
} as const;

export const WEBSOCKET = {
  RECONNECT_INTERVAL: 5000,
  MAX_RECONNECT_ATTEMPTS: 5,
  PING_INTERVAL: 30000,
} as const;

export const SALE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export type SaleStatus = typeof SALE_STATUS[keyof typeof SALE_STATUS];

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  pending: 'Pendiente',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer',
  MERCADOPAGO: 'mercadopago',
  WHATSAPP: 'whatsapp',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
  mercadopago: 'Mercado Pago',
  whatsapp: 'WhatsApp',
};

export const DEFAULT_VALUES = {
  PRODUCT_IMAGE: '/images/placeholder-product.png',
  USER_AVATAR: '/images/placeholder-avatar.png',
  BRANCH_IMAGE: '/images/placeholder-branch.png',
  MIN_STOCK_ALERT: 10,
  TAX_RATE: 21,
} as const;
