import type { CartItem, CartTotals } from "../types/pos.types";

/** Calcular totales del carrito (subtotal, impuestos, total) */
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

/** Calcular total de un item individual */
export function calculateItemTotal(item: CartItem): number {
  return Number(item.price) * item.quantity;
}

/** Formatear valor como moneda */
export function formatCurrency(value: number, currency: string = "$"): string {
  return `${currency}${value.toFixed(2)}`;
}

/** Calcular vuelto al pagar con efectivo */
export function calculateChange(
  total: number,
  amountReceived: number
): number {
  const change = amountReceived - total;
  return change > 0 ? change : 0;
}

/** Validar carrito antes de checkout */
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
