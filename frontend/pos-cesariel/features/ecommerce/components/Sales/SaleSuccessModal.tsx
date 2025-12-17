'use client';

import { useState, useEffect } from 'react';
import { 
  CheckCircleIcon, 
  XMarkIcon,
  PrinterIcon,
  EyeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleData?: {
    saleId: number | null;
    saleNumber: string;
    customerName: string;
    totalAmount: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      size?: string;
    }>;
    error?: string;
  };
  saleType: 'POS' | 'ECOMMERCE';
}

export default function SaleSuccessModal({ 
  isOpen, 
  onClose, 
  saleData,
  saleType = 'POS'
}: SaleSuccessModalProps) {
  const [autoCloseTimer, setAutoCloseTimer] = useState<number>(10);

  useEffect(() => {
    if (isOpen && autoCloseTimer > 0) {
      const timer = setTimeout(() => {
        setAutoCloseTimer(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isOpen && autoCloseTimer === 0) {
      onClose();
    }
  }, [isOpen, autoCloseTimer, onClose]);

  useEffect(() => {
    if (isOpen) {
      setAutoCloseTimer(10);
    }
  }, [isOpen]);

  if (!isOpen || !saleData) return null;

  const getMessage = () => {
    // Check if there's an error
    if (saleData?.error) {
      return {
        title: 'Error en la Venta',
        description: saleData.error,
        icon: <XMarkIcon className="w-16 h-16 text-red-500" />,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      };
    }

    if (saleType === 'POS') {
      return {
        title: '¡Venta Procesada Exitosamente!',
        description: 'La venta ha sido confirmada y el stock ha sido actualizado automáticamente.',
        icon: <CheckCircleIcon className="w-16 h-16 text-green-500" />,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200'
      };
    } else {
      return {
        title: '¡Venta E-commerce Creada!',
        description: 'La venta está pendiente de coordinación por WhatsApp. El stock NO ha sido descontado hasta confirmar el pago.',
        icon: <CheckCircleIcon className="w-16 h-16 text-blue-500" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      };
    }
  };

  const message = getMessage();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full mx-4 border-2 ${message.borderColor}`}>
        {/* Header */}
        <div className={`${message.bgColor} px-6 py-4 border-b rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {message.icon}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {message.title}
                </h3>
                {!saleData.error && (
                  <p className="text-sm text-gray-600 mt-1">
                    Venta #{saleData.saleNumber}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            {message.description}
          </p>

          {/* Sale Details - Only show if no error */}
          {!saleData.error && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <p className="text-gray-900">{saleData.customerName}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Total:</span>
                  <p className="text-gray-900 font-semibold">
                    ${saleData.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            
            {saleData.items.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="font-medium text-gray-700 block mb-2">Productos:</span>
                <div className="space-y-1">
                  {saleData.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-xs text-gray-600">
                      <span>
                        {item.quantity}x {item.name}
                        {item.size && ` (${item.size})`}
                      </span>
                      <span>${(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  {saleData.items.length > 3 && (
                    <p className="text-xs text-gray-500 italic">
                      ... y {saleData.items.length - 3} producto(s) más
                    </p>
                  )}
                </div>
              </div>
            )}
            </div>
          )}

          {/* Status Message */}
          <div className={`p-3 rounded-lg border ${
            saleData.error 
              ? 'bg-red-50 border-red-200'
              : saleType === 'POS' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start space-x-2">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                saleData.error 
                  ? 'bg-red-500'
                  : saleType === 'POS' ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
              <div className="text-sm">
                {saleData.error ? (
                  <>
                    <p className="font-medium text-red-800">Error</p>
                    <p className="text-red-700">Por favor, revise los datos e intente nuevamente</p>
                  </>
                ) : saleType === 'POS' ? (
                  <>
                    <p className="font-medium text-green-800">Venta Confirmada</p>
                    <p className="text-green-700">Stock actualizado automáticamente</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-yellow-800">Venta Pendiente</p>
                    <p className="text-yellow-700">Requiere coordinación por WhatsApp</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 rounded-b-lg">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              Se cerrará automáticamente en {autoCloseTimer}s
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setAutoCloseTimer(0)}
                className="px-3 py-1 text-xs text-gray-600 hover:text-gray-800"
              >
                Cerrar ahora
              </button>
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  saleData.error
                    ? 'bg-red-600 hover:bg-red-700'
                    : saleType === 'POS' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saleData.error ? 'Cerrar' : 'Continuar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}