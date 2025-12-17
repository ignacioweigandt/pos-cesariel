'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import {
  PaymentConfigsList,
  PaymentConfigFormModal,
  PaymentConfigHelpSection
} from './_components';

interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface FormData {
  payment_type: string;
  card_type: string;
  installments: number;
  surcharge_percentage: number;
  description: string;
}

const INITIAL_FORM_DATA: FormData = {
  payment_type: 'efectivo',
  card_type: '',
  installments: 1,
  surcharge_percentage: 0,
  description: ''
};

export default function PaymentConfigPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [configs, setConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);

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
      toast.error('No tienes permisos para acceder a la configuración de pagos');
      router.push('/dashboard');
      return;
    }

    setAuthChecked(true);
    loadPaymentConfigs();
  }, [mounted, user, router, authChecked]);

  const loadPaymentConfigs = async () => {
    try {
      const response = await configApi.getPaymentConfigs();
      setConfigs(response.data);
    } catch (error: any) {
      console.error('Error cargando configuraciones de pago:', error);
      toast.error('Error cargando configuraciones de pago');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: PaymentConfig) => {
    setEditingConfig(config);
    setFormData({
      payment_type: config.payment_type,
      card_type: config.card_type || '',
      installments: config.installments,
      surcharge_percentage: Number(config.surcharge_percentage),
      description: config.description || ''
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      if (editingConfig) {
        await configApi.updatePaymentConfig(editingConfig.id, formData);
        toast.success('Configuración actualizada exitosamente');
      } else {
        await configApi.createPaymentConfig(formData);
        toast.success('Configuración creada exitosamente');
        setShowAddForm(false);
      }

      setIsEditing(false);
      setEditingConfig(null);
      resetForm();
      loadPaymentConfigs();
    } catch (error: any) {
      console.error('Error guardando configuración:', error);
      toast.error('Error guardando configuración');
    }
  };

  const handleDelete = async (config: PaymentConfig) => {
    if (!confirm(`¿Está seguro de eliminar la configuración "${config.description}"?`)) {
      return;
    }

    try {
      await configApi.deletePaymentConfig(config.id);
      toast.success('Configuración eliminada exitosamente');
      loadPaymentConfigs();
    } catch (error: any) {
      console.error('Error eliminando configuración:', error);
      toast.error('Error eliminando configuración');
    }
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setEditingConfig(null);
    setIsEditing(false);
    setShowAddForm(false);
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseModal = () => {
    resetForm();
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
            <h1 className="text-2xl font-bold text-black">Configuración de Pagos</h1>
            <p className="text-black mt-1">
              Gestiona los métodos de pago y recargos del sistema POS
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nueva Configuración
            </button>
            <button
              onClick={() => router.push('/settings')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver a Configuración
            </button>
          </div>
        </div>
      </div>

      {/* Payment Configurations */}
      <PaymentConfigsList
        configs={configs}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Add/Edit Form Modal */}
      <PaymentConfigFormModal
        isOpen={isEditing || showAddForm}
        editingConfig={editingConfig}
        formData={formData}
        onClose={handleCloseModal}
        onSave={handleSave}
        onChange={handleFormChange}
      />

      {/* Help Section */}
      <PaymentConfigHelpSection />
    </div>
  );
}
