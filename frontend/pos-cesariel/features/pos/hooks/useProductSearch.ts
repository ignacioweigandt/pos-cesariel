"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/shared/api/client";
import type { Product } from "../types/pos.types";

interface UseProductSearchReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: number | null;
  setSelectedCategory: (categoryId: number | null) => void;
  filteredProducts: Product[];
  refetchProducts: () => Promise<void>;
}

/**
 * Hook for managing product search and filtering
 *
 * Handles fetching products from the API, searching by name/SKU,
 * and filtering by category.
 *
 * @param token - Authentication token
 * @returns Product search state and operations
 */
export function useProductSearch(token: string | null): UseProductSearchReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  /**
   * Fetch products from backend
   */
  const fetchProducts = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get("/products/");
      setProducts(response.data);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Error al cargar productos");

      // Set demo products for development
      setProducts([
        {
          id: 1,
          name: "Producto Demo 1",
          price: 10.99,
          sku: "DEMO001",
          stock_quantity: 50,
          min_stock: 10,
          category: { id: 1, name: "Categoría Demo" },
        },
        {
          id: 2,
          name: "Producto Demo 2",
          price: 25.5,
          sku: "DEMO002",
          stock_quantity: 30,
          min_stock: 5,
          category: { id: 1, name: "Categoría Demo" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchProducts();
  }, [token]);

  /**
   * Filter products based on search term and category
   */
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search term (name or SKU)
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(lowerSearch) ||
          product.sku.toLowerCase().includes(lowerSearch)
      );
    }

    // Filter by category
    if (selectedCategory !== null) {
      filtered = filtered.filter(
        (product) => product.category?.id === selectedCategory
      );
    }

    return filtered;
  }, [products, searchTerm, selectedCategory]);

  return {
    products,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredProducts,
    refetchProducts: fetchProducts,
  };
}
