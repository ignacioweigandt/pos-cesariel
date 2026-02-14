export interface SalesReport {
  period: string;
  total_sales: number;
  total_transactions: number;
  average_sale: number;
  top_products: TopProduct[];
  sales_by_branch: BranchSales[];
}

export interface TopProduct {
  name: string;
  quantity: number;
  revenue: number;
}

export interface BranchSales {
  branch_name: string;
  total_sales: number;
  total_transactions: number;
}

export interface DashboardStats {
  total_sales_today: number;
  total_sales_month: number;
  total_products: number;
  low_stock_products: number;
  active_branches: number;
  total_users: number;
}

export interface DailySales {
  date: string;
  sales: number;
  transactions: number;
}

export interface ChartData {
  name: string;
  value: number | string; // Backend sends Decimal as string
}

export interface DateRange {
  start: string;
  end: string;
}

export interface ReportFilters {
  startDate: string;
  endDate: string;
  reportType: "sales" | "products" | "branches";
}

export interface TopBrand {
  brand_id: number;
  brand_name: string;
  products_count: number;
  quantity_sold: number;
  total_revenue: number;
}

export interface PaymentMethodData {
  payment_method: string;
  total_sales: number;
  transaction_count: number;
}

export interface SaleTypeData {
  sale_type: string;
  total_sales: number;
  transaction_count: number;
}

export interface DetailedSalesReport extends SalesReport {
  sales_by_payment_method: PaymentMethodData[];
  sales_by_type: SaleTypeData[];
}

export interface Branch {
  id: number;
  name: string;
  address?: string;
  is_active?: boolean;
}

export interface BranchData {
  branch_id: number;
  branch_name: string;
  total_sales: number;
  orders_count: number;
}

export type ReportTab = 
  | 'summary' 
  | 'sales' 
  | 'products' 
  | 'brands' 
  | 'branches' 
  | 'payment-methods' 
  | 'ecommerce';

export interface MetricCardData {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
}
