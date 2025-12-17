'use client';

interface SingleCardConfigProps {
  title: string;
  description: string;
  surchargePercentage: number;
  isActive: boolean;
  onUpdateSurcharge: (surcharge: number) => void;
  onToggle: () => void;
  color?: 'orange' | 'purple';
}

const colorClasses = {
  orange: {
    ring: 'focus:ring-orange-500',
    toggle: 'peer-focus:ring-orange-300 peer-checked:bg-orange-600'
  },
  purple: {
    ring: 'focus:ring-purple-500',
    toggle: 'peer-focus:ring-purple-300 peer-checked:bg-purple-600'
  }
};

export function SingleCardConfig({
  title,
  description,
  surchargePercentage,
  isActive,
  onUpdateSurcharge,
  onToggle,
  color = 'orange'
}: SingleCardConfigProps) {
  const colors = colorClasses[color];

  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-black">{title}</h4>
          <p className="text-sm text-black">{description}</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <label className="text-sm font-medium text-black mr-2">
              Recargo:
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={surchargePercentage}
              onChange={(e) => onUpdateSurcharge(parseFloat(e.target.value) || 0)}
              className={`w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center focus:outline-none focus:ring-2 ${colors.ring}`}
            />
            <span className="text-sm text-black ml-1">%</span>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={onToggle}
              className="sr-only peer"
            />
            <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${colors.toggle}`}></div>
          </label>
        </div>
      </div>
    </div>
  );
}
