import { useEffect, useMemo } from 'react';

export type PaymentMethod = 'efectivo' | 'tarjeta' | 'transferencia';
export type CardType = 'bancarizadas' | 'no_bancarizadas' | 'tarjeta_naranja';
export type PaymentStep = 'method' | 'card_details' | 'confirm';
export type CardDetailStep = 'type' | 'installments';
export type Section = 'items' | 'payment';

const PAYMENT_METHODS: PaymentMethod[] = ['efectivo', 'tarjeta', 'transferencia'];
const CARD_TYPES: CardType[] = ['bancarizadas', 'no_bancarizadas', 'tarjeta_naranja'];

interface CartItem {
  id: number;
  quantity: number;
  product: {
    stock_quantity: number;
    has_sizes?: boolean;
  };
}

interface PaymentConfig {
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active?: boolean;
}

interface UseCartKeyboardProps {
  isOpen: boolean;
  cart: CartItem[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  currentSection: Section;
  setCurrentSection: (section: Section) => void;
  selectedPayment: PaymentMethod;
  setSelectedPayment: (method: PaymentMethod) => void;
  selectedCardType: CardType;
  setSelectedCardType: (type: CardType) => void;
  selectedInstallments: number;
  setSelectedInstallments: (installments: number) => void;
  paymentMethodIndex: number;
  setPaymentMethodIndex: (index: number) => void;
  cardTypeIndex: number;
  setCardTypeIndex: (index: number) => void;
  paymentStep: PaymentStep;
  setPaymentStep: (step: PaymentStep) => void;
  cardDetailStep: CardDetailStep;
  setCardDetailStep: (step: CardDetailStep) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onProcessSale: (data: any) => void;
  onClose: () => void;
  calculateTotals: () => { surchargePercentage: number; total: number };
  paymentConfigs: PaymentConfig[];
}

/**
 * Hook para manejar navegación por teclado del carrito
 */
export function useCartKeyboard({
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
  calculateTotals,
  paymentConfigs,
}: UseCartKeyboardProps) {

  // Memoize available installments for the selected card type
  const availableInstallments = useMemo(() => {
    return paymentConfigs
      .filter(
        (c) =>
          c.payment_type === 'tarjeta' &&
          c.card_type === selectedCardType &&
          c.is_active !== false
      )
      .map((c) => c.installments)
      .sort((a, b) => a - b); // Sort ascending
  }, [paymentConfigs, selectedCardType]);
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();

      switch (e.key) {
        case 'Escape':
          handleEscape();
          break;
        case 'ArrowUp':
          handleArrowUp();
          break;
        case 'ArrowDown':
          handleArrowDown();
          break;
        case 'ArrowLeft':
          handleArrowLeft();
          break;
        case 'ArrowRight':
          handleArrowRight();
          break;
        case 'Enter':
          handleEnter();
          break;
        case 'Delete':
        case 'Backspace':
          handleDelete();
          break;
        case 'Tab':
          handleTab();
          break;
      }
    };

    const handleEscape = () => {
      if (currentSection === 'payment') {
        if (paymentStep === 'confirm') {
          setPaymentStep(selectedPayment === 'tarjeta' ? 'card_details' : 'method');
          if (selectedPayment === 'tarjeta') {
            // Go back to installments step if card type supports it
            const hasInstallments = availableInstallments.length > 0;
            setCardDetailStep(hasInstallments ? 'installments' : 'type');
          }
        } else if (paymentStep === 'card_details') {
          if (cardDetailStep === 'installments') {
            setCardDetailStep('type');
          } else {
            setPaymentStep('method');
            setCardDetailStep('type');
          }
        } else {
          setCurrentSection('items');
          setSelectedIndex(0);
          setPaymentStep('method');
          setCardDetailStep('type');
        }
      } else {
        onClose();
      }
    };

    const handleArrowUp = () => {
      if (currentSection === 'items') {
        setSelectedIndex(Math.max(0, selectedIndex - 1));
      }
    };

    const handleArrowDown = () => {
      if (currentSection === 'items') {
        setSelectedIndex(Math.min(cart.length + 1, selectedIndex + 1));
      }
    };

