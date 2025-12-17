'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface SizeInfo {
  size: string;
  stock: number;
}

interface SizeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (size: string) => void;
  productName: string;
  availableSizes: SizeInfo[];
  loading?: boolean;
}

export default function SizeSelectorModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  availableSizes,
  loading = false
}: SizeSelectorModalProps) {
  const [selectedSize, setSelectedSize] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedSize('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (selectedSize) {
      onConfirm(selectedSize);
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedSize('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Seleccionar Talle
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Seleccione un talle para: <strong className="text-gray-900">{productName}</strong>
          </p>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {availableSizes.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No hay talles disponibles con stock</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {availableSizes.map((sizeInfo) => (
                    <button
                      key={sizeInfo.size}
                      onClick={() => setSelectedSize(sizeInfo.size)}
                      className={`relative p-4 rounded-lg border-2 transition-colors text-center ${
                        selectedSize === sizeInfo.size
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium text-gray-900 text-lg mb-1">
                        {sizeInfo.size}
                      </div>
                      <div className="text-xs text-gray-500">
                        Stock: {sizeInfo.stock}
                      </div>
                      {selectedSize === sizeInfo.size && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedSize || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Agregar al Carrito
          </button>
        </div>
      </div>
    </div>
  );
}