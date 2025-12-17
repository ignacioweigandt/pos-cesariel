import type { WhatsAppFormData } from '@/features/ecommerce/hooks/useWhatsAppSaleForm';

interface Sale {
  id: number;
  sale_number: string;
  customer_name?: string;
  total_amount: number;
}

interface WhatsAppSaleFormProps {
  formData: WhatsAppFormData;
  setFormData: (data: WhatsAppFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
  availableSales?: Sale[];
}

/**
 * Formulario para crear/editar venta WhatsApp
 */
export function WhatsAppSaleForm({
  formData,
  setFormData,
  onSubmit,
  onCancel,
  isEditing,
  availableSales = [],
}: WhatsAppSaleFormProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        {isEditing ? 'Editar Venta WhatsApp' : 'Nueva Venta WhatsApp'}
      </h4>

      <form onSubmit={onSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sale Selection (only for new sales) */}
          {!isEditing && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venta E-commerce *
              </label>
              <select
                value={formData.sale_id}
                onChange={(e) =>
                  setFormData({ ...formData, sale_id: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
                required
              >
                <option value="">Seleccionar venta...</option>
                {availableSales.map((sale) => (
                  <option key={sale.id} value={sale.id}>
                    #{sale.sale_number} - {sale.customer_name || 'Sin nombre'} - $
                    {sale.total_amount}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Customer Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              value={formData.customer_name}
              onChange={(e) =>
                setFormData({ ...formData, customer_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="Nombre completo"
              required
            />
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número de WhatsApp *
            </label>
            <input
              type="tel"
              value={formData.customer_whatsapp}
              onChange={(e) =>
                setFormData({ ...formData, customer_whatsapp: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="+5491234567890"
              required
            />
          </div>

          {/* Shipping Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Método de Envío
            </label>
            <select
              value={formData.shipping_method}
              onChange={(e) =>
                setFormData({ ...formData, shipping_method: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
            >
              <option value="delivery">Envío a domicilio</option>
              <option value="pickup">Retiro en tienda</option>
              <option value="shipping">Envío por correo</option>
            </select>
          </div>

          {/* Shipping Cost */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Costo de Envío
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.shipping_cost}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  shipping_cost: parseFloat(e.target.value) || 0,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
              placeholder="0.00"
            />
          </div>

          {/* Customer Address */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección del Cliente
            </label>
            <textarea
              value={formData.customer_address}
              onChange={(e) =>
                setFormData({ ...formData, customer_address: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={2}
              placeholder="Dirección completa..."
            />
          </div>

          {/* Notes */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-green-500"
              rows={2}
              placeholder="Notas adicionales..."
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            {isEditing ? 'Actualizar' : 'Crear Venta WhatsApp'}
          </button>
        </div>
      </form>
    </div>
  );
}
