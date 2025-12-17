"use client";

import { XMarkIcon } from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  stock?: number;
  image_url?: string;
  is_active: boolean;
  show_in_ecommerce: boolean;
  ecommerce_price?: number;
  has_sizes?: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface ProductViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

/**
 * ProductViewModal Component
 *
 * Read-only modal for viewing detailed product information.
 * Displays:
 * - Product name and description
 * - POS and e-commerce prices
 * - Available stock
 * - E-commerce visibility status
 * - Product image (if available)
 *
 * This modal provides a quick way to review all product details
 * without the ability to edit, useful for verification purposes.
 */
export function ProductViewModal({
  isOpen,
  onClose,
  product,
}: ProductViewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Detalles del Producto
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">
              Nombre
            </label>
            <p className="mt-1 text-sm text-gray-900">{product.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Descripción
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {product.description || "Sin descripción"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Precio POS
              </label>
              <p className="mt-1 text-sm text-gray-900">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500">
                Precio E-commerce
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {product.ecommerce_price
                  ? `$${Number(product.ecommerce_price).toFixed(2)}`
                  : "Sin precio específico"}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Stock Disponible
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {product.stock || product.stock_quantity} unidades
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-500">
              Estado en E-commerce
            </label>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.show_in_ecommerce
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {product.show_in_ecommerce ? "Visible Online" : "Oculto"}
              </span>
            </div>
          </div>

          {product.image_url && (
            <div>
              <label className="block text-sm font-medium text-gray-500">
                Imagen
              </label>
              <div className="mt-1">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="h-20 w-20 object-cover rounded-md border border-gray-200"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
