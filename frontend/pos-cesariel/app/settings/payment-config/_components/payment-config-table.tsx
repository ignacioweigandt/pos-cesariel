'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

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

interface PaymentConfigTableProps {
  configs: PaymentConfig[];
  onEdit: (config: PaymentConfig) => void;
  onDelete: (config: PaymentConfig) => void;
}

const getCardTypeDisplay = (cardType?: string) => {
  switch (cardType) {
    case 'bancarizadas': return 'Bancarizadas';
    case 'no_bancarizadas': return 'No Bancarizadas';
    case 'tarjeta_naranja': return 'Tarjeta Naranja';
    default: return 'General';
  }
};

export function PaymentConfigTable({ configs, onEdit, onDelete }: PaymentConfigTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Tipo / Cuotas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Recargo (%)
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {configs.map((config) => (
            <tr key={config.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-black">
                  {getCardTypeDisplay(config.card_type)}
                </div>
                {config.installments > 1 && (
                  <div className="text-xs text-black">
                    {config.installments} cuotas
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  Number(config.surcharge_percentage) > 0
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {Number(config.surcharge_percentage) > 0
                    ? `+${Number(config.surcharge_percentage)}%`
                    : 'Sin recargo'}
                </span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-black">
                  {config.description || 'Sin descripción'}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  config.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {config.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(config)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDelete(config)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
