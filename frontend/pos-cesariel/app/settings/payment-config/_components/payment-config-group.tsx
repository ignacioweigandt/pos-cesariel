'use client';

import { CreditCardIcon, BanknotesIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import { PaymentConfigTable } from './payment-config-table';

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

interface PaymentConfigGroupProps {
  paymentType: string;
  configs: PaymentConfig[];
  onEdit: (config: PaymentConfig) => void;
  onDelete: (config: PaymentConfig) => void;
}

const getPaymentIcon = (paymentType: string) => {
  switch (paymentType) {
    case 'efectivo':
      return <BanknotesIcon className="h-5 w-5 text-green-600" />;
    case 'tarjeta':
      return <CreditCardIcon className="h-5 w-5 text-blue-600" />;
    case 'transferencia':
      return <BuildingLibraryIcon className="h-5 w-5 text-purple-600" />;
    default:
      return <CreditCardIcon className="h-5 w-5 text-black" />;
  }
};

const getPaymentTypeDisplay = (paymentType: string) => {
  switch (paymentType) {
    case 'efectivo':
      return 'Efectivo';
    case 'tarjeta':
      return 'Tarjetas';
    case 'transferencia':
      return 'Transferencias';
    default:
      return paymentType;
  }
};

export function PaymentConfigGroup({ paymentType, configs, onEdit, onDelete }: PaymentConfigGroupProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-4">
        {getPaymentIcon(paymentType)}
        <h2 className="text-lg font-medium text-black ml-2 capitalize">
          {getPaymentTypeDisplay(paymentType)}
        </h2>
      </div>

      <PaymentConfigTable
        configs={configs}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
