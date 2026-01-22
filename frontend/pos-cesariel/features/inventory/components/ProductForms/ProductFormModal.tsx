'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import type { Product, Category, Brand, ProductFormData } from '../../types/inventory.types';
import { BarcodeInput } from './BarcodeInput';

interface ProductFormModalProps {
  isOpen: boolean;
  product: Product | null;
  categories: Category[];
  brands: Brand[];
  onClose: () => void;
  onSave: (productData: any) => Promise<void>;
  onNewBrand: () => void;
}

/**
 * ProductFormModal Component
 *
 * Modal for creating or editing products with full form:
 * - Name, description
 * - Price, SKU
 * - Stock quantity, minimum stock
 * - Category selection
 * - Has sizes checkbox
 */
export function ProductFormModal({
  isOpen,
  product,
  categories,
  brands,
  onClose,
  onSave,
  onNewBrand,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    sku: '',
    stock_quantity: '',
    category_id: '',
    brand_id: '',
    brand: '',
    has_sizes: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Función para resetear el formulario
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      sku: '',
      stock_quantity: '0',
      category_id: '',
      brand_id: '',
      brand: '',
      has_sizes: false,
    });
  };

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price.toString(),
        sku: product.sku,
        stock_quantity: product.stock_quantity.toString(),
        category_id: product.category_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        brand: product.brand || '',
        has_sizes: product.has_sizes || false,
      });
    } else {
      resetForm();
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price),
        sku: formData.sku,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        min_stock: 10, // Stock mínimo fijo en 10
        category_id: formData.category_id
          ? parseInt(formData.category_id)
          : null,
        brand_id: formData.brand_id
          ? parseInt(formData.brand_id)
          : null,
        brand: formData.brand || null, // LEGACY: mantener por compatibilidad
        has_sizes: formData.has_sizes,
      };

      await onSave(productData);

      // Si estamos creando (no editando), limpiar el formulario
      if (!product) {
        resetForm();
      }

      onClose();
    } catch (error) {
      console.error('Error submitting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {product ? 'Editar Producto' : 'Nuevo Producto'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: e.target.value,
                  })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Barcode Scanner Input */}
            <BarcodeInput
              value={formData.sku}
              onChange={(value) =>
                setFormData({ ...formData, sku: value })
              }
              required
            />

            {/* Stock Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Stock Inicial
              </label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stock_quantity: e.target.value,
                  })
                }
                disabled={formData.has_sizes}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.has_sizes
                  ? 'Los productos con talles deben cargar el stock por cada talle desde "Gestionar Talles"'
                  : 'El stock se agregará a tu sucursal actual'}
              </p>
            </div>

            {/* Category and Brand */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Categoría
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sin categoría</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Marca
                  </label>
                  <button
                    type="button"
                    onClick={onNewBrand}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <PlusIcon className="h-3 w-3 mr-1" />
                    Nueva
                  </button>
                </div>
                <select
                  value={formData.brand_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brand_id: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Sin marca</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Has Sizes Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_sizes"
                checked={formData.has_sizes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    has_sizes: e.target.checked,
                    // Resetear stock a 0 cuando se marca "con talles"
                    stock_quantity: e.target.checked ? '0' : formData.stock_quantity,
                  })
                }
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label
                htmlFor="has_sizes"
                className="ml-2 block text-sm text-gray-900"
              >
                Producto con talles (indumentaria/calzado)
              </label>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Guardando...'
                  : product
                  ? 'Actualizar'
                  : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
