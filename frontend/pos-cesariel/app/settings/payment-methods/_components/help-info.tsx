'use client';

export function HelpInfo() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-blue-900 mb-2">Información sobre Recargos</h3>
      <ul className="text-sm text-blue-800 space-y-1">
        <li>• <strong>Tarjetas Bancarizadas:</strong> Visa, Mastercard y American Express (1, 3, 6, 9, 12 cuotas)</li>
        <li>• <strong>No Bancarizadas:</strong> Cabal, Argencard y otras tarjetas regionales (solo 1 cuota)</li>
        <li>• <strong>Tarjeta Naranja:</strong> Sistema de tarjeta de crédito específico (solo 1 cuota)</li>
        <li>• Los recargos desactivados no aparecerán como opción en el POS</li>
        <li>• Los recargos se aplican automáticamente al total según las cuotas elegidas</li>
        <li>• Efectivo y Transferencia no tienen recargo</li>
        <li>• Realiza los cambios que necesites y presiona "Guardar Cambios" para aplicarlos</li>
      </ul>
    </div>
  );
}
