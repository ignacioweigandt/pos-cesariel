/**
 * Inventory Feature - Public API
 *
 * Main entry point for the inventory management module
 */

// Main container - PUBLIC API
export { InventoryContainer } from './components/InventoryContainer';

// Types
export * from './types/inventory.types';

// Hooks (for external use if needed)
export { useProducts } from './hooks/useProducts';
export { useCategories } from './hooks/useCategories';
export { useProductFilters } from './hooks/useProductFilters';
export { useMultiBranchStock } from './hooks/useMultiBranchStock';

// Utils (for external use if needed)
export * from './utils/stockCalculations';
