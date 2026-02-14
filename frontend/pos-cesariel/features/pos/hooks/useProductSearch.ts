"use client";

import { useCallback, useEffect, useState } from "react";
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

/** Hook de búsqueda y filtrado de productos: por nombre/SKU y categoría */
export function useProductSearch(token: string | null): UseProductSearchReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);

  const fetchProducts = useCallback(async () => {
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
  }, [token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // React Compiler detects pure computation and optimizes automatically
  let filteredProducts = products;

  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerSearch) ||
        product.sku.toLowerCase().includes(lowerSearch)
    );
  }

  if (selectedCategory !== null) {
    filteredProducts = filteredProducts.filter(
      (product) => product.category?.id === selectedCategory
    );
  }

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
