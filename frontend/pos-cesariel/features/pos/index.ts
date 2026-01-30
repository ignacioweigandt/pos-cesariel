/** Módulo POS: selección de productos, carrito, scanner, checkout */

export { POSContainer } from "./components/POSContainer";

export type {
  Product,
  ProductCategory,
  ProductSize,
  CartItem,
  PaymentConfig,
  PaymentMethod,
  PaymentData,
  SaleItem,
  SaleData,
  SaleResult,
  SaleConfirmationData,
  InventoryChangeMessage,
  CartTotals,
} from "./types/pos.types";

export { useCart } from "./hooks/useCart";
export { useProductSearch } from "./hooks/useProductSearch";
export { useSaleProcessing } from "./hooks/useSaleProcessing";
export { useBarcodeScanner } from "./hooks/useBarcodeScanner";
export { usePOSKeyboard } from "./hooks/usePOSKeyboard";

export {
  calculateCartTotals,
  calculateItemTotal,
  formatCurrency,
  calculateChange,
  validateCart,
} from "./utils/cartCalculations";

export { printThermalTicket, isPrintSupported, printTicketWithLoading } from "./utils/printTicket";

export { default as ThermalTicket } from "./components/ThermalTicket";
