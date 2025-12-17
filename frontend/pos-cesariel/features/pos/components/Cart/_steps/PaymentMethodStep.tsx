import {
  BanknotesIcon,
  BuildingLibraryIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import type { PaymentMethod } from '@/features/pos/hooks/useCartKeyboard';
import { usePaymentMethods } from '@/features/pos/hooks/usePaymentMethods';

interface PaymentMethodStepProps {
  selectedPayment: PaymentMethod;
  setSelectedPayment: (method: PaymentMethod) => void;
  setPaymentMethodIndex: (index: number) => void;
  paymentMethodIndex: number;
  currentSection: 'items' | 'payment';
}

/**
 * Map payment method code to icon
 */
const getIconForMethod = (code: string) => {
  switch (code) {
    case 'efectivo':
      return BanknotesIcon;
    case 'tarjeta':
      return CreditCardIcon;
    case 'transferencia':
      return BuildingLibraryIcon;
    default:
      return BanknotesIcon;
  }
};

/**
 * Get color classes for payment method
 */
const getColorClasses = (color: string, isSelected: boolean) => {
  const baseColors: Record<string, { border: string; bg: string; ring: string; icon: string }> = {
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50',
      ring: 'ring-green-300',
      icon: 'text-green-600',
    },
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50',
      ring: 'ring-blue-300',
      icon: 'text-blue-600',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50',
      ring: 'ring-purple-300',
      icon: 'text-purple-600',
    },
  };

  const colors = baseColors[color] || baseColors.green;

  if (isSelected) {
    return {
      button: `${colors.border} ${colors.bg} ring-2 ${colors.ring}`,
      icon: colors.icon,
      hint: colors.icon,
    };
  }

  return {
    button: 'border-gray-200 hover:border-gray-300',
    icon: 'text-gray-600',
    hint: 'text-gray-600',
  };
};

/**
 * Map POS method codes to keyboard codes (passthrough for compatibility)
 */
const mapToKeyboardCode = (code: string): PaymentMethod => {
  return code as PaymentMethod;
};

/**
 * Paso 1: Selección de método de pago (dinámico desde la BD)
 */
export function PaymentMethodStep({
  selectedPayment,
  setSelectedPayment,
  setPaymentMethodIndex,
  paymentMethodIndex,
  currentSection,
}: PaymentMethodStepProps) {
  const { methods, loading } = usePaymentMethods();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        <p className="text-sm">No hay métodos de pago habilitados</p>
        <p className="text-xs mt-1">Configure métodos de pago en Configuración</p>
      </div>
    );
  }

  return (
    <div className={`grid gap-3 mb-4 ${methods.length <= 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {methods.map((method, index) => {
        const Icon = getIconForMethod(method.code);
        const keyboardCode = mapToKeyboardCode(method.code);
        const isSelected = selectedPayment === keyboardCode;
        const colors = getColorClasses(method.color, isSelected);

        return (
          <button
            key={method.code}
            onClick={() => {
              setSelectedPayment(keyboardCode);
              setPaymentMethodIndex(index);
            }}
            className={`p-3 rounded-lg border-2 text-center transition-colors ${colors.button}`}
          >
            <Icon className={`h-6 w-6 mx-auto mb-1 ${colors.icon}`} />
            <span className="text-sm font-medium text-black">{method.name}</span>
            {currentSection === 'payment' && paymentMethodIndex === index && (
              <div className={`text-xs ${colors.hint} mt-1`}>← → para cambiar</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
