'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BannerPreview } from './banner-preview';
import { BannerImageUpload } from './banner-image-upload';
import { BannerFormFields } from './banner-form-fields';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  banner_order: number;
  created_at: string;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  link_url: string;
  button_text: string;
  is_active: boolean;
  banner_order: number;
}

interface BannerFormDialogProps {
  isOpen: boolean;
  editingBanner: Banner | null;
  formData: BannerFormData;
  previewUrl: string | null;
  isSubmitting: boolean;
  isUploading: boolean;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<BannerFormData>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
}

export function BannerFormDialog({
  isOpen,
  editingBanner,
  formData,
  previewUrl,
  isSubmitting,
  isUploading,
  onOpenChange,
  onFormChange,
  onFileSelect,
  onSave
}: BannerFormDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-black">
            {editingBanner ? 'Editar Banner' : 'Crear Nuevo Banner'}
          </DialogTitle>
          <DialogDescription>
            {editingBanner
              ? 'Modifica la información del banner'
              : 'Completa la información para crear un nuevo banner'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview de imagen */}
          {previewUrl && <BannerPreview imageUrl={previewUrl} />}

          {/* Upload de imagen */}
          <BannerImageUpload
            isEditing={!!editingBanner}
            isUploading={isUploading}
            onFileSelect={onFileSelect}
          />

          {/* Campos del formulario */}
          <BannerFormFields
            formData={formData}
            onChange={onFormChange}
          />

          {/* Botones */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              onClick={onSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : (editingBanner ? 'Actualizar' : 'Crear')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
