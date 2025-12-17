"use client";

import { useState } from "react";
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

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  onSave: (updatedProduct: Partial<Product>) => void;
}

/**
 * ProductEditModal Component
 *
 * Modal form for editing product information for e-commerce display.
 * Allows modification of:
 * - Product name and description
 * - POS price and e-commerce specific price
 * - E-commerce visibility toggle
 *
 * The modal provides a streamlined interface for managing product
 * information specific to the online store without affecting
 * core product data.
 */
export function ProductEditModal({
  isOpen,
  onClose,
  product,
  onSave,
}: ProductEditModalProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description || "",
    price: product.price,
    ecommerce_price: product.ecommerce_price || "",
    show_in_ecommerce: product.show_in_ecommerce,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      ecommerce_price: formData.ecommerce_price
        ? Number(formData.ecommerce_price)
        : null,
      show_in_ecommerce: formData.show_in_ecommerce,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Editar Producto para E-commerce
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio POS
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    price: Number(e.target.value),
                  }))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio E-commerce
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.ecommerce_price}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    ecommerce_price: e.target.value,
                  }))
                }
                placeholder="Opcional"
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="show_in_ecommerce"
              type="checkbox"
              checked={formData.show_in_ecommerce}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  show_in_ecommerce: e.target.checked,
                }))
              }
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="show_in_ecommerce"
              className="ml-2 block text-sm text-gray-900"
            >
              Mostrar en E-commerce
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
