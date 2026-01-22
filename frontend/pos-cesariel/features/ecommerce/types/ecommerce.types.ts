/**
 * E-commerce Type Definitions
 */

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  stock?: number;
  image_url?: string;
  is_active: boolean;
  show_in_ecommerce: boolean;
  ecommerce_price?: number;
  has_sizes?: boolean;
  brand_id?: number;
  brand?: string;
  category?: {
    id: number;
    name: string;
  };
}

export interface StoreConfig {
  store_name: string;
  store_description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  tax_percentage: number;
  currency: string;
}

export interface EcommerceStats {
  total_online_products: number;
  total_online_sales: number;
  conversion_rate: number;
}

export interface EcommerceState {
  products: Product[];
  storeConfig: StoreConfig | null;
  stats: EcommerceStats;
  loading: boolean;
}

export interface TabProps {
  onSaleCompleted?: () => void;
  refreshTrigger?: number;
}
