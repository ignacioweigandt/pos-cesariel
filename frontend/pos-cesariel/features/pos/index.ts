/**
 * POS Module - Public API
 *
 * Point of Sale functionality including product selection,
 * cart management, barcode scanning, and checkout processing.
 */

// Main container - Primary export
export { POSContainer } from "./components/POSContainer";

// Types
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

// Hooks - For external use if needed
export { useCart } from "./hooks/useCart";
export { useProductSearch } from "./hooks/useProductSearch";
export { useSaleProcessing } from "./hooks/useSaleProcessing";
export { useBarcodeScanner } from "./hooks/useBarcodeScanner";
export { usePOSKeyboard } from "./hooks/usePOSKeyboard";

// Utilities
export {
  calculateCartTotals,
  calculateItemTotal,
  formatCurrency,
  calculateChange,
  validateCart,
} from "./utils/cartCalculations";

// Print utilities
export { printThermalTicket, isPrintSupported, printTicketWithLoading } from "./utils/printTicket";

// Components
export { default as ThermalTicket } from "./components/ThermalTicket";
