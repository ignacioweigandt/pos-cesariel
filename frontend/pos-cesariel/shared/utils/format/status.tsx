/** Utilidades de estados de pedidos y badges visuales */

export const ORDER_STATUS_MAP = {
  PENDING: {
    text: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800',
  },
  PROCESSING: {
    text: 'Procesando',
    color: 'bg-blue-100 text-blue-800',
  },
  SHIPPED: {
    text: 'Enviada',
    color: 'bg-purple-100 text-purple-800',
  },
  DELIVERED: {
    text: 'Entregada',
    color: 'bg-green-100 text-green-800',
  },
  COMPLETED: {
    text: 'Completada',
    color: 'bg-green-100 text-green-800',
  },
  CANCELLED: {
    text: 'Cancelada',
    color: 'bg-red-100 text-red-800',
  },
} as const;

export type OrderStatus = keyof typeof ORDER_STATUS_MAP;

export function getOrderStatusText(status: string): string {
  const normalizedStatus = status?.toUpperCase() as OrderStatus;
  return ORDER_STATUS_MAP[normalizedStatus]?.text || status || 'Pendiente';
}

export function getOrderStatusColor(status: string): string {
  const normalizedStatus = status?.toUpperCase() as OrderStatus;
  return ORDER_STATUS_MAP[normalizedStatus]?.color || 'bg-gray-100 text-gray-800';
}

interface OrderStatusBadgeProps {
  status: string;
  className?: string;
}

export function OrderStatusBadge({ status, className = '' }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusColor(status)} ${className}`}
    >
      {getOrderStatusText(status)}
    </span>
  );
}
