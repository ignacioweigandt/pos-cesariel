import type { PaymentMethod, CardType } from './useCartKeyboard';

interface CartItem {
  price: number;
  quantity: number;
}

interface PaymentConfig {
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
}

interface CartTotals {
  subtotal: number;
  surcharge: number;
  tax: number;
  total: number;
  surchargePercentage: number;
  taxPercentage: number;
}

/**
 * Hook para calcular totales del carrito con recargos e impuestos configurables
 */
export function useCartCalculations(
  cart: CartItem[],
  selectedPayment: PaymentMethod,
  selectedCardType: CardType,
  selectedInstallments: number,
  paymentConfigs: PaymentConfig[],
  taxRate: number = 0 // Tasa de impuesto configurable desde la BD
): CartTotals {
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  let surchargePercentage = 0;
  if (selectedPayment === 'tarjeta') {
    const config = paymentConfigs.find(
      (c) =>
        c.payment_type === 'tarjeta' &&
        c.card_type === selectedCardType &&
        c.installments === selectedInstallments
    );
    if (config) {
      surchargePercentage = Number(config.surcharge_percentage);
    }
  }

  const surcharge = subtotal * (surchargePercentage / 100);
  const tax = subtotal * (taxRate / 100); // Usar tasa de impuesto configurable
  const total = subtotal + surcharge + tax;

  return { subtotal, surcharge, tax, total, surchargePercentage, taxPercentage: taxRate };
}
