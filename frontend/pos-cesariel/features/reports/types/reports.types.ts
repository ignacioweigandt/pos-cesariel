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
  value: number;
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
