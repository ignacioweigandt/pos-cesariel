import { useState, useMemo } from 'react';
import { Product } from '../types/ecommerce.types';

export interface ProductFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string; // Puede ser 'all' o el ID de la marca como string
  onlineStatus: 'all' | 'online' | 'offline';
  stockFilter: 'all' | 'instock' | 'outofstock';
}

/**
 * Hook para gestionar el filtrado de productos en el módulo e-commerce admin
 */
export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<ProductFilters>({
    searchTerm: '',
    selectedCategory: 'all',
    selectedBrand: 'all',
    onlineStatus: 'all',
    stockFilter: 'all',
  });

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Búsqueda por texto (nombre o descripción)
      const matchesSearch =
        product.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        (product.description?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ?? false);

      // Filtro por categoría
      const matchesCategory =
        filters.selectedCategory === 'all' ||
        product.category?.name === filters.selectedCategory;

      // Filtro por marca (usando brand_id, el sistema nuevo)
      const matchesBrand =
        filters.selectedBrand === 'all' ||
        product.brand_id?.toString() === filters.selectedBrand;

      // Filtro por estado online
      const matchesOnlineStatus =
        filters.onlineStatus === 'all' ||
        (filters.onlineStatus === 'online' && product.show_in_ecommerce) ||
        (filters.onlineStatus === 'offline' && !product.show_in_ecommerce);

      // Filtro por stock
      const stock = product.stock_quantity ?? product.stock ?? 0;
      const matchesStock =
        filters.stockFilter === 'all' ||
        (filters.stockFilter === 'instock' && stock > 0) ||
        (filters.stockFilter === 'outofstock' && stock === 0);

      return matchesSearch && matchesCategory && matchesBrand && matchesOnlineStatus && matchesStock;
    });
  }, [products, filters]);

  return {
    filters,
    setFilters,
    filteredProducts,
  };
}
