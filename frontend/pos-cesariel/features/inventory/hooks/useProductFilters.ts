import { useState, useMemo } from 'react';
import type { Product, ProductFilters } from '../types/inventory.types';

/**
 * useProductFilters Hook
 *
 * Manages product filtering logic
 */
export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedBrand: 'all',
    stockFilter: 'all',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      const matchesSearch =
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.selectedCategory === 'all' ||
        product.category_id?.toString() === filters.selectedCategory;

      // Brand filter
      const matchesBrand =
        filters.selectedBrand === 'all' ||
        product.brand_id?.toString() === filters.selectedBrand;

      // Stock filter
      const matchesStock =
        filters.stockFilter === 'all' ||
        (filters.stockFilter === 'low' &&
          product.stock_quantity <= product.min_stock &&
          product.stock_quantity > 0) ||
        (filters.stockFilter === 'out' && product.stock_quantity === 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesStock;
    });
  }, [products, filters]);

  return {
    filters,
    setFilters,
    filteredProducts,
  };
}
