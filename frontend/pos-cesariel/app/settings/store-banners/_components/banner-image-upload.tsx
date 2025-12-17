'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BannerImageUploadProps {
  isEditing: boolean;
  isUploading: boolean;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function BannerImageUpload({
  isEditing,
  isUploading,
  onFileSelect
}: BannerImageUploadProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="banner-image" className="text-black">
        {isEditing ? 'Cambiar Imagen' : 'Imagen del Banner'}
      </Label>
      <Input
        id="banner-image"
        type="file"
        accept="image/*"
        onChange={onFileSelect}
        disabled={isUploading}
      />
      <p className="text-xs text-black">
        Formatos: JPG, PNG, GIF, WebP. Máximo 5MB. Recomendado: 1200x400px
      </p>
    </div>
  );
}
