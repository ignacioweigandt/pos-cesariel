'use client';

interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  payment_type: string;
  card_type: string;
  installments: number;
  surcharge_percentage: number;
  description: string;
}

interface PaymentConfigFormModalProps {
  isOpen: boolean;
  editingConfig: PaymentConfig | null;
  formData: FormData;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: string, value: any) => void;
}

export function PaymentConfigFormModal({
  isOpen,
  editingConfig,
  formData,
  onClose,
  onSave,
  onChange
}: PaymentConfigFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-lg font-medium text-black mb-4">
          {editingConfig ? 'Editar Configuración' : 'Nueva Configuración'}
        </h3>

        <div className="space-y-4">
          {/* Payment Type */}
          <div>
            <label className="block text-sm font-medium text-black">
              Método de Pago
            </label>
            <select
              value={formData.payment_type}
              onChange={(e) => {
                onChange('payment_type', e.target.value);
                onChange('card_type', '');
              }}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>

          {/* Card Type (only for tarjeta) */}
          {formData.payment_type === 'tarjeta' && (
            <div>
              <label className="block text-sm font-medium text-black">
                Tipo de Tarjeta
              </label>
              <select
                value={formData.card_type}
                onChange={(e) => onChange('card_type', e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Seleccionar tipo</option>
                <option value="bancarizadas">Bancarizadas</option>
                <option value="no_bancarizadas">No Bancarizadas</option>
                <option value="tarjeta_naranja">Tarjeta Naranja</option>
              </select>
            </div>
          )}

          {/* Installments (only for bancarizadas) */}
          {formData.payment_type === 'tarjeta' && formData.card_type === 'bancarizadas' && (
            <div>
              <label className="block text-sm font-medium text-black">
                Cuotas
              </label>
              <select
                value={formData.installments}
                onChange={(e) => onChange('installments', Number(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value={1}>1 cuota</option>
                <option value={3}>3 cuotas</option>
                <option value={6}>6 cuotas</option>
                <option value={9}>9 cuotas</option>
                <option value={12}>12 cuotas</option>
              </select>
            </div>
          )}

          {/* Surcharge Percentage */}
          <div>
            <label className="block text-sm font-medium text-black">
              Recargo (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.surcharge_percentage}
              onChange={(e) => onChange('surcharge_percentage', Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-black">
              Descripción
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => onChange('description', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción opcional"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-black hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {editingConfig ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}
