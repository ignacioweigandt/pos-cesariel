'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useRouteProtection } from '@/shared/hooks/useRouteProtection';
import toast from 'react-hot-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import {
  PaymentMethodsList,
  CardSurchargesSection,
  ChangesAlert,
  HelpInfo
} from './_components';

interface PaymentMethod {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  requires_change: boolean;
  icon: string;
}

interface PaymentConfig {
  id: number;
  payment_type: string;
  card_type?: string;
  installments: number;
  surcharge_percentage: number;
  is_active: boolean;
  description?: string;
}

export default function PaymentMethodsPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  const { user } = useAuth();
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [originalPaymentConfigs, setOriginalPaymentConfigs] = useState<PaymentConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!['admin', 'manager', 'ADMIN', 'MANAGER'].includes(user.role)) {
      toast.error('No tienes permisos para acceder a la configuración');
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [methodsResponse, configsResponse] = await Promise.all([
        configApi.getPaymentMethods(),
        configApi.getPaymentConfigs()
      ]);

      setPaymentMethods(methodsResponse.data || []);
      setPaymentConfigs(configsResponse.data || []);
      setOriginalPaymentConfigs(JSON.parse(JSON.stringify(configsResponse.data || [])));
      setHasChanges(false);
    } catch (error: any) {
      console.error('Error cargando configuración de pagos:', error);
      toast.error('Error cargando configuración de pagos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMethod = async (id: number) => {
    try {
      const method = paymentMethods.find(m => m.id === id);
      if (!method) return;

      const updatedMethod = { ...method, is_active: !method.is_active };
      await configApi.updatePaymentMethod(id, updatedMethod);

      setPaymentMethods(prev =>
        prev.map(m => m.id === id ? updatedMethod : m)
      );

      toast.success(`${method.name} ${updatedMethod.is_active ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error actualizando método de pago');
    }
  };

  const handleUpdateSurcharge = (id: number, surcharge: number) => {
    const config = paymentConfigs.find(c => c.id === id);
    if (!config) return;

    if (surcharge < 0 || surcharge > 100) {
      toast.error('El recargo debe estar entre 0% y 100%');
      return;
    }

    const updatedConfig = { ...config, surcharge_percentage: surcharge };

    setPaymentConfigs(prev =>
      prev.map(c => c.id === id ? updatedConfig : c)
    );

    setHasChanges(true);
  };

  const handleToggleConfig = (id: number) => {
    const config = paymentConfigs.find(c => c.id === id);
    if (!config) return;

    const updatedConfig = { ...config, is_active: !config.is_active };

    setPaymentConfigs(prev =>
      prev.map(c => c.id === id ? updatedConfig : c)
    );

    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);

      const changedConfigs = paymentConfigs.filter(config => {
        const original = originalPaymentConfigs.find(orig => orig.id === config.id);
        return original && (
          original.surcharge_percentage !== config.surcharge_percentage ||
          original.is_active !== config.is_active
        );
      });

      const updatePromises = changedConfigs.map(config =>
        configApi.updatePaymentConfig(config.id, {
          surcharge_percentage: config.surcharge_percentage,
          is_active: config.is_active
        })
      );

      await Promise.all(updatePromises);

      setOriginalPaymentConfigs(JSON.parse(JSON.stringify(paymentConfigs)));
      setHasChanges(false);

      toast.success(`Configuración guardada correctamente (${changedConfigs.length} cambios aplicados)`);
    } catch (error) {
      toast.error('Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setPaymentConfigs(JSON.parse(JSON.stringify(originalPaymentConfigs)));
    setHasChanges(false);
    toast.info('Cambios descartados');
  };

  if (loading) {
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
            <h1 className="text-2xl font-bold text-black">Métodos de Pago</h1>
            <p className="text-black mt-1">
              Configura las formas de pago disponibles en tu negocio
            </p>
          </div>
          <button
            onClick={() => router.push('/settings')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-black bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver a Configuración
          </button>
        </div>
      </div>

      {/* Métodos de Pago Principales */}
      <PaymentMethodsList
        methods={paymentMethods}
        onToggleMethod={handleToggleMethod}
      />

      {/* Recargos y Comisiones */}
      <CardSurchargesSection
        configs={paymentConfigs}
        onUpdateSurcharge={handleUpdateSurcharge}
        onToggleConfig={handleToggleConfig}
      />

      {/* Botones de Acción */}
      <ChangesAlert
        hasChanges={hasChanges}
        saving={saving}
        onSave={handleSaveChanges}
        onDiscard={handleDiscardChanges}
      />

      {/* Información de Ayuda */}
      <HelpInfo />
    </div>
  );
}
