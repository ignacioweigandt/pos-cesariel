/**
 * Inventory Types
 *
 * Type definitions for the inventory management system
 */

/**
 * Product Category
 */
export interface Category {
  id: number;
  name: string;
  description?: string;
}

/**
 * Product Brand
 */
export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Product entity with all fields
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock_quantity: number;
  min_stock: number;
  category_id?: number;
  category?: Category;
  brand_id?: number;
  brand_rel?: Brand;
  brand?: string; // LEGACY: mantener por compatibilidad
  is_active: boolean;
  has_sizes: boolean;
  created_at: string;
}

/**
 * Product size variant (for apparel/footwear)
 */
export interface ProductSize {
  size: string;
  stock_quantity: number;
}

/**
 * Multi-branch product stock data
 */
export interface BranchStock {
  branch_id: number;
  branch_name: string;
  stock_quantity: number;
}

export interface MultiBranchProduct {
  id: number;
  name: string;
  total_stock: number;
  branch_stocks: BranchStock[];
}

/**
 * Stock movement/adjustment
 */
export interface StockMovement {
  product_id: number;
  new_stock: number;
  notes: string;
}

/**
 * Product form data
 */
export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sku: string;
  stock_quantity: string;
  category_id: string;
  brand_id: string;
  brand: string; // LEGACY: mantener por compatibilidad
  has_sizes: boolean;
}

/**
 * Category form data
 */
export interface CategoryFormData {
  name: string;
  description: string;
}

/**
 * Brand form data
 */
export interface BrandFormData {
  name: string;
  description: string;
}

/**
 * Stock adjustment form data
 */
export interface StockFormData {
  new_stock: string;
  notes: string;
}

/**
 * Filter state for product list
 */
export interface ProductFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  stockFilter: 'all' | 'low' | 'out';
}

/**
 * Inventory statistics
 */
export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoriesCount: number;
  brandsCount: number;
}

/**
 * Import data interface
 */
export interface ImportError {
  row: number;
  error: string;
}

export interface ImportResult {
  import_log_id: number;
  message: string;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  errors: ImportError[];
}
