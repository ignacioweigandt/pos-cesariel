'use client';

import { useState, useEffect } from 'react';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { configApi } from '@/lib/api';
import { apiClient } from '@/shared/api/client';

interface EcommerceConfig {
  id?: number;
  store_name: string;
  store_description: string;
  store_logo: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_percentage: number;
}

interface LogoManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export default function LogoManager({
  isOpen,
  onClose,
  onConfigUpdated
}: LogoManagerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState<EcommerceConfig>({
    store_name: '',
    store_description: '',
    store_logo: null,
    contact_email: '',
    contact_phone: '',
    address: '',
    currency: 'ARS',
    tax_percentage: 0
  });

  // Cargar configuración cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadConfig();
    }
  }, [isOpen]);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await configApi.getEcommerceConfig();
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error('Error loading e-commerce config:', error);
      toast.error('Error al cargar la configuración de la tienda');
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar upload de logo
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    try {
      setIsUploading(true);
      
      // Crear FormData para upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'store-logo');

      // Upload usando el endpoint específico para logo con apiClient
      const response = await apiClient.post('/config/upload-logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      const result = response.data;
      
      // Actualizar estado local
      setConfig(prev => ({
        ...prev,
        store_logo: result.url
      }));

      toast.success('Logo subido exitosamente');
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Error al subir el logo. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  // Eliminar logo
  const handleRemoveLogo = async () => {
    try {
      setConfig(prev => ({
        ...prev,
        store_logo: null
      }));
      toast.success('Logo eliminado');
    } catch (error) {
      console.error('Error removing logo:', error);
      toast.error('Error al eliminar el logo');
    }
  };

  // Guardar configuración
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (config.id) {
        await configApi.updateEcommerceConfig(config);
      } else {
        await configApi.createEcommerceConfig(config);
      }
      
      toast.success('Configuración guardada exitosamente');
      onConfigUpdated?.();
      onClose();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-5 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Gestión de Logo</h3>
              <p className="text-sm text-gray-600">
                Configura el logo y la información de tu tienda online
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Información de la tienda */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Información de la Tienda</h4>
                  <p className="text-sm text-gray-600">
                    Configura el nombre y descripción de tu tienda
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Tienda
                    </label>
                    <input
                      type="text"
                      value={config.store_name}
                      onChange={(e) => setConfig(prev => ({ ...prev, store_name: e.target.value }))}
                      placeholder="Mi Tienda Online"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={config.store_description}
                      onChange={(e) => setConfig(prev => ({ ...prev, store_description: e.target.value }))}
                      placeholder="Descripción de tu tienda..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Gestión de Logo */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Logo de la Tienda</h4>
                  <p className="text-sm text-gray-600">
                    Sube el logo de tu tienda. Se mostrará en el header del e-commerce.
                  </p>
                </div>
                <div className="space-y-4">
                  {/* Vista previa del logo actual */}
                  {config.store_logo ? (
                    <div className="space-y-4">
                      <div className="text-sm font-medium text-black">Logo Actual:</div>
                      <div className="relative inline-block">
                        <Image
                          src={config.store_logo}
                          alt="Logo de la tienda"
                          width={200}
                          height={100}
                          className="object-contain border rounded-lg bg-gray-50 p-4"
                        />
                        <button
                          onClick={handleRemoveLogo}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No hay logo configurado</p>
                    </div>
                  )}

                  {/* Upload de nuevo logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {config.store_logo ? 'Cambiar Logo' : 'Subir Logo'}
                    </label>
                    <div className="mt-1">
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploading}
                        className="hidden"
                      />
                      <button
                        onClick={() => document.getElementById('logo-upload')?.click()}
                        disabled={isUploading}
                        className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                        {isUploading ? 'Subiendo...' : (config.store_logo ? 'Cambiar Logo' : 'Subir Logo')}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Formatos: JPG, PNG, GIF, WebP. Máximo 5MB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de contacto */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="mb-4">
                  <h4 className="text-lg font-medium text-gray-900">Información de Contacto</h4>
                  <p className="text-sm text-gray-600">
                    Información que se mostrará en la tienda online
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email de Contacto
                      </label>
                      <input
                        type="email"
                        value={config.contact_email}
                        onChange={(e) => setConfig(prev => ({ ...prev, contact_email: e.target.value }))}
                        placeholder="contacto@mitienda.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de Contacto
                      </label>
                      <input
                        type="text"
                        value={config.contact_phone}
                        onChange={(e) => setConfig(prev => ({ ...prev, contact_phone: e.target.value }))}
                        placeholder="+54 9 11 1234-5678"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      value={config.address}
                      onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Buenos Aires, Argentina"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}