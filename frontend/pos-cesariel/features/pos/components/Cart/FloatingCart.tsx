'use client';

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import {
  useCartKeyboard,
  type PaymentMethod,
  type CardType,
  type PaymentStep,
  type CardDetailStep,
} from '@/features/pos/hooks/useCartKeyboard';
import { useCartCalculations } from '@/features/pos/hooks/useCartCalculations';
import { useTaxRates } from '@/features/configuracion/hooks/useTaxRates';
import { PaymentMethodStep } from './_steps/PaymentMethodStep';
import { CardDetailsStep } from './_steps/CardDetailsStep';
import { ConfirmationStep } from './_steps/ConfirmationStep';
import { PaymentTotals } from './_components/PaymentTotals';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  sku: string;
  stock_quantity: number;
  min_stock: number;
  has_sizes?: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  price: number;
  size?: string;
}

interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

interface FloatingCartProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (cartItemId: number, newQuantity: number) => void;
  onRemoveItem: (cartItemId: number) => void;
  onClearCart: () => void;
  onProcessSale: (paymentData: any) => void;
  paymentConfigs: PaymentConfig[];
  processing: boolean;
}

/**
 * Carrito flotante con navegación por teclado y flujo de pago
 * Componente refactorizado con separación de responsabilidades
 */
