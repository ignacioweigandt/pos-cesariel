'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { ecommerceAdvancedApi } from '@/lib/api';
import { BannersList, BannerFormDialog } from './_components';

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

const INITIAL_FORM_DATA: BannerFormData = {
  title: '',
  subtitle: '',
  link_url: '',
  button_text: '',
  is_active: true,
  banner_order: 1
};

export default function StoreBannersPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setIsLoading(true);
      const response = await ecommerceAdvancedApi.getStoreBanners();
      setBanners(response.data || []);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Error al cargar los banners');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBanner = () => {
    setEditingBanner(null);
    setFormData({
      ...INITIAL_FORM_DATA,
      banner_order: banners.length + 1
    });
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      link_url: banner.link_url || '',
      button_text: banner.button_text || '',
      is_active: banner.is_active,
      banner_order: banner.banner_order
    });
    setSelectedFile(null);
    setPreviewUrl(banner.image_url);
    setIsModalOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten archivos de imagen (JPG, PNG, GIF, WebP)');
      return;
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es muy grande. Máximo 5MB');
      return;
    }

    setSelectedFile(file);

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveBanner = async () => {
    try {
      setIsSubmitting(true);

      // Validar datos requeridos
      if (!formData.title.trim()) {
        toast.error('El título es requerido');
        return;
      }

      if (!editingBanner && !selectedFile) {
        toast.error('Debe seleccionar una imagen');
        return;
      }

      if (editingBanner) {
        // Actualizar banner existente
        const updateData = {
          title: formData.title,
          subtitle: formData.subtitle || null,
          link_url: formData.link_url || null,
          button_text: formData.button_text || null,
          is_active: formData.is_active,
          banner_order: formData.banner_order
        };

        await ecommerceAdvancedApi.updateStoreBanner(editingBanner.id, updateData);
        toast.success('Banner actualizado exitosamente');
      } else {
        // Crear nuevo banner
        const formDataToSend = new FormData();
        formDataToSend.append('file', selectedFile!);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('subtitle', formData.subtitle);
        formDataToSend.append('link_url', formData.link_url);
        formDataToSend.append('button_text', formData.button_text);
        formDataToSend.append('is_active', formData.is_active.toString());
        formDataToSend.append('banner_order', formData.banner_order.toString());

        await ecommerceAdvancedApi.createStoreBanner(formDataToSend);
        toast.success('Banner creado exitosamente');
      }

      setIsModalOpen(false);
      loadBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Error al guardar el banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (banner: Banner) => {
    if (!confirm(`¿Estás seguro de eliminar el banner "${banner.title}"?`)) {
      return;
    }

    try {
      await ecommerceAdvancedApi.deleteStoreBanner(banner.id);
      toast.success('Banner eliminado exitosamente');
      loadBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error al eliminar el banner');
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      const updateData = {
        ...banner,
        is_active: !banner.is_active
      };

      await ecommerceAdvancedApi.updateStoreBanner(banner.id, updateData);
      toast.success(`Banner ${banner.is_active ? 'desactivado' : 'activado'} exitosamente`);
      loadBanners();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Error al cambiar el estado del banner');
    }
  };

  const handleFormChange = (data: Partial<BannerFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-black">Gestión de Banners</h1>
              <p className="text-black">Administra los banners de tu tienda online</p>
            </div>
          </div>
          <Button onClick={handleCreateBanner}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Banner
          </Button>
        </div>

        {/* Lista de banners */}
        <BannersList
          banners={banners}
          onEdit={handleEditBanner}
          onToggleActive={handleToggleActive}
          onDelete={handleDeleteBanner}
          onCreateNew={handleCreateBanner}
        />

        {/* Modal para crear/editar banner */}
        <BannerFormDialog
          isOpen={isModalOpen}
          editingBanner={editingBanner}
          formData={formData}
          previewUrl={previewUrl}
          isSubmitting={isSubmitting}
          isUploading={isUploading}
          onOpenChange={setIsModalOpen}
          onFormChange={handleFormChange}
          onFileSelect={handleFileSelect}
          onSave={handleSaveBanner}
        />
      </div>
    </div>
  );
}
