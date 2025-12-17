'use client';

import { PaymentConfigGroup } from './payment-config-group';

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

interface PaymentConfigsListProps {
  configs: PaymentConfig[];
  onEdit: (config: PaymentConfig) => void;
  onDelete: (config: PaymentConfig) => void;
}

export function PaymentConfigsList({ configs, onEdit, onDelete }: PaymentConfigsListProps) {
  const groupedConfigs = configs.reduce((groups, config) => {
    const key = config.payment_type;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(config);
    return groups;
  }, {} as Record<string, PaymentConfig[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedConfigs).map(([paymentType, paymentConfigs]) => (
        <PaymentConfigGroup
          key={paymentType}
          paymentType={paymentType}
          configs={paymentConfigs}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
