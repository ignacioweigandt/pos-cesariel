'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

interface BannerFormData {
  title: string;
  subtitle: string;
  link_url: string;
  button_text: string;
  is_active: boolean;
  banner_order: number;
}

interface BannerFormFieldsProps {
  formData: BannerFormData;
  onChange: (data: Partial<BannerFormData>) => void;
}

export function BannerFormFields({ formData, onChange }: BannerFormFieldsProps) {
  return (
    <>
      {/* Información del banner */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-black">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Título del banner"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="banner_order" className="text-black">Orden</Label>
          <Input
            id="banner_order"
            type="number"
            min="1"
            value={formData.banner_order}
            onChange={(e) => onChange({ banner_order: parseInt(e.target.value) || 1 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle" className="text-black">Subtítulo</Label>
        <Textarea
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => onChange({ subtitle: e.target.value })}
          placeholder="Subtítulo opcional"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="link_url" className="text-black">URL de Enlace</Label>
          <Input
            id="link_url"
            value={formData.link_url}
            onChange={(e) => onChange({ link_url: e.target.value })}
            placeholder="/productos?categoria=ofertas"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="button_text" className="text-black">Texto del Botón</Label>
          <Input
            id="button_text"
            value={formData.button_text}
            onChange={(e) => onChange({ button_text: e.target.value })}
            placeholder="Ver Ofertas"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => onChange({ is_active: checked })}
        />
        <Label htmlFor="is_active" className="text-black">Banner Activo</Label>
      </div>
    </>
  );
}
