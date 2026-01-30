/** Tipos del módulo POS (Punto de Venta) */

export interface ProductCategory {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock_quantity: number;
  min_stock: number;
  has_sizes?: boolean;
  category?: ProductCategory;
}

export interface ProductSize {
  size: string;
  stock_quantity: number;
}

export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
}

export interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

export interface PaymentData {
  payment_method: PaymentMethod;
  card_type?: string;
  installments?: number;
  total: number;
}

export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  size?: string;
}

export interface SaleData {
  sale_type: "POS" | "ECOMMERCE";
  payment_method: PaymentMethod;
  order_status: "PENDING" | "COMPLETED" | "CANCELLED";
  branch_id: number;
  items: SaleItem[];
}

export interface SaleResult {
  id: number;
  sale_type: string;
  payment_method: string;
  total: number;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    size?: string;
  }>;
}

export interface SaleConfirmationData {
  id: number;
  paymentMethod: string;
  cardType?: string;
  installments?: number;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface InventoryChangeMessage {
  type: "inventory_change";
  product_id: number;
  new_stock: number;
}

export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
