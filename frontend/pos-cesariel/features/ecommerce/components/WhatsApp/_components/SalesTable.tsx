import { useState } from 'react';
import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { OrderStatusBadge } from '@/shared/utils/format/status';
import { formatDate } from '@/shared/utils/format/date';
import type { WhatsAppSale } from '@/features/ecommerce/hooks/useWhatsAppSales';
import ConfirmationModal from './ConfirmationModal';

interface SalesTableProps {
  sales: WhatsAppSale[];
  loading: boolean;
  onUpdateStatus: (saleId: number, status: string) => Promise<boolean>;
  onViewDetails: (sale: WhatsAppSale) => void;
  onUpdateWhatsAppStatus?: (id: number, newStatus: string) => Promise<any>;
}

interface ConfirmationState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'warning' | 'success' | 'danger' | 'info';
  confirmText: string;
  onConfirm: () => void;
}

/**
 * Tabla de ventas WhatsApp
 */
export function SalesTable({
  sales,
  loading,
  onUpdateStatus,
  onViewDetails,
  onUpdateWhatsAppStatus,
}: SalesTableProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    confirmText: 'Confirmar',
    onConfirm: () => {},
  });

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

  const showConfirmation = (
    title: string,
    message: string,
    type: 'warning' | 'success' | 'danger' | 'info',
    confirmText: string,
    onConfirm: () => void
  ) => {
    setConfirmation({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm,
    });
  };

  const closeConfirmation = () => {
    setConfirmation((prev) => ({ ...prev, isOpen: false }));
  };

  const handleUpdateStatus = async (
    whatsappSaleId: number,
    newStatus: string,
    title: string,
    message: string,
    type: 'warning' | 'success' | 'danger' | 'info',
    confirmText: string
  ) => {
    if (!onUpdateWhatsAppStatus) return;

    showConfirmation(title, message, type, confirmText, async () => {
      setUpdatingId(whatsappSaleId);
      try {
        await onUpdateWhatsAppStatus(whatsappSaleId, newStatus);
      } catch (error: any) {
        alert(error.message || 'Error al actualizar estado');
      } finally {
        setUpdatingId(null);
      }
    });
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
                <div className="flex flex-col space-y-2">
                  {/* Quick actions row */}
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
                  </div>

                  {/* Status action buttons (contextual) */}
                  {onUpdateWhatsAppStatus && (
                    <div className="flex flex-col space-y-1">
                      {sale.sale?.order_status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(
                              sale.id, 
                              'PROCESSING',
                              'Confirmar Pago Recibido',
                              `Cliente: ${sale.customer_name}\nMonto: $${Number(sale.sale?.total_amount || 0).toFixed(2)}\n\n⚠️ IMPORTANTE: Esta acción descontará automáticamente el stock de los productos.`,
                              'warning',
                              'Confirmar Pago'
                            )}
                            disabled={updatingId === sale.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                          >
                            <CheckIcon className="h-3 w-3 mr-1" />
                            Confirmar Pago
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(
                              sale.id, 
                              'CANCELLED',
                              'Cancelar Pedido',
                              `Cliente: ${sale.customer_name}\nMonto: $${Number(sale.sale?.total_amount || 0).toFixed(2)}\n\nEsta acción NO afectará el stock ya que el pago aún no fue confirmado.`,
                              'danger',
                              'Cancelar Pedido'
                            )}
                            disabled={updatingId === sale.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            Cancelar
                          </button>
                        </>
                      )}

                      {sale.sale?.order_status === 'PROCESSING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(
                              sale.id, 
                              'SHIPPED',
                              'Marcar como Enviado',
                              `Cliente: ${sale.customer_name}\nMétodo: ${sale.shipping_method || 'No especificado'}\nDirección: ${sale.customer_address || 'No especificada'}\n\nConfirma que el pedido fue despachado o está listo para retiro.`,
                              'info',
                              'Marcar como Enviado'
                            )}
                            disabled={updatingId === sale.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                          >
                            <TruckIcon className="h-3 w-3 mr-1" />
                            Marcar como Enviado
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(
                              sale.id, 
                              'CANCELLED',
                              '⚠️ Cancelar y Revertir Stock',
                              `Cliente: ${sale.customer_name}\nMonto: $${Number(sale.sale?.total_amount || 0).toFixed(2)}\n\n⚠️ IMPORTANTE: Esta acción revertirá automáticamente el stock que fue descontado.\n\n¿Estás seguro de cancelar este pedido?`,
                              'danger',
                              'Sí, Cancelar Pedido'
                            )}
                            disabled={updatingId === sale.id}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            <XMarkIcon className="h-3 w-3 mr-1" />
                            Cancelar (Revertir Stock)
                          </button>
                        </>
                      )}

                      {sale.sale?.order_status === 'SHIPPED' && (
                        <button
                          onClick={() => handleUpdateStatus(
                            sale.id, 
                            'DELIVERED',
                            'Confirmar Entrega',
                            `Cliente: ${sale.customer_name}\nMonto: $${Number(sale.sale?.total_amount || 0).toFixed(2)}\n\nConfirma que el cliente recibió el pedido o lo retiró correctamente.\nEsta acción marcará el pedido como completado.`,
                            'success',
                            'Confirmar Entrega'
                          )}
                          disabled={updatingId === sale.id}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                        >
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Marcar como Entregado
                        </button>
                      )}

                      {sale.sale?.order_status === 'DELIVERED' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-green-800 bg-green-100">
                          <CheckIcon className="h-3 w-3 mr-1" />
                          Entregado
                        </span>
                      )}

                      {sale.sale?.order_status === 'CANCELLED' && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-red-800 bg-red-100">
                          <XMarkIcon className="h-3 w-3 mr-1" />
                          Cancelado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={closeConfirmation}
        onConfirm={confirmation.onConfirm}
        title={confirmation.title}
        message={confirmation.message}
        type={confirmation.type}
        confirmText={confirmation.confirmText}
        cancelText="Cancelar"
        isLoading={updatingId !== null}
      />
    </div>
  );
}
