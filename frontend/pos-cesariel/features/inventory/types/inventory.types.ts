/** Definiciones de tipos para gestión de inventario */

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export interface Brand {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

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
  brand?: string;
  is_active: boolean;
  has_sizes: boolean;
  created_at: string;
}

export interface ProductSize {
  size: string;
  stock_quantity: number;
}

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

export interface StockMovement {
  product_id: number;
  new_stock: number;
  notes: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: string;
  sku: string;
  stock_quantity: string;
  category_id: string;
  brand_id: string;
  brand: string;
  has_sizes: boolean;
}

export interface CategoryFormData {
  name: string;
  description: string;
}

export interface BrandFormData {
  name: string;
  description: string;
}

export interface StockFormData {
  new_stock: string;
  notes: string;
}

export interface ProductFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  stockFilter: 'all' | 'low' | 'out';
}

export interface InventoryStats {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoriesCount: number;
  brandsCount: number;
}

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
