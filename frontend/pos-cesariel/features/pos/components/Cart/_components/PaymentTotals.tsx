interface PaymentTotalsProps {
  subtotal: number;
  surcharge: number;
  tax: number;
  total: number;
  surchargePercentage: number;
  taxPercentage?: number; // Porcentaje de impuesto configurable
}

/**
 * Resumen de totales de pago con impuestos configurables
 */
export function PaymentTotals({
  subtotal,
  surcharge,
  tax,
  total,
  surchargePercentage,
  taxPercentage = 0,
}: PaymentTotalsProps) {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-black">Subtotal:</span>
        <span className="text-black">${subtotal.toFixed(2)}</span>
      </div>

      {surcharge > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-orange-600">Recargo ({surchargePercentage}%):</span>
          <span className="text-orange-600">+${surcharge.toFixed(2)}</span>
        </div>
      )}

      {taxPercentage > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-black">Impuestos ({taxPercentage}%):</span>
          <span className="text-black">${tax.toFixed(2)}</span>
        </div>
      )}

      <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
        <span className="text-black">Total:</span>
        <span className="text-black">${total.toFixed(2)}</span>
      </div>
    </div>
  );
}
