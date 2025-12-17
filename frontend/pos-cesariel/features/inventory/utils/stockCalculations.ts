/**
 * Stock Calculation Utilities
 *
 * Helper functions for inventory calculations and formatting
 */

import type { Product, InventoryStats } from '../types/inventory.types';

/**
 * Calculate total value of inventory
 */
export function calculateTotalStockValue(products: Product[]): number {
  return products.reduce((sum, product) => {
    return sum + (product.price * product.stock_quantity);
  }, 0);
}

/**
 * Count products with low stock
 */
export function countLowStockProducts(products: Product[]): number {
  return products.filter(product =>
    product.stock_quantity <= product.min_stock && product.stock_quantity > 0
  ).length;
}

/**
 * Count products out of stock
 */
export function countOutOfStockProducts(products: Product[]): number {
  return products.filter(product => product.stock_quantity === 0).length;
}

/**
 * Calculate inventory statistics
 */
export function calculateInventoryStats(
  products: Product[],
  categoriesCount: number
): InventoryStats {
  return {
    totalProducts: products.length,
    lowStockCount: countLowStockProducts(products),
    outOfStockCount: countOutOfStockProducts(products),
    categoriesCount,
  };
}

/**
 * Get stock status for a product
 */
export function getStockStatus(product: Product): 'out' | 'low' | 'ok' {
  if (product.stock_quantity === 0) return 'out';
  if (product.stock_quantity <= product.min_stock) return 'low';
  return 'ok';
}

/**
 * Get stock status label
 */
export function getStockStatusLabel(product: Product): string {
  const status = getStockStatus(product);
  switch (status) {
    case 'out':
      return 'Sin stock';
    case 'low':
      return 'Stock bajo';
    default:
      return '';
  }
}

/**
 * Get stock status color class
 */
export function getStockStatusColor(product: Product): string {
  const status = getStockStatus(product);
  switch (status) {
    case 'out':
      return 'bg-red-100 text-red-800';
    case 'low':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-green-100 text-green-800';
  }
}

/**
 * Format currency value
 */
export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

/**
 * Format product price
 */
export function formatProductPrice(product: Product): string {
  return formatCurrency(product.price);
}
