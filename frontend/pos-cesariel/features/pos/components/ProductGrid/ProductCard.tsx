"use client";

import { PlusIcon } from "@heroicons/react/24/outline";
import type { Product } from "../../types/pos.types";

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
}

/**
 * Product card component for POS product selection
 *
 * Displays product information including name, price, stock status,
 * and category. Clicking the card adds the product to the cart.
 */
export function ProductCard({ product, onSelect }: ProductCardProps) {
  const isLowStock = product.stock_quantity <= product.min_stock;
  const isOutOfStock = product.stock_quantity <= 0;

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 transition-shadow cursor-pointer ${
        isOutOfStock
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md hover:border-indigo-300"
      }`}
      onClick={() => !isOutOfStock && onSelect(product)}
    >
      {/* Header: Name and Price */}
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-sm font-medium text-black line-clamp-2">
          {product.name}
        </h3>
        <span className="text-lg font-bold text-indigo-600 ml-2">
          ${Number(product.price).toFixed(2)}
        </span>
      </div>

      {/* SKU */}
      <p className="text-xs text-gray-600 mb-2">SKU: {product.sku}</p>

      {/* Footer: Stock and Category */}
      <div className="flex justify-between items-center">
        <span
          className={`text-xs font-medium ${
            isOutOfStock
              ? "text-red-600"
              : isLowStock
              ? "text-orange-600"
              : "text-gray-700"
          }`}
        >
          Stock: {product.stock_quantity}
          {isOutOfStock && " (Agotado)"}
        </span>
        {product.category && (
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
            {product.category.name}
          </span>
        )}
      </div>

      {/* Add to Cart Button */}
      {!isOutOfStock && (
        <div className="mt-2 flex items-center justify-center">
          <PlusIcon className="h-4 w-4 text-indigo-600" />
          <span className="text-xs text-indigo-600 ml-1">
            Agregar al carrito
          </span>
        </div>
      )}

      {/* Size Indicator */}
      {product.has_sizes && !isOutOfStock && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 italic">
            Tiene talles disponibles
          </span>
        </div>
      )}
    </div>
  );
}
