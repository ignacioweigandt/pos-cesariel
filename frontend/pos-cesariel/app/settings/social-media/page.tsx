'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ecommerceAdvancedApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  PlatformSelector,
  SocialFormFields,
  SocialConfigList,
  SocialHelpSection
} from './_components';

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

interface SocialMediaFormData {
  platform: string;
  url: string;
  icon: string;
  is_active: boolean;
  display_order: number;
}

const INITIAL_FORM_DATA: SocialMediaFormData = {
  platform: '',
  url: '',
  icon: '',
  is_active: true,
  display_order: 1,
};

export default function SocialMediaPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [configs, setConfigs] = useState<SocialMediaConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [formData, setFormData] = useState<SocialMediaFormData>(INITIAL_FORM_DATA);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || authChecked) return;

    if (!user) {
      router.push('/');
      return;
    }

    // Solo admin y manager pueden acceder a configuración
    if (!['admin', 'manager', 'ADMIN', 'MANAGER'].includes(user.role)) {
      toast.error('No tienes permisos para acceder a la configuración');
      router.push('/dashboard');
      return;
    }

    setAuthChecked(true);
    loadConfigs();
  }, [mounted, user, router, authChecked]);

  const loadConfigs = async () => {
    try {
      console.log('🔄 Cargando configuración de redes sociales...');
      console.log('👤 Usuario actual:', user);
      console.log('🔑 Token disponible:', !!localStorage.getItem('token'));

      const response = await ecommerceAdvancedApi.getSocialMediaConfigs();
      console.log('✅ Respuesta recibida:', response);
      setConfigs(response.data || []);
    } catch (error: any) {
      console.error('❌ Error completo:', error);
      console.error('❌ Status:', error.response?.status);
      console.error('❌ Data:', error.response?.data);
      console.error('❌ Message:', error.message);

      if (error.response?.status === 401) {
        toast.error('Sesión expirada. Redirigiendo al login...');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/');
        return;
      }

      toast.error(`Error cargando configuración: ${error.response?.data?.detail || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: SocialMediaConfig) => {
    setEditingId(config.id || null);
    setFormData({
      platform: config.platform,
      url: config.url,
      icon: config.icon,
      is_active: config.is_active,
      display_order: config.display_order,
    });
  };

  const handleSave = async () => {
    if (!formData.platform || !formData.url) {
      toast.error('Plataforma y URL son requeridos');
      return;
    }

    try {
      setSaving(true);

      if (editingId) {
        await ecommerceAdvancedApi.updateSocialMediaConfig(editingId, formData);
        toast.success('Configuración actualizada exitosamente');
      } else {
        await ecommerceAdvancedApi.createSocialMediaConfig(formData);
        toast.success('Configuración creada exitosamente');
      }

      setEditingId(null);
      setFormData({
        ...INITIAL_FORM_DATA,
        display_order: configs.length + 1
      });

      loadConfigs();
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta configuración?')) {
      return;
    }

    try {
      await ecommerceAdvancedApi.deleteSocialMediaConfig(id);
      toast.success('Configuración eliminada exitosamente');
      loadConfigs();
    } catch (error: any) {
      console.error('Error eliminando configuración:', error);
      toast.error('Error al eliminar la configuración');
    }
  };

  const handlePlatformSelect = (platform: { name: string; icon: string; placeholder: string }) => {
    setFormData(prev => ({
      ...prev,
      platform: platform.name,
      icon: platform.icon,
      url: platform.placeholder,
    }));
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      ...INITIAL_FORM_DATA,
      display_order: configs.length + 1
    });
  };

  if (!mounted || !authChecked || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">Redes Sociales</h1>
            <p className="text-black mt-1">
              Configura las redes sociales de tu tienda
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Configuración
          </button>
        </div>
      </div>

      {/* Formulario */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-black mb-6">
          {editingId ? 'Editar Red Social' : 'Agregar Red Social'}
        </h2>

        <div className="space-y-4">
          {/* Selección de plataforma */}
          <PlatformSelector
            selectedPlatform={formData.platform}
            onSelect={handlePlatformSelect}
          />

          {/* Campos del formulario */}
          <SocialFormFields
            formData={formData}
            onChange={handleFormChange}
          />

          {/* Botones */}
          <div className="flex space-x-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Guardando...' : (editingId ? 'Actualizar' : 'Agregar')}
            </button>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Lista de configuraciones */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-black mb-6">Redes Sociales Configuradas</h2>
        <SocialConfigList
          configs={configs}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Información adicional */}
      <SocialHelpSection />
    </div>
  );
}
