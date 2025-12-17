import { ChatBubbleLeftRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { OrderStatusBadge } from '@/shared/utils/format/status';
import { formatDate } from '@/shared/utils/format/date';
import type { WhatsAppSale } from '@/features/ecommerce/hooks/useWhatsAppSales';

interface SaleDetailsModalProps {
  sale: WhatsAppSale;
  onClose: () => void;
}

/**
 * Modal de detalles de venta WhatsApp
 */
export function SaleDetailsModal({ sale, onClose }: SaleDetailsModalProps) {
  const openWhatsApp = (whatsappUrl: string) => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  const totalWithShipping =
    parseFloat(sale.sale?.total_amount?.toString() || '0') +
    parseFloat(sale.shipping_cost?.toString() || '0');

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalles del Pedido #{sale.sale?.sale_number || sale.sale?.id}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="mt-4 space-y-6">
            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Información del Cliente
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nombre</label>
                  <p className="text-sm text-gray-900">{sale.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">WhatsApp</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-900">{sale.customer_whatsapp}</p>
                    {sale.whatsapp_chat_url && (
                      <button
                        onClick={() => openWhatsApp(sale.whatsapp_chat_url!)}
                        className="text-green-600 hover:text-green-800"
                        title="Abrir WhatsApp"
                      >
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
                {sale.sale?.customer_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm text-gray-900">{sale.sale.customer_email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Información del Pedido
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">
                    <OrderStatusBadge status={sale.sale?.order_status || 'PENDING'} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Método de Pago
                  </label>
                  <p className="text-sm text-gray-900">{sale.sale?.payment_method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p className="text-sm text-gray-900">{formatDate(sale.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Información de Envío
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Método</label>
                  <p className="text-sm text-gray-900">
                    {sale.shipping_method === 'pickup'
                      ? 'Retiro en Local'
                      : 'Envío a Domicilio'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Costo de Envío
                  </label>
                  <p className="text-sm text-gray-900">
                    {sale.shipping_cost > 0
                      ? `$${parseFloat(sale.shipping_cost.toString()).toFixed(2)}`
                      : 'Gratis'}
                  </p>
                </div>
                {sale.customer_address && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      Dirección
                    </label>
                    <p className="text-sm text-gray-900">{sale.customer_address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3">Productos</h4>
              <div className="space-y-3">
                {sale.sale?.sale_items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded-md border"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.product?.name || 'Producto'}
                      </p>
                      <p className="text-xs text-gray-500">
                        Cantidad: {item.quantity} × $
                        {parseFloat(item.unit_price?.toString() || '0').toFixed(2)}
                        {item.size && ` - Talle: ${item.size}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        ${parseFloat(item.total_price?.toString() || '0').toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-500">Subtotal</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(sale.sale?.total_amount?.toString() || '0').toFixed(2)}
                  </p>
                </div>
                {sale.shipping_cost > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Envío</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${parseFloat(sale.shipping_cost.toString()).toFixed(2)}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Final</p>
                  <p className="text-xl font-bold text-blue-600">
                    ${totalWithShipping.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            {sale.notes && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3">Notas</h4>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {sale.notes}
                </p>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
            {sale.whatsapp_chat_url && (
              <button
                onClick={() => openWhatsApp(sale.whatsapp_chat_url!)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                Contactar por WhatsApp
              </button>
            )}
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
