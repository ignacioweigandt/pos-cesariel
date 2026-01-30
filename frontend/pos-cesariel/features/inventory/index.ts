/** API pública del módulo Inventory */

export { InventoryContainer } from './components/InventoryContainer';
export * from './types/inventory.types';
export { useProducts } from './hooks/useProducts';
export { useCategories } from './hooks/useCategories';
export { useProductFilters } from './hooks/useProductFilters';
export { useMultiBranchStock } from './hooks/useMultiBranchStock';
export * from './utils/stockCalculations';
