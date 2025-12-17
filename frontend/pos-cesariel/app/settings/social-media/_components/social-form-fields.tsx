'use client';

interface SocialMediaFormData {
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

interface SocialFormFieldsProps {
  formData: SocialMediaFormData;
  onChange: (field: string, value: any) => void;
}

export function SocialFormFields({ formData, onChange }: SocialFormFieldsProps) {
  return (
    <>
      {/* URL */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          URL
        </label>
        <input
          type="url"
          value={formData.url}
          onChange={(e) => onChange('url', e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Orden de visualización */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Orden de Visualización
        </label>
        <input
          type="number"
          min="1"
          value={formData.display_order}
          onChange={(e) => onChange('display_order', parseInt(e.target.value) || 1)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Estado activo */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_active"
          checked={formData.is_active}
          onChange={(e) => onChange('is_active', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_active" className="ml-2 block text-sm text-black">
          Red social activa
        </label>
      </div>
    </>
  );
}
