'use client';

import { useEffect, useState } from 'react';

interface ThermalTicketProps {
  saleData: {
    saleId: number | null;
    saleNumber: string;
    customerName: string;
    totalAmount: number;
    subtotal?: number;
    tax?: number;
    discount?: number;
    items: Array<{
      name: string;
      quantity: number;
      price: number;
      size?: string;
    }>;
    paymentMethod?: string;
    cardType?: string;
    installments?: number;
    createdAt?: string;
  };
  branchName?: string;
  branchAddress?: string;
  branchPhone?: string;
  sellerName?: string;
}

/**
 * ThermalTicket Component
 *
 * Optimized thermal receipt component for 80mm thermal printers.
 * Features:
 * - 80mm width format (302px at 96dpi)
 * - Monospace font for proper alignment
 * - Text alignment using spaces
 * - High contrast for thermal printing
 * - Barcode-ready sale number
 */
export default function ThermalTicket({
  saleData,
  branchName = 'POS Cesariel',
  branchAddress = 'Dirección del local',
  branchPhone = 'Tel: (XXX) XXX-XXXX',
  sellerName = 'Vendedor'
}: ThermalTicketProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    // Format date on client side to avoid hydration mismatch
    const date = saleData.createdAt ? new Date(saleData.createdAt) : new Date();
    setCurrentDate(date.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }));
  }, [saleData.createdAt]);

  /**
   * Format line with left and right alignment
   * Total width: 42 characters for 80mm paper
   */
  const formatLine = (left: string, right: string, width: number = 42): string => {
    const totalSpaces = width - left.length - right.length;
    return left + ' '.repeat(Math.max(1, totalSpaces)) + right;
  };

  /**
   * Center text within given width
   */
  const centerText = (text: string, width: number = 42): string => {
    const spaces = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(spaces) + text;
  };

  /**
   * Format currency
   */
  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  /**
   * Get payment method display text
   */
  const getPaymentMethodText = (): string => {
    if (!saleData.paymentMethod) return 'Efectivo';

    if (saleData.paymentMethod === 'CASH') return 'Efectivo';
    if (saleData.paymentMethod === 'TRANSFER') return 'Transferencia';
    if (saleData.paymentMethod === 'CARD') {
      const cardText = saleData.cardType ? saleData.cardType : 'Tarjeta';
      const installmentsText = saleData.installments && saleData.installments > 1
        ? ` ${saleData.installments}x`
        : '';
      return `${cardText}${installmentsText}`;
    }

    return saleData.paymentMethod;
  };

  return (
    <div className="thermal-ticket">
      <div className="ticket-content">
        {/* Header */}
        <div className="text-center mb-4">
          <div className="font-bold text-lg mb-1">{branchName}</div>
          <div className="text-xs">{branchAddress}</div>
          <div className="text-xs">{branchPhone}</div>
        </div>

        {/* Separator */}
        <div className="separator">{'='.repeat(42)}</div>

        {/* Sale Info */}
        <div className="text-xs my-2">
          <div>TICKET NO: {saleData.saleNumber}</div>
          <div>FECHA: {currentDate}</div>
          <div>VENDEDOR: {sellerName}</div>
          {saleData.customerName && saleData.customerName !== 'Cliente' && (
            <div>CLIENTE: {saleData.customerName}</div>
          )}
        </div>

        {/* Separator */}
        <div className="separator">{'='.repeat(42)}</div>

        {/* Items Header */}
        <div className="text-xs font-bold my-2">
          <div>{formatLine('DESCRIPCION', 'IMPORTE')}</div>
          <div>{formatLine('CANT x PRECIO', '')}</div>
        </div>

        {/* Separator */}
        <div className="separator">{'-'.repeat(42)}</div>

        {/* Items */}
        <div className="text-xs">
          {saleData.items.map((item, index) => {
            const itemName = item.size ? `${item.name} (${item.size})` : item.name;
            const itemTotal = item.quantity * item.price;
            const quantityLine = `${item.quantity} x ${formatCurrency(item.price)}`;

            return (
              <div key={index} className="mb-2">
                <div>{formatLine(itemName.substring(0, 30), formatCurrency(itemTotal))}</div>
                <div className="text-gray-600">{quantityLine}</div>
              </div>
            );
          })}
        </div>

        {/* Separator */}
        <div className="separator">{'='.repeat(42)}</div>

        {/* Totals */}
        <div className="text-xs my-2">
          {saleData.subtotal && (
            <div>{formatLine('SUBTOTAL:', formatCurrency(saleData.subtotal))}</div>
          )}
          {saleData.discount && saleData.discount > 0 && (
            <div>{formatLine('DESCUENTO:', formatCurrency(saleData.discount))}</div>
          )}
          {saleData.tax && saleData.tax > 0 && (
            <div>{formatLine('IVA:', formatCurrency(saleData.tax))}</div>
          )}
          <div className="font-bold text-base mt-1">
            {formatLine('TOTAL:', formatCurrency(saleData.totalAmount))}
          </div>
        </div>

        {/* Payment Method */}
        <div className="separator">{'-'.repeat(42)}</div>
        <div className="text-xs my-2">
          <div>{formatLine('FORMA DE PAGO:', getPaymentMethodText())}</div>
        </div>

        {/* Footer */}
        <div className="separator">{'='.repeat(42)}</div>
        <div className="text-center text-xs my-3">
          <div>¡GRACIAS POR SU COMPRA!</div>
          <div className="mt-2">www.poscesariel.com</div>
        </div>

        {/* Barcode Simulation (Sale Number) */}
        <div className="text-center text-xs mt-3">
          <div className="barcode-number">{saleData.saleNumber}</div>
        </div>
      </div>
    </div>
  );
}
