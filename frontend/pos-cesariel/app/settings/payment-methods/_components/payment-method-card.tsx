'use client';

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  requires_change: boolean;
  icon: string;
}

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onToggle: (id: number) => void;
}

export function PaymentMethodCard({ method, onToggle }: PaymentMethodCardProps) {
  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{method.icon}</span>
          <div>
            <h3 className="font-medium text-black">{method.name}</h3>
            <p className="text-sm text-black">{method.code}</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={method.is_active}
            onChange={() => onToggle(method.id)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {method.requires_change && (
        <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
          Requiere vuelto
        </div>
      )}
    </div>
  );
}
