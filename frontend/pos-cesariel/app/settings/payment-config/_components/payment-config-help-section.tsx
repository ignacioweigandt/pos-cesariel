'use client';

export function PaymentConfigHelpSection() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-blue-900 mb-3">
        Información sobre Configuración de Pagos
      </h3>
      <div className="text-sm text-blue-800 space-y-2">
        <p><strong>Efectivo:</strong> Generalmente sin recargo</p>
        <p><strong>Transferencia:</strong> Sin recargo, pago inmediato</p>
        <p><strong>Tarjetas Bancarizadas:</strong> Cuotas con diferentes recargos según la cantidad</p>
        <p><strong>Tarjetas No Bancarizadas:</strong> Recargo fijo, solo 1 cuota</p>
        <p><strong>Tarjeta Naranja:</strong> Recargo fijo, solo 1 cuota</p>
      </div>
      <div className="mt-4 text-xs text-blue-600">
        <p>Los recargos se aplicarán automáticamente en el POS según la configuración aquí establecida.</p>
      </div>
    </div>
  );
}