    const handleArrowLeft = () => {
      if (currentSection === 'items' && selectedIndex < cart.length) {
        const item = cart[selectedIndex];
        onUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
      } else if (currentSection === 'payment') {
        if (paymentStep === 'method') {
          const newIndex = Math.max(0, paymentMethodIndex - 1);
          const newPaymentMethod = PAYMENT_METHODS[newIndex];
          setPaymentMethodIndex(newIndex);
          setSelectedPayment(newPaymentMethod);
          if (newPaymentMethod !== 'tarjeta') {
            setCardTypeIndex(0);
            setSelectedCardType('bancarizadas');
            setSelectedInstallments(1);
          }
        } else if (paymentStep === 'card_details' && selectedPayment === 'tarjeta') {
          if (cardDetailStep === 'type') {
            const newIndex = Math.max(0, cardTypeIndex - 1);
            const newCardType = CARD_TYPES[newIndex];
            setCardTypeIndex(newIndex);
            setSelectedCardType(newCardType);
            // Set to first available installment for this card type
            const configs = paymentConfigs
              .filter(
                (c) =>
                  c.payment_type === 'tarjeta' &&
                  c.card_type === newCardType &&
                  c.is_active !== false
              )
              .sort((a, b) => a.installments - b.installments);
            setSelectedInstallments(configs.length > 0 ? configs[0].installments : 1);
          } else if (cardDetailStep === 'installments' &&
                     (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas')) {
            const currentIndex = availableInstallments.indexOf(selectedInstallments);
            // Navigate left (previous installment), stops at first
            if (currentIndex > 0) {
              setSelectedInstallments(availableInstallments[currentIndex - 1]);
            }
          }
        }
      }
    };

    const handleArrowRight = () => {
      if (currentSection === 'items' && selectedIndex < cart.length) {
        const item = cart[selectedIndex];
        if (item.product.has_sizes || item.quantity < item.product.stock_quantity) {
          onUpdateQuantity(item.id, item.quantity + 1);
        }
      } else if (currentSection === 'payment') {
        if (paymentStep === 'method') {
          const newIndex = Math.min(PAYMENT_METHODS.length - 1, paymentMethodIndex + 1);
          const newPaymentMethod = PAYMENT_METHODS[newIndex];
          setPaymentMethodIndex(newIndex);
          setSelectedPayment(newPaymentMethod);
          if (newPaymentMethod !== 'tarjeta') {
            setCardTypeIndex(0);
            setSelectedCardType('bancarizadas');
            setSelectedInstallments(1);
          }
        } else if (paymentStep === 'card_details' && selectedPayment === 'tarjeta') {
          if (cardDetailStep === 'type') {
            const newIndex = Math.min(CARD_TYPES.length - 1, cardTypeIndex + 1);
            const newCardType = CARD_TYPES[newIndex];
            setCardTypeIndex(newIndex);
            setSelectedCardType(newCardType);
            // Set to first available installment for this card type
            const configs = paymentConfigs
              .filter(
                (c) =>
                  c.payment_type === 'tarjeta' &&
                  c.card_type === newCardType &&
                  c.is_active !== false
              )
              .sort((a, b) => a.installments - b.installments);
            setSelectedInstallments(configs.length > 0 ? configs[0].installments : 1);
          } else if (cardDetailStep === 'installments' &&
                     (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas')) {
            const currentIndex = availableInstallments.indexOf(selectedInstallments);
            // Navigate right (next installment), continues to next row automatically
            if (currentIndex < availableInstallments.length - 1) {
              setSelectedInstallments(availableInstallments[currentIndex + 1]);
            }
          }
        }
      }
    };

    const handleEnter = () => {
      if (currentSection === 'items') {
        if (selectedIndex === cart.length) {
          setCurrentSection('payment');
          setPaymentStep('method');
        } else if (selectedIndex === cart.length + 1) {
          onClearCart();
        }
      } else if (currentSection === 'payment') {
        if (paymentStep === 'method') {
          if (selectedPayment === 'tarjeta') {
            setPaymentStep('card_details');
          } else {
            setPaymentStep('confirm');
          }
        } else if (paymentStep === 'card_details') {
          if (cardDetailStep === 'type') {
            // Check if selected card type has installments configured
            const hasInstallments = availableInstallments.length > 0;
            if (hasInstallments && (selectedCardType === 'bancarizadas' || selectedCardType === 'no_bancarizadas')) {
              setCardDetailStep('installments');
            } else {
              setPaymentStep('confirm');
            }
          } else {
            setPaymentStep('confirm');
          }
        } else if (paymentStep === 'confirm') {
          const totals = calculateTotals();
          onProcessSale({
            payment_method: selectedPayment,
            card_type: selectedPayment === 'tarjeta' ? selectedCardType : undefined,
            installments: selectedPayment === 'tarjeta' ? selectedInstallments : 1,
            surcharge_percentage: totals.surchargePercentage,
            total: totals.total,
          });
        }
      }
    };

    const handleDelete = () => {
      if (currentSection === 'items' && selectedIndex < cart.length) {
        const item = cart[selectedIndex];
        onRemoveItem(item.id);
      }
    };

    const handleTab = () => {
      if (currentSection === 'items') {
        setCurrentSection('payment');
      } else {
        setCurrentSection('items');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    selectedIndex,
    currentSection,
    cart,
    selectedPayment,
    selectedCardType,
    selectedInstallments,
    paymentMethodIndex,
    cardTypeIndex,
    paymentStep,
    cardDetailStep,
    availableInstallments,
    paymentConfigs,
  ]);
}
