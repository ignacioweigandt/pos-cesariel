import { useState } from 'react';
import type { Product, ProductFilters } from '../types/inventory.types';

/** Hook para filtrado de productos por búsqueda, categoría, marca y stock */
export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedBrand: 'all',
    stockFilter: 'all',
  });

  // React Compiler detects pure computation and optimizes automatically
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesCategory =
      filters.selectedCategory === 'all' ||
      product.category_id?.toString() === filters.selectedCategory;

    const matchesBrand =
      filters.selectedBrand === 'all' ||
      product.brand_id?.toString() === filters.selectedBrand;

    const matchesStock =
      filters.stockFilter === 'all' ||
      (filters.stockFilter === 'low' &&
        product.stock_quantity <= product.min_stock &&
        product.stock_quantity > 0) ||
      (filters.stockFilter === 'out' && product.stock_quantity === 0);

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  return {
    filters,
    setFilters,
    filteredProducts,
  };
}
