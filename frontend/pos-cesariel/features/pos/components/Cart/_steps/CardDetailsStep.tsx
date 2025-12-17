import type { CardType, CardDetailStep } from '@/features/pos/hooks/useCartKeyboard';

const CARD_TYPES: CardType[] = ['bancarizadas', 'no_bancarizadas', 'tarjeta_naranja'];

interface PaymentConfig {
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active?: boolean;
}

interface CardDetailsStepProps {
  selectedCardType: CardType;
  setSelectedCardType: (type: CardType) => void;
  setCardTypeIndex: (index: number) => void;
  cardTypeIndex: number;
  selectedInstallments: number;
  setSelectedInstallments: (installments: number) => void;
  cardDetailStep: CardDetailStep;
  paymentConfigs: PaymentConfig[];
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
 * Paso 2: Detalles de tarjeta (tipo y cuotas)
 */
export function CardDetailsStep({
  selectedCardType,
  setSelectedCardType,
  setCardTypeIndex,
  cardTypeIndex,
  selectedInstallments,
  setSelectedInstallments,
  cardDetailStep,
  paymentConfigs,
}: CardDetailsStepProps) {
  // Get first available installment for a card type
  const getFirstInstallment = (cardType: CardType): number => {
    const configs = paymentConfigs
      .filter(
        (c) =>
          c.payment_type === 'tarjeta' &&
          c.card_type === cardType &&
          c.is_active !== false
      )
      .sort((a, b) => a.installments - b.installments);

    return configs.length > 0 ? configs[0].installments : 1;
  };

  return (
    <div className="space-y-4">
      {/* Card Type Selection */}
      {cardDetailStep === 'type' && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Tipo de Tarjeta
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CARD_TYPES.map((cardType, index) => (
              <button
                key={cardType}
                onClick={() => {
                  setSelectedCardType(cardType);
                  setCardTypeIndex(index);
                  // Set to first available installment for this card type
                  setSelectedInstallments(getFirstInstallment(cardType));
                }}
                className={`p-2 text-xs rounded border transition-colors ${
                  selectedCardType === cardType
                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-300'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
              >
                {getCardTypeDisplay(cardType)}
                {cardTypeIndex === index && (
                  <div className="text-xs text-blue-600 mt-1">← → para cambiar</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Installments Selection - for bancarizadas and no_bancarizadas */}
      {cardDetailStep === 'installments' &&
       (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas') && (
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Seleccione las Cuotas para {getCardTypeDisplay(selectedCardType)}
          </label>
          <div className="grid grid-cols-5 gap-2">
            {/* Dynamically get available installments from paymentConfigs */}
            {paymentConfigs
              .filter(
                (c) =>
                  c.payment_type === 'tarjeta' &&
                  c.card_type === selectedCardType &&
                  c.is_active !== false // Only show active configs
              )
              .sort((a, b) => a.installments - b.installments) // Sort by installments
              .map((config) => {
                const installment = config.installments;
                const percentage = Number(config.surcharge_percentage);

                return (
                  <button
                    key={installment}
                    onClick={() => setSelectedInstallments(installment)}
                    className={`p-2 text-xs rounded border transition-colors ${
                      selectedInstallments === installment
                        ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-300'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      {installment} cuota{installment > 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-gray-500">
                      {percentage > 0 ? `+${percentage}%` : 'Sin recargo'}
                    </div>
                    {selectedInstallments === installment && (
                      <div className="text-xs text-blue-600 mt-1">← → para cambiar</div>
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
