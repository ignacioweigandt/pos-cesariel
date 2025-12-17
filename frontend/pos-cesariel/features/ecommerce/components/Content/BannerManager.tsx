'use client';

import { useState, useEffect, useRef } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  PhotoIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  EyeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface StoreBanner {
  id: number;
  title: string;
  subtitle?: string;
  image_url: string;
  link_url?: string;
  button_text?: string;
  banner_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BannerManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onBannersUpdated?: () => void;
}

interface BannerFormData {
  title: string;
  subtitle: string;
  button_text: string;
  file?: File;
}

export default function BannerManager({
  isOpen,
  onClose,
  onBannersUpdated
}: BannerManagerProps) {
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<StoreBanner | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    button_text: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadBanners();
    }
  }, [isOpen]);

  const loadBanners = async () => {
    setLoading(true);
    try {
      const response = await ecommerceAdvancedApi.getStoreBanners();
      setBanners(response.data);
    } catch (error) {
      console.error('Error loading banners:', error);
      toast.error('Error cargando banners');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!editingBanner && !formData.file) {
      toast.error('La imagen es requerida');
      return;
    }

    // Check banner limit for new banners
    if (!editingBanner && banners.length >= 3) {
      toast.error('Máximo 3 banners permitidos');
      return;
    }

    setUploading(true);
    try {
      if (editingBanner) {
        // Check if we need to update the image
        if (formData.file) {
          // Update banner with new image using FormData
          const submitData = new FormData();
          submitData.append('title', formData.title);
          submitData.append('subtitle', formData.subtitle || '');
          submitData.append('button_text', formData.button_text || '');
          submitData.append('file', formData.file);
          
          // Use create endpoint for image update (backend will handle the replacement)
          await ecommerceAdvancedApi.updateStoreBannerWithImage(editingBanner.id, submitData);
          toast.success('Banner e imagen actualizados exitosamente');
        } else {
          // Update existing banner metadata only
          await ecommerceAdvancedApi.updateStoreBanner(editingBanner.id, {
            title: formData.title,
            subtitle: formData.subtitle || null,
            button_text: formData.button_text || null
          });
          toast.success('Banner actualizado exitosamente');
        }
      } else {
        // Create new banner
        const submitData = new FormData();
        submitData.append('title', formData.title);
        if (formData.subtitle) submitData.append('subtitle', formData.subtitle);
        if (formData.button_text) submitData.append('button_text', formData.button_text);
        if (formData.file) submitData.append('file', formData.file);

        await ecommerceAdvancedApi.createStoreBanner(submitData);
        toast.success('Banner creado exitosamente');
      }
      
      loadBanners();
      onBannersUpdated?.();
      handleCancelForm();
    } catch (error: any) {
      console.error('Error saving banner:', error);
      const errorMessage = error.response?.data?.detail || 'Error guardando banner';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de archivo no válido. Usar: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    setFormData(prev => ({ ...prev, file }));
  };

  const handleEditBanner = (banner: StoreBanner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || ''
    });
    setShowForm(true);
  };

  const handleDeleteBanner = async (bannerId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este banner?')) {
      return;
    }

    try {
      await ecommerceAdvancedApi.deleteStoreBanner(bannerId);
      toast.success('Banner eliminado exitosamente');
      loadBanners();
      onBannersUpdated?.();
    } catch (error) {
      console.error('Error deleting banner:', error);
      toast.error('Error eliminando banner');
    }
  };

  const handleToggleActive = async (banner: StoreBanner) => {
    try {
      await ecommerceAdvancedApi.updateStoreBanner(banner.id, {
        is_active: !banner.is_active
      });
      toast.success(`Banner ${banner.is_active ? 'desactivado' : 'activado'}`);
      loadBanners();
      onBannersUpdated?.();
    } catch (error) {
      console.error('Error toggling banner status:', error);
      toast.error('Error actualizando estado del banner');
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      subtitle: '',
      button_text: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setBanners([]);
    setPreviewImage(null);
    handleCancelForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-5 mx-auto p-5 border w-full max-w-6xl shadow-lg rounded-md bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Gestión de Banners
              </h3>
              <p className="text-sm text-gray-600">
                Máximo 3 banners para la página principal
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!showForm && banners.length < 3 && (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Banner
                </button>
              )}
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Banner Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner'}
              </h4>
              
              <form onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Título del banner"
                      required
                    />
                  </div>

                  {/* Subtitle and Button Text in a row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Subtítulo opcional"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Texto del Botón
                      </label>
                      <input
                        type="text"
                        value={formData.button_text}
                        onChange={(e) => setFormData(prev => ({ ...prev, button_text: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ver más"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {editingBanner ? 'Cambiar Imagen del Banner' : 'Imagen del Banner *'}
                    </label>
                    
                    {/* Vista previa de imagen actual (solo en modo edición) */}
                    {editingBanner && editingBanner.image_url && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Imagen actual:</p>
                        <img
                          src={editingBanner.image_url}
                          alt={editingBanner.title}
                          className="h-24 w-auto object-cover border rounded-md"
                        />
                      </div>
                    )}
                    
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                            <span>{editingBanner ? 'Seleccionar nueva imagen' : 'Seleccionar archivo'}</span>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleFileSelect}
                              className="sr-only"
                              required={!editingBanner}
                            />
                          </label>
                          <p className="pl-1">o arrastrar y soltar</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP hasta 5MB
                        </p>
                        {formData.file && (
                          <p className="text-xs text-green-600">
                            Archivo seleccionado: {formData.file.name}
                          </p>
                        )}
                        {editingBanner && !formData.file && (
                          <p className="text-xs text-gray-500">
                            Opcional: Selecciona una nueva imagen para reemplazar la actual
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Guardando...
                      </div>
                    ) : (
                      editingBanner ? 'Actualizar' : 'Crear Banner'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Banners List */}
          {!loading && (
            <div className="space-y-4">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="flex">
                    {/* Banner Image */}
                    <div className="w-32 h-20 flex-shrink-0">
                      <img
                        src={banner.image_url}
                        alt={banner.title}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setPreviewImage(banner.image_url)}
                      />
                    </div>

                    {/* Banner Info */}
                    <div className="flex-1 p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-md font-medium text-gray-900">{banner.title}</h4>
                          {banner.subtitle && (
                            <p className="text-sm text-gray-600 mt-1">{banner.subtitle}</p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-xs text-gray-500">
                              Orden: {banner.banner_order}
                            </span>
                            {banner.button_text && (
                              <div className="flex items-center text-xs text-indigo-600">
                                <span>Botón: {banner.button_text}</span>
                              </div>
                            )}
                            <span className={`text-xs px-2 py-1 rounded ${
                              banner.is_active 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {banner.is_active ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setPreviewImage(banner.image_url)}
                            className="p-2 text-gray-400 hover:text-indigo-600"
                            title="Ver imagen"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleToggleActive(banner)}
                            className={`p-2 hover:${banner.is_active ? 'text-red-600' : 'text-green-600'}`}
                            title={banner.is_active ? 'Desactivar' : 'Activar'}
                          >
                            <GlobeAltIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleEditBanner(banner)}
                            className="p-2 text-gray-400 hover:text-blue-600"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="p-2 text-gray-400 hover:text-red-600"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && banners.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay banners
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience creando banners para la página principal
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Instrucciones:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Máximo 3 banners para la página principal</li>
              <li>• Formatos soportados: JPG, PNG, GIF, WebP</li>
              <li>• Tamaño máximo: 5MB por imagen</li>
              <li>• Los banners inactivos no se muestran en la tienda</li>
              <li>• El enlace y botón son opcionales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}