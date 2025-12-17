import type { PaymentMethod, CardType } from '@/features/pos/hooks/useCartKeyboard';

interface ConfirmationStepProps {
  selectedPayment: PaymentMethod;
  selectedCardType: CardType;
  selectedInstallments: number;
}

const getCardTypeDisplay = (cardType: CardType): string => {
  switch (cardType) {
    case 'bancarizadas':
      return 'Bancarizadas';
    case 'no_bancarizadas':
      return 'No Bancarizadas';
    case 'tarjeta_naranja':
      return 'Tarjeta Naranja';
    default:
      return cardType;
  }
};

/**
 * Paso 3: Confirmación de pago
 */
export function ConfirmationStep({
  selectedPayment,
  selectedCardType,
  selectedInstallments,
}: ConfirmationStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-black mb-2">Resumen del Pago</h4>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-black">Método:</span>
            <span className="text-black font-medium">
              {selectedPayment === 'efectivo'
                ? 'Efectivo'
                : selectedPayment === 'tarjeta'
                ? 'Tarjeta'
                : 'Transferencia'}
            </span>
          </div>
          {selectedPayment === 'tarjeta' && (
            <>
              <div className="flex justify-between">
                <span className="text-black">Tipo:</span>
                <span className="text-black">{getCardTypeDisplay(selectedCardType)}</span>
              </div>
              {selectedInstallments > 1 && (
                <div className="flex justify-between">
                  <span className="text-black">Cuotas:</span>
                  <span className="text-black">{selectedInstallments}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
