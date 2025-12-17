/**
 * Definiciones de tipos TypeScript para el sistema POS Cesariel.
 * 
 * Este archivo centraliza todas las interfaces y tipos utilizados
 * en el frontend administrativo del sistema POS.
 */

/**
 * Roles de usuario disponibles en el sistema
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SELLER = 'SELLER',
  ECOMMERCE = 'ECOMMERCE'
}

/**
 * Estados posibles de una venta
 */
export enum SaleStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

/**
 * Tipos de venta
 */
export enum SaleType {
  POS = 'POS',
  ECOMMERCE = 'ECOMMERCE'
}

/**
 * Métodos de pago disponibles
 */
export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  TRANSFER = 'TRANSFER',
  MULTIPLE = 'MULTIPLE'
}

/**
 * Interface para Usuario del sistema
 */
export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  branch_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  branch?: Branch;
}

/**
 * Interface para Sucursal
 */
export interface Branch {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  manager_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manager?: User;
}

/**
 * Interface para Categoría de productos
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
  parent_id?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parent?: Category;
  children?: Category[];
}

/**
 * Interface para Producto
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  price: number;
  cost: number;
  stock: number;
  min_stock: number;
  category_id?: number;
  brand?: string;
  size?: string;
  color?: string;
  weight?: number;
  dimensions?: string;
  image_url?: string;
  show_in_ecommerce: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  stock_movements?: InventoryMovement[];
}

/**
 * Interface para Movimiento de Inventario
 */
export interface InventoryMovement {
  id: number;
  product_id: number;
  movement_type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  reference_id?: number;
  branch_id: number;
  user_id: number;
  created_at: string;
  product?: Product;
  branch?: Branch;
  user?: User;
}

/**
 * Interface para Venta
 */
export interface Sale {
  id: number;
  sale_number: string;
  sale_type: SaleType;
  status: SaleStatus;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  payment_method: PaymentMethod;
  notes?: string;
  branch_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  items: SaleItem[];
  branch?: Branch;
  user?: User;
}

/**
 * Interface para Item de Venta
 */
export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage?: number;
  discount_amount?: number;
  product?: Product;
}

/**
 * Interface para respuestas de API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: string;
}

/**
 * Interface para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current_page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
    has_previous: boolean;
    has_next: boolean;
  };
}

/**
 * Interface para filtros de búsqueda
 */
export interface SearchFilters {
  query?: string;
  category_id?: number;
  is_active?: boolean;
  show_in_ecommerce?: boolean;
  branch_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

/**
 * Interface para estadísticas del dashboard
 */
export interface DashboardStats {
  total_sales_today: number;
  total_revenue_today: number;
  total_products: number;
  low_stock_products: number;
  sales_by_hour: Array<{
    hour: number;
    sales: number;
    revenue: number;
  }>;
  top_products: Array<{
    product: Product;
    quantity_sold: number;
    revenue: number;
  }>;
  sales_by_payment_method: Array<{
    payment_method: PaymentMethod;
    count: number;
    total: number;
  }>;
}

/**
 * Interface para configuración de E-commerce
 */
export interface EcommerceConfig {
  id: number;
  store_name: string;
  store_description?: string;
  store_logo?: string;
  primary_color: string;
  secondary_color: string;
  currency: string;
  tax_rate: number;
  shipping_enabled: boolean;
  shipping_cost: number;
  free_shipping_threshold?: number;
  whatsapp_number?: string;
  instagram_url?: string;
  facebook_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Interface para notificaciones en tiempo real
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

/**
 * Interface para items del carrito (POS)
 */
export interface CartItem {
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percentage?: number;
  discount_amount?: number;
}

/**
 * Interface para el estado del carrito
 */
export interface CartState {
  items: CartItem[];
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  payment_method?: PaymentMethod;
  notes?: string;
}

/**
 * Interface para formularios de creación/edición
 */
export interface FormState {
  isLoading: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

/**
 * Type para permisos de usuario
 */
export type UserPermissions = {
  pos: boolean;
  inventory: boolean;
  reports: boolean;
  users: boolean;
  settings: boolean;
  ecommerce: boolean;
  branches: boolean;
};

/**
 * Type para estado de carga
 */
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';

/**
 * Interface para estado global de la aplicación
 */
export interface AppState {
  user: User | null;
  branch: Branch | null;
  permissions: UserPermissions;
  isAuthenticated: boolean;
  isLoading: boolean;
  notifications: Notification[];
  cart: CartState;
}