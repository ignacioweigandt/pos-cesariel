// API Response Types - Backend POS Cesariel

// ===== PRODUCTOS =====
export interface ApiProduct {
  id: number;
  name: string;
  description: string | null;
  sku: string;
  barcode: string | null;
  category_id: number;
  price: number;
  cost: number | null;
  stock_quantity: number;
  stock?: number;
  min_stock: number;
  is_active: boolean;
  show_in_ecommerce: boolean;
  ecommerce_price: number | null;
  image_url: string | null;
  has_sizes: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  category?: ApiCategory;
  sizes?: ApiProductSize[];
  images?: ApiProductImage[];
}

// Public API Product (from /ecommerce/products endpoint)
export interface ApiPublicProduct {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  featured: boolean;
  is_active: boolean;
  show_in_ecommerce: boolean;
  category_id: number;
  image_url: string | null;
  has_sizes: boolean;
  created_at: string;
  // Optional relations
  category?: { id: number; name: string };
  images?: { id: number; image_url: string; order: number }[];
}

export interface ApiProductSize {
  id: number;
  product_id: number;
  branch_id: number;
  size: string;
  stock_quantity: number;
}

export interface ApiProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  order: number;
}

// ===== CATEGORÍAS =====
export interface ApiCategory {
  id: number;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== BANNERS =====
export interface ApiBanner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  order: number;
}

// Public API Banner (from /ecommerce/banners endpoint)
export interface ApiPublicBanner {
  id: string; // String ID in public endpoint
  title: string;
  subtitle: string | null;
  image: string; // Different field name
  link: string | null; // Different field name
  button_text: string | null;
  active: boolean; // Different field name
  order: number;
}

// ===== VENTAS =====
export interface ApiSale {
  id: number;
  sale_number: string;
  sale_type: 'pos' | 'ecommerce';
  branch_id: number;
  user_id: number | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  order_status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones
  sale_items?: ApiSaleItem[];
}

export interface ApiSaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
  size: string | null;
  // Relaciones
  product?: ApiProduct;
}

// ===== CONFIGURACIÓN E-COMMERCE =====
export interface ApiEcommerceConfig {
  id: number;
  store_name: string;
  store_description: string | null;
  store_email: string | null;
  store_phone: string | null;
  store_address: string | null;
  currency: string;
  tax_rate: number;
  shipping_cost: number;
  free_shipping_minimum: number;
  is_active: boolean;
}

// ===== SUCURSALES =====
export interface ApiBranch {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ===== USUARIOS =====
export interface ApiUser {
  id: number;
  email: string;
  username: string;
  full_name: string;
  role: 'admin' | 'manager' | 'seller' | 'ecommerce';
  branch_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Relaciones
  branch?: ApiBranch;
}

// ===== REQUESTS =====
export interface CreateSaleRequest {
  sale_type: 'ecommerce';
  customer_name: string;
  customer_email?: string;
  customer_phone: string;
  notes?: string;
  payment_method: string;
  items: CreateSaleItemRequest[];
}

export interface CreateSaleItemRequest {
  product_id: number;
  quantity: number;
  unit_price: number;
  size?: string;
}

// ===== RESPONSES =====
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  detail?: string;
  status?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  per_page: number;
}
