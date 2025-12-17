'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  PlusIcon, 
  PencilIcon, 
  TrashIcon,
  ShareIcon,
  ArrowUpIcon
} from '@heroicons/react/24/outline';
import { ecommerceAdvancedApi } from '@/lib/api';

interface SocialMediaConfig {
  id: number;
  platform: string;
  username: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

interface SocialMediaManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SocialMediaFormData {
  platform: string;
  username: string;
  url: string;
  is_active: boolean;
  display_order: number;
}

const PLATFORM_OPTIONS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'twitter', label: 'Twitter/X', icon: '🐦' },
  { value: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
];

export default function SocialMediaManager({ isOpen, onClose }: SocialMediaManagerProps) {
  const [socialMediaConfigs, setSocialMediaConfigs] = useState<SocialMediaConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SocialMediaConfig | null>(null);
  const [formData, setFormData] = useState<SocialMediaFormData>({
    platform: '',
    username: '',
    url: '',
    is_active: true,
    display_order: 1
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load social media configs
  useEffect(() => {
    if (isOpen) {
      loadSocialMediaConfigs();
    }
  }, [isOpen]);

  const loadSocialMediaConfigs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ecommerceAdvancedApi.getSocialMediaConfigs();
      console.log('Social media configs response:', response.data);
      
      // Check if the response has the expected structure
      if (response.data && Array.isArray(response.data)) {
        setSocialMediaConfigs(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setSocialMediaConfigs(response.data.data);
      } else {
        console.log('Unexpected response structure, setting empty array');
        setSocialMediaConfigs([]);
      }
    } catch (error) {
      console.error('Error loading social media configs:', error);
      setError('Error al cargar configuración de redes sociales');
      setSocialMediaConfigs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.platform.trim() || !formData.url.trim()) {
      setError('Plataforma y URL son requeridos');
      return;
    }

    try {
      setFormLoading(true);
      setError(null);

      // Prepare the data to send
      const submitData = {
        platform: formData.platform.trim(),
        username: formData.username.trim() || null,
        url: formData.url.trim(),
        is_active: formData.is_active,
        display_order: formData.display_order
      };

      console.log('Submitting form data:', submitData);

      if (editingConfig) {
        // Update existing config
        console.log('Updating existing config with ID:', editingConfig.id);
        await ecommerceAdvancedApi.updateSocialMediaConfig(editingConfig.id, submitData);
        setSuccess('Configuración de red social actualizada exitosamente');
      } else {
        // Create new config
        console.log('Creating new config...');
        const response = await ecommerceAdvancedApi.createSocialMediaConfig(submitData);
        console.log('Create response:', response.data);
        setSuccess('Configuración de red social creada exitosamente');
      }

      // Reset form and reload data
      resetForm();
      await loadSocialMediaConfigs();

    } catch (error: any) {
      console.error('Error saving social media config:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error object:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        if (errorData?.detail) {
          const errorMessage = errorData.detail;
          if (errorMessage.includes('already exists')) {
            setError(`La plataforma ${formData.platform} ya está configurada. Edita la configuración existente o elige otra plataforma.`);
          } else {
            setError(`Error: ${errorMessage}`);
          }
        } else if (Array.isArray(errorData)) {
          // Handle Pydantic validation errors
          const validationErrors = errorData.map((err: any) => `${err.loc?.join('.')}: ${err.msg}`).join(', ');
          setError(`Errores de validación: ${validationErrors}`);
        } else {
          setError('Error de validación en los datos enviados');
        }
      } else {
        setError('Error al guardar configuración de red social');
      }
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (config: SocialMediaConfig) => {
    setEditingConfig(config);
    setFormData({
      platform: config.platform,
      username: config.username,
      url: config.url,
      is_active: config.is_active,
      display_order: config.display_order
    });
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (config: SocialMediaConfig) => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la configuración de ${config.platform}?`)) {
      return;
    }

    try {
      setLoading(true);
      await ecommerceAdvancedApi.deleteSocialMediaConfig(config.id);
      setSuccess('Configuración de red social eliminada exitosamente');
      await loadSocialMediaConfigs();
    } catch (error) {
      console.error('Error deleting social media config:', error);
      setError('Error al eliminar configuración de red social');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingConfig(null);
    setFormData({
      platform: '',
      username: '',
      url: '',
      is_active: true,
      display_order: socialMediaConfigs.length + 1
    });
    setShowForm(false);
    setError(null);
    setSuccess(null);
  };

  const getAvailablePlatforms = () => {
    if (editingConfig) {
      // When editing, show all platforms but mark current one as selected
      return PLATFORM_OPTIONS;
    }
    
    // When creating, filter out platforms that already exist
    const existingPlatforms = socialMediaConfigs.map(config => config.platform);
    return PLATFORM_OPTIONS.filter(platform => !existingPlatforms.includes(platform.value));
  };

  const getPlatformIcon = (platform: string) => {
    const platformOption = PLATFORM_OPTIONS.find(p => p.value === platform);
    return platformOption?.icon || '🌐';
  };

  const getPlatformLabel = (platform: string) => {
    const platformOption = PLATFORM_OPTIONS.find(p => p.value === platform);
    return platformOption?.label || platform;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShareIcon className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Gestión de Redes Sociales
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Add New Button */}
          {!showForm && (
            <div className="mb-6">
              {getAvailablePlatforms().length > 0 ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span>Agregar Red Social</span>
                </button>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <div className="flex">
                    <div className="text-yellow-400 mr-3">⚠️</div>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        Todas las plataformas están configuradas
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Ya tienes configuradas todas las plataformas disponibles. Puedes editar las existentes.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className="mb-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingConfig ? 'Editar Red Social' : 'Nueva Red Social'}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Platform */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Plataforma *
                    </label>
                    <select
                      value={formData.platform}
                      onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    >
                      <option value="">
                        {getAvailablePlatforms().length > 0 ? 'Seleccionar plataforma' : 'No hay plataformas disponibles'}
                      </option>
                      {getAvailablePlatforms().map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.icon} {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usuario/Handle
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="@usuario"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  {/* URL */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL *
                    </label>
                    <input
                      type="url"
                      value={formData.url}
                      onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                      placeholder="https://www.platform.com/username"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      required
                    />
                  </div>

                  {/* Display Order */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Orden de visualización
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    />
                  </div>

                  {/* Active Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                      Activa
                    </label>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                  >
                    {formLoading ? 'Guardando...' : (editingConfig ? 'Actualizar' : 'Crear')}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Social Media List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Redes Sociales Configuradas ({socialMediaConfigs.length})
            </h3>

            {loading ? (
              <div className="text-center py-4">
                <div className="text-gray-500">Cargando configuraciones...</div>
              </div>
            ) : socialMediaConfigs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShareIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No hay redes sociales configuradas</p>
                <p className="text-sm">Haz clic en "Agregar Red Social" para comenzar</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialMediaConfigs
                  .sort((a, b) => a.display_order - b.display_order)
                  .map((config) => (
                    <div
                      key={config.id}
                      className={`border rounded-lg p-4 ${
                        config.is_active ? 'border-gray-200 bg-white' : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {getPlatformIcon(config.platform)}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {getPlatformLabel(config.platform)}
                            </h4>
                            {config.username && (
                              <p className="text-sm text-gray-600">@{config.username}</p>
                            )}
                            <a
                              href={config.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 truncate block max-w-48"
                            >
                              {config.url}
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <ArrowUpIcon className="h-3 w-3" />
                            <span>{config.display_order}</span>
                          </div>
                          
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              config.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {config.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                          
                          <button
                            onClick={() => handleEdit(config)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(config)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Las redes sociales aparecerán en el footer del e-commerce según el orden configurado
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}