/** Utilidades para cálculos de inventario y formateo de stock */

import type { Product, InventoryStats } from '../types/inventory.types';

export function calculateTotalStockValue(products: Product[]): number {
  return products.reduce((sum, product) => {
    return sum + (product.price * product.stock_quantity);
  }, 0);
}

export function countLowStockProducts(products: Product[]): number {
  return products.filter(product =>
    product.stock_quantity <= product.min_stock && product.stock_quantity > 0
  ).length;
}

export function countOutOfStockProducts(products: Product[]): number {
  return products.filter(product => product.stock_quantity === 0).length;
}

export function calculateInventoryStats(
  products: Product[],
  categoriesCount: number,
  brandsCount: number
): InventoryStats {
  return {
    totalProducts: products.length,
    lowStockCount: countLowStockProducts(products),
    outOfStockCount: countOutOfStockProducts(products),
    categoriesCount,
    brandsCount,
  };
}

export function getStockStatus(product: Product): 'out' | 'low' | 'ok' {
  if (product.stock_quantity === 0) return 'out';
  if (product.stock_quantity <= product.min_stock) return 'low';
  return 'ok';
}

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

export function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

export function formatProductPrice(product: Product): string {
  return formatCurrency(product.price);
}
