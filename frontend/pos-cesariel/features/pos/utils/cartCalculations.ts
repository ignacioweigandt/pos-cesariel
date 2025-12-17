import type { CartItem, CartTotals } from "../types/pos.types";

/**
 * Calculate cart totals including subtotal, tax, and total
 *
 * @param cartItems - Array of cart items
 * @param taxRate - Tax rate as decimal (e.g., 0.1 for 10%)
 * @returns Cart totals object
 */
export function calculateCartTotals(
  cartItems: CartItem[],
  taxRate: number = 0
): CartTotals {
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const itemCount = cartItems.length;

  return {
    subtotal,
    tax,
    total,
    itemCount,
  };
}

/**
 * Calculate total for a single cart item
 *
 * @param item - Cart item
 * @returns Total price for the item
 */
export function calculateItemTotal(item: CartItem): number {
  return Number(item.price) * item.quantity;
}

/**
 * Format currency value for display
 *
 * @param value - Numeric value to format
 * @param currency - Currency symbol (default: $)
 * @returns Formatted currency string
 */
export function formatCurrency(value: number, currency: string = "$"): string {
  return `${currency}${value.toFixed(2)}`;
}

/**
 * Calculate change when paying with cash
 *
 * @param total - Total amount to pay
 * @param amountReceived - Amount received from customer
 * @returns Change to return to customer
 */
export function calculateChange(
  total: number,
  amountReceived: number
): number {
  const change = amountReceived - total;
  return change > 0 ? change : 0;
}

/**
 * Validate cart before checkout
 *
 * @param cartItems - Array of cart items
 * @returns Object with validation result and error message if invalid
 */
export function validateCart(cartItems: CartItem[]): {
  isValid: boolean;
  error?: string;
} {
  if (cartItems.length === 0) {
    return {
      isValid: false,
      error: "El carrito está vacío",
    };
  }

  // Check if all items have valid quantities
  for (const item of cartItems) {
    if (item.quantity <= 0) {
      return {
        isValid: false,
        error: `La cantidad de ${item.product.name} debe ser mayor a 0`,
      };
    }

    if (item.quantity > item.product.stock_quantity) {
      return {
        isValid: false,
        error: `No hay suficiente stock de ${item.product.name}`,
      };
    }
  }

  return { isValid: true };
}
