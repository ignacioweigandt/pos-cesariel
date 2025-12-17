"use client";

import type { Product } from "../../types/pos.types";
import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  onProductSelect: (product: Product) => void;
}

/**
 * Product grid component for displaying available products
 *
 * Shows products in a responsive grid layout with loading and empty states.
 */
export function ProductGrid({
  products,
  loading,
  onProductSelect,
}: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">No se encontraron productos</p>
        <p className="text-sm mt-2">
          Intenta con otros términos de búsqueda o categorías
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onSelect={onProductSelect}
        />
      ))}
    </div>
  );
}
