'use client';

import { BanknotesIcon } from '@heroicons/react/24/outline';
import { PaymentMethodCard } from './payment-method-card';

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  requires_change: boolean;
  icon: string;
}

interface PaymentMethodsListProps {
  methods: PaymentMethod[];
  onToggleMethod: (id: number) => void;
}

export function PaymentMethodsList({ methods, onToggleMethod }: PaymentMethodsListProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center mb-6">
        <BanknotesIcon className="h-6 w-6 text-green-500 mr-3" />
        <h2 className="text-lg font-medium text-black">Métodos de Pago Disponibles</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            onToggle={onToggleMethod}
          />
        ))}
      </div>
    </div>
  );
}
