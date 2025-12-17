import type { WhatsAppConfig } from '@/features/ecommerce/hooks/useWhatsAppConfig';

interface WhatsAppConfigFormProps {
  config: WhatsAppConfig | null;
  setConfig: (config: WhatsAppConfig) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

/**
 * Formulario de configuración de WhatsApp empresarial
 */
export function WhatsAppConfigForm({
  config,
  setConfig,
  onSubmit,
  onCancel,
}: WhatsAppConfigFormProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">
        Configuración de WhatsApp Empresarial
      </h4>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="business_phone"
              className="block text-sm font-medium text-gray-700"
            >
              Número de WhatsApp Empresarial
            </label>
            <input
              type="tel"
              id="business_phone"
              value={config?.business_phone || ''}
              onChange={(e) =>
                setConfig({
                  ...config!,
                  business_phone: e.target.value,
                })
              }
              placeholder="+54 9 11 1234-5678"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label
              htmlFor="business_name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del Negocio
            </label>
            <input
              type="text"
              id="business_name"
              value={config?.business_name || ''}
              onChange={(e) =>
                setConfig({
                  ...config!,
                  business_name: e.target.value,
                })
              }
              placeholder="Mi Tienda"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="welcome_message"
            className="block text-sm font-medium text-gray-700"
          >
            Mensaje de Bienvenida
          </label>
          <textarea
            id="welcome_message"
            rows={3}
            value={config?.welcome_message || ''}
            onChange={(e) =>
              setConfig({
                ...config!,
                welcome_message: e.target.value,
              })
            }
            placeholder="¡Hola! Gracias por contactarnos. ¿En qué podemos ayudarte?"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div>
          <label
            htmlFor="business_hours"
            className="block text-sm font-medium text-gray-700"
          >
            Horarios de Atención
          </label>
          <input
            type="text"
            id="business_hours"
            value={config?.business_hours || ''}
            onChange={(e) =>
              setConfig({
                ...config!,
                business_hours: e.target.value,
              })
            }
            placeholder="Lunes a Viernes: 9:00 - 18:00"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>

        <div className="flex items-center">
          <input
            id="auto_response_enabled"
            type="checkbox"
            checked={config?.auto_response_enabled || false}
            onChange={(e) =>
              setConfig({
                ...config!,
                auto_response_enabled: e.target.checked,
              })
            }
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
          />
          <label
            htmlFor="auto_response_enabled"
            className="ml-2 block text-sm text-gray-900"
          >
            Activar respuesta automática
          </label>
        </div>

        <div className="flex justify-end space-x-3">
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
            Guardar Configuración
          </button>
        </div>
      </form>
    </div>
  );
}
