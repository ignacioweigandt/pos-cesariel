'use client';

import { useEffect, useState } from 'react';
import {
  CheckCircleIcon,
  XMarkIcon,
  PrinterIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import ThermalTicket from '../ThermalTicket';
import { printThermalTicket } from '../../utils/printTicket';
import '../../styles/thermal-ticket.css';

interface SaleConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  saleData: {
    id: number;
    paymentMethod: string;
    cardType?: string;
    installments?: number;
    total: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
  } | null;
}

export default function SaleConfirmation({ isOpen, onClose, saleData }: SaleConfirmationProps) {
  const [printing, setPrinting] = useState(false);

  // Auto cerrar después de 10 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Manejar teclas
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !saleData) return null;

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case 'efectivo': return 'Efectivo';
      case 'tarjeta': return 'Tarjeta';
      case 'transferencia': return 'Transferencia';
      default: return method;
    }
  };

  const getCardTypeDisplay = (cardType?: string) => {
    switch (cardType) {
      case 'bancarizadas': return 'Bancarizadas';
      case 'no_bancarizadas': return 'No Bancarizadas';
      case 'tarjeta_naranja': return 'Tarjeta Naranja';
      default: return '';
    }
  };

  const handlePrint = () => {
    setPrinting(true);
    printThermalTicket(
      undefined,
      () => {
        setPrinting(false);
      }
    );
  };

  return (
    <>
      {/* Thermal Ticket - Hidden, only shows when printing */}
      {saleData && (
        <ThermalTicket
          saleData={{
            saleId: saleData.id,
            saleNumber: `V-${new Date().getFullYear()}-${saleData.id.toString().padStart(5, '0')}`,
            customerName: 'Cliente',
            totalAmount: saleData.total,
            items: saleData.items,
            paymentMethod: saleData.paymentMethod.toUpperCase(),
            cardType: saleData.cardType,
            installments: saleData.installments
          }}
          sellerName="Vendedor"
        />
      )}

      {/* Success Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 overflow-hidden shadow-2xl">
        {/* Header Success */}
        <div className="bg-green-500 text-white p-6 text-center">
          <CheckCircleIcon className="h-16 w-16 mx-auto mb-4 text-white" />
          <h2 className="text-2xl font-bold">¡Venta Exitosa!</h2>
          <p className="text-green-100 mt-2">La transacción se completó correctamente</p>
        </div>

        {/* Sale Details */}
        <div className="p-6 space-y-4">
          {/* Sale ID */}
          <div className="text-center">
            <div className="text-sm text-gray-500">ID de Venta</div>
            <div className="text-3xl font-bold text-gray-900">#{saleData.id.toString().padStart(6, '0')}</div>
          </div>

          {/* Payment Details */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Método de Pago:</span>
              <span className="font-medium text-gray-900">{getPaymentMethodDisplay(saleData.paymentMethod)}</span>
            </div>

            {saleData.cardType && (
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Tarjeta:</span>
                <span className="font-medium text-gray-900">{getCardTypeDisplay(saleData.cardType)}</span>
              </div>
            )}

            {saleData.installments && saleData.installments > 1 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Cuotas:</span>
                <span className="font-medium text-gray-900">{saleData.installments} cuotas</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-3">
              <span className="text-gray-900">Total:</span>
              <span className="text-green-600">${saleData.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Items Summary */}
          <div className="border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-600 mb-2">Items vendidos ({saleData.items.length}):</div>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {saleData.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">{item.quantity}x {item.name}</span>
                  <span className="text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <button
              onClick={handlePrint}
              disabled={printing}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <PrinterIcon className="h-4 w-4 mr-2" />
              {printing ? 'Imprimiendo...' : 'Imprimir Ticket'}
            </button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowRightIcon className="h-4 w-4 mr-2" />
              Continuar (Enter/ESC)
            </button>
          </div>

          {/* Auto close timer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Esta ventana se cerrará automáticamente en 10 segundos
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
    </>
  );
}