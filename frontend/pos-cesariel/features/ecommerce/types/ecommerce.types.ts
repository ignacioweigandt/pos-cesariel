/** Tipos para módulo e-commerce (productos, config tienda, stats) */

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
  total_online_orders?: number;
  pending_orders?: number;
  delivered_orders?: number;
}

export interface RecentSale {
  id: number;
  sale_number: string;
  customer_name: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  is_whatsapp: boolean;
}

export interface SalesByDay {
  date: string;
  count: number;
  total: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
}

export interface TopProduct {
  product_id: number;
  product_name: string;
  total_sold: number;
  revenue: number;
}

export interface LowStockAlert {
  product_id: number;
  product_name: string;
  current_stock: number;
  min_stock: number;
}

export interface DetailedDashboardData {
  stats: EcommerceStats;
  recent_sales: RecentSale[];
  sales_by_day: SalesByDay[];
  orders_by_status: OrdersByStatus[];
  top_products: TopProduct[];
  low_stock_alerts: LowStockAlert[];
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
