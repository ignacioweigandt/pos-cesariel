import {
  ChatBubbleLeftRightIcon,
  CheckIcon,
  CurrencyDollarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import type { WhatsAppStats } from '@/features/ecommerce/hooks/useWhatsAppStats';

interface SalesStatsGridProps {
  stats: WhatsAppStats;
}

/**
 * Grid de estadísticas de ventas WhatsApp
 */
export function SalesStatsGrid({ stats }: SalesStatsGridProps) {
  const statCards = [
    {
      label: 'Total Ventas WhatsApp',
      value: stats.total_sales,
      icon: ChatBubbleLeftRightIcon,
      iconColor: 'text-green-600',
    },
    {
      label: 'Ingresos WhatsApp',
      value: `$${stats.total_revenue.toFixed(2)}`,
      icon: CurrencyDollarIcon,
      iconColor: 'text-green-600',
    },
    {
      label: 'Pedidos Pendientes',
      value: stats.pending_orders,
      icon: TruckIcon,
      iconColor: 'text-blue-600',
    },
    {
      label: 'Pedidos Completados',
      value: stats.completed_orders,
      icon: CheckIcon,
      iconColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.label}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
