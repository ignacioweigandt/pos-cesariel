import {
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  CheckIcon,
  CurrencyDollarIcon,
  EyeIcon,
  MapPinIcon,
  PencilIcon,
  PhoneIcon,
  TruckIcon,
  UserIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { getOrderStatusColor } from '@/shared/utils/format/status';
import type { WhatsAppSale } from '@/features/ecommerce/hooks/useWhatsAppSales';

interface WhatsAppSaleCardProps {
  sale: WhatsAppSale;
  onEdit: (sale: WhatsAppSale) => void;
  onViewDetails: (sale: any) => void;
  onMarkCompleted: (saleId: number) => void;
  onOpenWhatsApp: (url: string) => void;
}

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return CalendarDaysIcon;
    case 'processing':
    case 'shipped':
      return TruckIcon;
    case 'delivered':
      return CheckIcon;
    case 'cancelled':
      return XMarkIcon;
    default:
      return CalendarDaysIcon;
  }
};

/**
 * Tarjeta individual de venta WhatsApp
 */
export function WhatsAppSaleCard({
  sale,
  onEdit,
  onViewDetails,
  onMarkCompleted,
  onOpenWhatsApp,
}: WhatsAppSaleCardProps) {
  const StatusIcon = getStatusIcon(sale.sale.order_status);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {/* Sale Header */}
          <div className="flex items-center space-x-3 mb-3">
            <h4 className="text-lg font-medium text-gray-900">
              #{sale.sale.sale_number}
            </h4>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(
                sale.sale.order_status
              )}`}
            >
              <StatusIcon className="h-3 w-3 mr-1" />
              {sale.sale.order_status}
            </span>
            <span className="text-sm text-gray-500">
              {new Date(sale.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">{sale.customer_name}</span>
            </div>
            <div className="flex items-center">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-900">
                {sale.customer_whatsapp}
              </span>
            </div>
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                ${parseFloat(sale.sale.total_amount.toString()).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            {sale.shipping_method && (
              <div className="flex items-center">
                <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                {sale.shipping_method === 'delivery' && 'Envío a domicilio'}
                {sale.shipping_method === 'pickup' && 'Retiro en tienda'}
                {sale.shipping_method === 'shipping' && 'Envío por correo'}
                {sale.shipping_cost > 0 && ` (+$${sale.shipping_cost})`}
              </div>
            )}
            {sale.customer_address && (
              <div className="flex items-start">
                <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                <span className="text-sm">{sale.customer_address}</span>
              </div>
            )}
          </div>

          {/* Notes */}
          {sale.notes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">{sale.notes}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onViewDetails(sale.sale)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Ver detalles de venta"
          >
            <EyeIcon className="h-4 w-4" />
          </button>

          <button
            onClick={() => onEdit(sale)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="Editar"
          >
            <PencilIcon className="h-4 w-4" />
          </button>

          {sale.whatsapp_chat_url && (
            <button
              onClick={() => onOpenWhatsApp(sale.whatsapp_chat_url!)}
              className="p-2 text-gray-400 hover:text-green-600"
              title="Abrir WhatsApp"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={() => onMarkCompleted(sale.sale.id)}
            className="p-2 text-gray-400 hover:text-green-600"
            title="Marcar como completado"
            disabled={sale.sale.order_status === 'DELIVERED'}
          >
            <CheckIcon
              className={`h-4 w-4 ${
                sale.sale.order_status === 'DELIVERED'
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
