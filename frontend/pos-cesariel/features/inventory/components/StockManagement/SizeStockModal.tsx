'use client';

import { useEffect, useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useSizeStock } from '@/features/inventory/hooks/useSizeStock';
import { useProductBranchStock } from '@/features/inventory/hooks/useProductBranchStock';
import { EditSizeStockView } from './_views/EditSizeStockView';
import { MultiBranchStockView } from './_views/MultiBranchStockView';

interface Product {
  id: number;
  name: string;
  category?: {
    name: string;
  };
}

interface SizeStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onUpdateSuccess: () => void;
}

/**
 * Modal de gestión de stock por talles
 * Componente refactorizado con separación de vistas
 */
export default function SizeStockModal({
  isOpen,
  onClose,
  product,
  onUpdateSuccess,
}: SizeStockModalProps) {
  const [viewMode, setViewMode] = useState<'edit' | 'view'>('edit');

  // Hooks
  const sizeStock = useSizeStock(product?.id || null, product?.category?.name);
  const branchStock = useProductBranchStock(product?.id || null);

  // Cargar talles cuando se abre el modal
  useEffect(() => {
    if (isOpen && product) {
      sizeStock.loadSizes();
    }
  }, [isOpen, product]);

  const handleSave = async () => {
    const success = await sizeStock.saveSizes();
    if (success) {
      onUpdateSuccess();
      handleClose();
    }
  };

  const handleClose = () => {
    sizeStock.reset();
    branchStock.reset();
    setViewMode('edit');
    onClose();
  };

  const handleViewModeChange = (mode: 'edit' | 'view') => {
    setViewMode(mode);
    if (mode === 'view') {
      branchStock.loadMultiBranchSizes();
    }
  };

  if (!isOpen || !product) return null;

  const availableSizes = sizeStock.getAvailableSizes();
  const isShoeCategory =
    sizeStock.availableSizesData?.category_type === 'calzado' ||
    product.category?.name.toLowerCase().includes('calzado');
  const categoryDisplayName =
    sizeStock.availableSizesData?.size_type_label ||
    (isShoeCategory ? 'Calzado' : 'Indumentaria');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Gestión de Stock por Talles
              </h3>
              <p className="text-sm text-gray-600">
                {product.name} - {categoryDisplayName}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('edit')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'edit'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleViewModeChange('view')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'view'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Ver Stock por Sucursales
                </button>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Error Display */}
          {sizeStock.error && (
            <div className="mb-6 p-4 bg-red-50 rounded-md">
              <div className="text-sm text-red-800">{sizeStock.error}</div>
            </div>
          )}

          {/* View Modes */}
          {viewMode === 'edit' ? (
            <EditSizeStockView
              sizes={sizeStock.sizes}
              availableSizes={availableSizes}
              isShoeCategory={isShoeCategory}
              loading={sizeStock.loading}
              saving={sizeStock.saving}
              getSizeStock={sizeStock.getSizeStock}
              updateSizeStock={sizeStock.updateSizeStock}
              setSizeStock={sizeStock.setSizeStockValue}
              bulkAdjustStock={sizeStock.bulkAdjustStock}
              resetAllStock={sizeStock.resetAllStock}
              onSave={handleSave}
              onCancel={handleClose}
            />
          ) : (
            <MultiBranchStockView
              multiBranchData={branchStock.multiBranchData}
              loading={branchStock.loading}
              isShoeCategory={isShoeCategory}
              onClose={handleClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
