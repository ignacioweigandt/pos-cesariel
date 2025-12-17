import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { OrderStatusBadge } from '@/shared/utils/format/status';
import { formatDate } from '@/shared/utils/format/date';
import type { WhatsAppSale } from '@/features/ecommerce/hooks/useWhatsAppSales';

interface SalesTableProps {
  sales: WhatsAppSale[];
  loading: boolean;
  onUpdateStatus: (saleId: number, status: string) => Promise<boolean>;
  onViewDetails: (sale: WhatsAppSale) => void;
}

/**
 * Tabla de ventas WhatsApp
 */
export function SalesTable({
  sales,
  loading,
  onUpdateStatus,
  onViewDetails,
}: SalesTableProps) {
  const openWhatsApp = (whatsappUrl: string) => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleMarkAsCompleted = async (saleId: number) => {
    try {
      await onUpdateStatus(saleId, 'DELIVERED');
    } catch (error) {
      console.error('Error marking as completed:', error);
    }
  };

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No hay ventas WhatsApp
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Las ventas realizadas desde el e-commerce aparecerán aquí automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Venta
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Envío
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sales.map((sale) => (
            <tr key={sale.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  #{sale.sale?.sale_number || sale.sale?.id}
                </div>
                <div className="text-sm text-gray-500">ID: {sale.sale?.id}</div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {sale.customer_name}
                </div>
                <div className="text-sm text-gray-500">
                  {sale.customer_whatsapp}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  ${parseFloat(sale.sale?.total_amount?.toString() || '0').toFixed(2)}
                </div>
                {sale.shipping_cost > 0 && (
                  <div className="text-sm text-gray-500">
                    +${parseFloat(sale.shipping_cost.toString()).toFixed(2)} envío
                  </div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <OrderStatusBadge status={sale.sale?.order_status || 'PENDING'} />
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {sale.shipping_method === 'pickup' ? 'Retiro' : 'Envío'}
                </div>
                {sale.customer_address && (
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {sale.customer_address}
                  </div>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatDate(sale.created_at)}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  {sale.whatsapp_chat_url && (
                    <button
                      onClick={() => openWhatsApp(sale.whatsapp_chat_url!)}
                      className="text-green-600 hover:text-green-900"
                      title="Abrir WhatsApp"
                    >
                      <ChatBubbleLeftRightIcon className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onViewDetails(sale)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                  {sale.sale?.order_status === 'PENDING' && (
                    <button
                      onClick={() => handleMarkAsCompleted(sale.sale!.id)}
                      className="text-green-600 hover:text-green-900"
                      title="Marcar como completado"
                    >
                      <CheckIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
