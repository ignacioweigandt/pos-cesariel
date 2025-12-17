/**
 * POS Module Types
 * Type definitions for the Point of Sale system
 */

/**
 * Product category information
 */
export interface ProductCategory {
  id: number;
  name: string;
}

/**
 * Product information for POS
 */
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

/**
 * Product size information with stock
 */
export interface ProductSize {
  size: string;
  stock_quantity: number;
}

/**
 * Item in the shopping cart
 */
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
}

/**
 * Payment configuration options
 */
export interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

/**
 * Payment method types
 */
export type PaymentMethod = "CASH" | "CARD" | "TRANSFER";

/**
 * Payment data for sale processing
 */
export interface PaymentData {
  payment_method: PaymentMethod;
  card_type?: string;
  installments?: number;
  total: number;
}

/**
 * Sale item for backend submission
 */
export interface SaleItem {
  product_id: number;
  quantity: number;
  unit_price: number;
  size?: string;
}

/**
 * Sale data for backend submission
 */
export interface SaleData {
  sale_type: "POS" | "ECOMMERCE";
  payment_method: PaymentMethod;
  order_status: "PENDING" | "COMPLETED" | "CANCELLED";
  branch_id: number;
  items: SaleItem[];
}

/**
 * Sale result from backend
 */
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

/**
 * Sale confirmation data for display
 */
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

/**
 * WebSocket inventory change message
 */
export interface InventoryChangeMessage {
  type: "inventory_change";
  product_id: number;
  new_stock: number;
}

/**
 * Cart totals calculation result
 */
export interface CartTotals {
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}
