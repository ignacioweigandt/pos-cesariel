'use client';

import { GlobeAltIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SocialMediaConfig {
  id?: number;
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
  display_order: number;
  created_at?: string;
  updated_at?: string;
}

interface SocialConfigListProps {
  configs: SocialMediaConfig[];
  onEdit: (config: SocialMediaConfig) => void;
  onDelete: (id: number) => void;
}

export function SocialConfigList({ configs, onEdit, onDelete }: SocialConfigListProps) {
  if (configs.length === 0) {
    return (
      <div className="text-center py-8">
        <GlobeAltIcon className="mx-auto h-12 w-12 text-black" />
        <p className="text-black mt-2">No hay redes sociales configuradas</p>
        <p className="text-sm text-black">Agrega tu primera red social usando el formulario de arriba</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {configs
        .sort((a, b) => a.display_order - b.display_order)
        .map((config) => (
          <div
            key={config.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="text-2xl">{config.icon}</div>
              <div>
                <h3 className="font-medium text-black">{config.platform}</h3>
                <p className="text-sm text-black break-all">{config.url}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                config.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-black'
              }`}>
                {config.is_active ? 'Activo' : 'Inactivo'}
              </span>
              <span className="text-sm text-black">#{config.display_order}</span>
              <button
                onClick={() => onEdit(config)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => onDelete(config.id!)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
    </div>
  );
}
