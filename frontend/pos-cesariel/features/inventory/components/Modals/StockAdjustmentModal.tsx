'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Product, StockFormData } from '../../types/inventory.types';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
  onSave: (stockData: { new_stock: number; notes: string }) => Promise<void>;
}

/**
 * StockAdjustmentModal Component
 *
 * Modal for adjusting product stock:
 * - Shows current stock and minimum stock
 * - New stock input
 * - Notes for adjustment reason
 */
export function StockAdjustmentModal({
  isOpen,
  product,
  onClose,
  onSave,
}: StockAdjustmentModalProps) {
  const [formData, setFormData] = useState<StockFormData>({
    new_stock: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        new_stock: product.stock_quantity.toString(),
        notes: '',
      });
    } else {
      setFormData({
        new_stock: '',
        notes: '',
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const stockData = {
        new_stock: parseInt(formData.new_stock),
        notes: formData.notes,
      };

      await onSave(stockData);
      onClose();
    } catch (error) {
      console.error('Error submitting stock adjustment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Ajustar Stock - {product.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Current Stock Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              Stock actual:{' '}
              <span className="font-medium">
                {product.stock_quantity}
              </span>
            </p>
            <p className="text-sm text-gray-600">
              Stock mínimo:{' '}
              <span className="font-medium">{product.min_stock}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New Stock */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nuevo Stock *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.new_stock}
                onChange={(e) =>
                  setFormData({ ...formData, new_stock: e.target.value })
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Motivo del ajuste de stock..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
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
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Ajustando...' : 'Ajustar Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
