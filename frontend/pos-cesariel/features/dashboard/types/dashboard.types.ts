export interface DashboardStats {
  total_sales_today: number;
  total_sales_month: number;
  total_products: number;
  low_stock_products: number;
  active_branches: number;
  total_users: number;
}

export interface StatCard {
  name: string;
  value: string | number;
  icon: any;
  color: string;
}

export interface ModuleCardData {
  title: string;
  description: string;
  icon: any;
  href: string;
  color: string;
  module: string;
  available: boolean;
}

export interface QuickAction {
  title: string;
  description: string;
  href: string;
  color: string;
  icon?: any;
}
