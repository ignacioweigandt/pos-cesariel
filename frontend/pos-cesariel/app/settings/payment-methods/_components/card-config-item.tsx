'use client';

interface CardConfigItemProps {
  installments: number;
  surchargePercentage: number;
  isActive: boolean;
  onUpdateSurcharge: (surcharge: number) => void;
  onToggle: () => void;
  color?: 'green' | 'orange' | 'purple';
}

const colorClasses = {
  green: {
    ring: 'focus:ring-green-500',
    toggle: 'peer-focus:ring-green-300 peer-checked:bg-green-600'
  },
  orange: {
    ring: 'focus:ring-orange-500',
    toggle: 'peer-focus:ring-orange-300 peer-checked:bg-orange-600'
  },
  purple: {
    ring: 'focus:ring-purple-500',
    toggle: 'peer-focus:ring-purple-300 peer-checked:bg-purple-600'
  }
};

export function CardConfigItem({
  installments,
  surchargePercentage,
  isActive,
  onUpdateSurcharge,
  onToggle,
  color = 'green'
}: CardConfigItemProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="text-center mb-3">
        <h4 className="font-medium text-black">
          {installments} cuota{installments > 1 ? 's' : ''}
        </h4>
      </div>

      <div className="flex items-center justify-center">
        <input
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={surchargePercentage}
          onChange={(e) => onUpdateSurcharge(parseFloat(e.target.value) || 0)}
          className={`w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 ${colors.ring}`}
        />
        <span className="text-sm text-black ml-1">%</span>
      </div>

      <div className="mt-2 flex justify-center">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={onToggle}
            className="sr-only peer"
          />
          <div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all ${colors.toggle}`}></div>
        </label>
      </div>
    </div>
  );
}