export default function FloatingCart({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProcessSale,
  paymentConfigs,
  processing,
}: FloatingCartProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentSection, setCurrentSection] = useState<'items' | 'payment'>('items');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('efectivo');
  const [selectedCardType, setSelectedCardType] = useState<CardType>('bancarizadas');
  const [selectedInstallments, setSelectedInstallments] = useState(1);
  const [paymentMethodIndex, setPaymentMethodIndex] = useState(0);
  const [cardTypeIndex, setCardTypeIndex] = useState(0);
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('method');
  const [cardDetailStep, setCardDetailStep] = useState<CardDetailStep>('type');
  const modalRef = useRef<HTMLDivElement>(null);

  // Obtener configuración de impuestos
  const { getDefaultTaxRate } = useTaxRates();
  const defaultTaxRate = getDefaultTaxRate();
  const taxRate = defaultTaxRate?.rate || 0;

  // Calcular totales
  const totals = useCartCalculations(
    cart,
    selectedPayment,
    selectedCardType,
    selectedInstallments,
    paymentConfigs,
    taxRate // Pasar la tasa de impuesto desde la configuración
  );

  // Navegación por teclado
  useCartKeyboard({
    isOpen,
    cart,
    selectedIndex,
    setSelectedIndex,
    currentSection,
    setCurrentSection,
    selectedPayment,
    setSelectedPayment,
    selectedCardType,
    setSelectedCardType,
    selectedInstallments,
    setSelectedInstallments,
    paymentMethodIndex,
    setPaymentMethodIndex,
    cardTypeIndex,
    setCardTypeIndex,
    paymentStep,
    setPaymentStep,
    cardDetailStep,
    setCardDetailStep,
    onUpdateQuantity,
    onRemoveItem,
    onClearCart,
    onProcessSale,
    onClose,
    calculateTotals: () => totals,
    paymentConfigs,
  });

  // Focus modal when opened
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIndex(0);
      setCurrentSection('items');
      setSelectedPayment('efectivo');
      setSelectedCardType('bancarizadas');
      setSelectedInstallments(1);
      setPaymentMethodIndex(0);
      setCardTypeIndex(0);
      setPaymentStep('method');
      setCardDetailStep('type');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinuePayment = () => {
    if (paymentStep === 'method') {
      if (selectedPayment === 'tarjeta') {
        setPaymentStep('card_details');
        setCardDetailStep('type');
      } else {
        setPaymentStep('confirm');
      }
    } else if (paymentStep === 'card_details') {
      if (cardDetailStep === 'type') {
        // Check if selected card type has installments configured
        const hasInstallments = paymentConfigs.some(
          (c) =>
            c.payment_type === 'tarjeta' &&
            c.card_type === selectedCardType &&
            c.is_active !== false
        );
        if (hasInstallments && (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas')) {
          setCardDetailStep('installments');
        } else {
          setPaymentStep('confirm');
        }
      } else {
        setPaymentStep('confirm');
      }
    } else if (paymentStep === 'confirm') {
      onProcessSale({
        payment_method: selectedPayment,
        card_type: selectedPayment === 'tarjeta' ? selectedCardType : undefined,
        installments: selectedPayment === 'tarjeta' ? selectedInstallments : 1,
        surcharge_percentage: totals.surchargePercentage,
        total: totals.total,
      });
    }
  };

  const getButtonText = () => {
    if (processing) return 'Procesando...';
    if (paymentStep === 'method') return 'Continuar (Enter)';
    if (paymentStep === 'card_details') {
      if (cardDetailStep === 'type') {
        // Check if card type has installments
        const hasInstallments = paymentConfigs.some(
          (c) =>
            c.payment_type === 'tarjeta' &&
            c.card_type === selectedCardType &&
            c.is_active !== false
        );
        return hasInstallments && (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas')
          ? 'Seleccionar Cuotas (Enter)'
          : 'Confirmar Tarjeta (Enter)';
      }
      return 'Confirmar Tarjeta (Enter)';
    }
    return 'Procesar Pago (Enter)';
  };

  const getHelpText = () => {
    if (currentSection === 'items') return 'Navegue con ←→ ↑↓';
    if (paymentStep === 'method') return '←→ Métodos | Enter: Continuar';
    if (paymentStep === 'card_details') {
      return cardDetailStep === 'type'
        ? '←→ Tipos | Enter: Continuar'
        : '←→ Cuotas | Enter: Continuar';
    }
    return 'Enter: Confirmar | ESC: Volver';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Carrito de Compras</h2>
            <div className="flex items-center space-x-4">
              <span className="text-sm opacity-90">{getHelpText()}</span>
              <button onClick={onClose} className="text-white hover:text-gray-200">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Cart Items */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-black mb-4">Items ({cart.length})</h3>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Carrito vacío</div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={item.id}
                    className={`border rounded-lg p-3 flex items-center justify-between transition-colors ${
                      currentSection === 'items' && selectedIndex === index
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-black">
                        {item.product.name}
                        {item.size && (
                          <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            Talle: {item.size}
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-600">
                        ${Number(item.price).toFixed(2)} c/u
                      </p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() =>
                            onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))
                          }
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MinusIcon className="h-4 w-4" />
                        </button>

                        <span className="text-sm font-medium w-8 text-center text-black">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-600"
                          disabled={
                            item.product.has_sizes
                              ? false
                              : item.quantity >= item.product.stock_quantity
                          }
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right min-w-16">
                        <span className="text-sm font-medium text-black">
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Navigation options */}
                <div
                  className={`border rounded-lg p-3 text-center transition-colors cursor-pointer ${
                    currentSection === 'items' && selectedIndex === cart.length
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200'
                  }`}
                >
                  <span className="text-sm text-indigo-600 font-medium">
                    → Continuar al Pago
                  </span>
                </div>

                {cart.length > 0 && (
                  <div
                    className={`border rounded-lg p-3 text-center transition-colors cursor-pointer ${
                      currentSection === 'items' && selectedIndex === cart.length + 1
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <span className="text-sm text-red-600 font-medium">
                      🗑️ Vaciar Carrito
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Section */}
          {cart.length > 0 && (
            <div
              className={`border-t pt-6 ${
                currentSection === 'payment' ? 'bg-indigo-50 -m-6 p-6' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-black">
                  {paymentStep === 'method'
                    ? 'Método de Pago'
                    : paymentStep === 'card_details'
                    ? cardDetailStep === 'type'
                      ? 'Tipo de Tarjeta'
                      : 'Seleccionar Cuotas'
                    : 'Confirmar Pago'}
                </h3>
                <div className="flex space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      paymentStep === 'method' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      paymentStep === 'card_details' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      paymentStep === 'confirm' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  ></div>
                </div>
              </div>

              {/* Payment Step Components */}
              {paymentStep === 'method' && (
                <PaymentMethodStep
                  selectedPayment={selectedPayment}
                  setSelectedPayment={setSelectedPayment}
                  setPaymentMethodIndex={setPaymentMethodIndex}
                  paymentMethodIndex={paymentMethodIndex}
                  currentSection={currentSection}
                />
              )}

              {paymentStep === 'card_details' && selectedPayment === 'tarjeta' && (
                <CardDetailsStep
                  selectedCardType={selectedCardType}
                  setSelectedCardType={setSelectedCardType}
                  setCardTypeIndex={setCardTypeIndex}
                  cardTypeIndex={cardTypeIndex}
                  selectedInstallments={selectedInstallments}
                  setSelectedInstallments={setSelectedInstallments}
                  cardDetailStep={cardDetailStep}
                  paymentConfigs={paymentConfigs}
                />
              )}

              {paymentStep === 'confirm' && (
                <ConfirmationStep
                  selectedPayment={selectedPayment}
                  selectedCardType={selectedCardType}
                  selectedInstallments={selectedInstallments}
                />
              )}

              {/* Totals */}
              <PaymentTotals
                subtotal={totals.subtotal}
                surcharge={totals.surcharge}
                tax={totals.tax}
                total={totals.total}
                surchargePercentage={totals.surchargePercentage}
                taxPercentage={totals.taxPercentage}
              />

              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar (ESC)
                </button>

                <button
                  onClick={handleContinuePayment}
                  disabled={processing}
                  className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {getButtonText()}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
