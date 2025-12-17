'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { configApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CalculatorIcon,
  PlusIcon,
  PencilIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface TaxRate {
  id: number;
  name: string;
  rate: number;
  is_active: boolean;
  is_default: boolean;
  description: string;
}

// Tasas de impuestos comunes en Argentina
const commonTaxRates = [
  { name: 'IVA General', rate: 21.0, description: 'Impuesto al Valor Agregado general' },
  { name: 'IVA Reducido', rate: 10.5, description: 'IVA para productos básicos' },
  { name: 'Exento', rate: 0.0, description: 'Productos exentos de impuestos' },
  { name: 'IVA Libros', rate: 0.0, description: 'Libros y material educativo' },
];

export default function TaxRatesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRate, setEditingRate] = useState<TaxRate | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    if (!['admin', 'manager', 'ADMIN', 'MANAGER'].includes(user.role)) {
      toast.error('No tienes permisos para acceder a la configuración');
      router.push('/dashboard');
      return;
    }

    loadTaxRates();
  }, [user, router]);

  const loadTaxRates = async () => {
    try {
      setLoading(true);
      const response = await configApi.getTaxRates();
      setTaxRates(response.data || []);
    } catch (error: any) {
      console.error('Error cargando tasas de impuestos:', error);
      toast.error('Error cargando tasas de impuestos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      const rate = taxRates.find(r => r.id === id);
      if (!rate) return;

      const updatedRate = { ...rate, is_active: !rate.is_active };
      await configApi.updateTaxRate(id, updatedRate);
      
      setTaxRates(prev => 
        prev.map(r => r.id === id ? updatedRate : r)
      );
      
      toast.success(`${rate.name} ${updatedRate.is_active ? 'activado' : 'desactivado'}`);
    } catch (error) {
      toast.error('Error actualizando tasa de impuesto');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      // Actualizar todas las tasas para que solo una sea default
      const updatedRates = taxRates.map(rate => ({
        ...rate,
        is_default: rate.id === id
      }));
      
      // Actualizar en backend
      await Promise.all(
        updatedRates.map(rate => configApi.updateTaxRate(rate.id, rate))
      );
      
      setTaxRates(updatedRates);
      
      const defaultRate = taxRates.find(r => r.id === id);
      toast.success(`${defaultRate?.name} establecido como impuesto por defecto`);
    } catch (error) {
      toast.error('Error estableciendo impuesto por defecto');
    }
  };

  const handleAddCommonRate = async (commonRate: typeof commonTaxRates[0]) => {
    try {
      const newRate = {
        ...commonRate,
        is_active: true,
        is_default: taxRates.length === 0, // Primera tasa será default
      };
      
      const response = await configApi.createTaxRate(newRate);
      setTaxRates(prev => [...prev, response.data]);
      toast.success(`${commonRate.name} agregado exitosamente`);
    } catch (error) {
      toast.error('Error agregando tasa de impuesto');
    }
  };

  const handleUpdateRate = async (id: number, newRate: number) => {
    try {
      const rate = taxRates.find(r => r.id === id);
      if (!rate) return;

      if (newRate < 0 || newRate > 100) {
        toast.error('La tasa debe estar entre 0% y 100%');
        return;
      }

      const updatedRate = { ...rate, rate: newRate };
      await configApi.updateTaxRate(id, updatedRate);
      
      setTaxRates(prev => 
        prev.map(r => r.id === id ? updatedRate : r)
      );
      
      toast.success('Tasa actualizada correctamente');
    } catch (error) {
      toast.error('Error actualizando tasa');
    }
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
            <h1 className="text-2xl font-bold text-black">Configuración de Impuestos</h1>
            <p className="text-black mt-1">
              Configura las tasas de impuestos para tus productos
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

      {/* Tasas Configuradas */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CalculatorIcon className="h-6 w-6 text-green-500 mr-3" />
            <h2 className="text-lg font-medium text-black">Impuestos Configurados</h2>
          </div>
        </div>
        
        {taxRates.length === 0 ? (
          <div className="text-center py-8">
            <CalculatorIcon className="h-12 w-12 text-black mx-auto mb-4" />
            <p className="text-black">No hay impuestos configurados</p>
            <p className="text-sm text-black">Agrega impuestos comunes desde abajo</p>
          </div>
        ) : (
          <div className="space-y-4">
            {taxRates.map((rate) => (
              <div key={rate.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-medium text-black mr-3">{rate.name}</h3>
                      {rate.is_default && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <StarIconSolid className="h-3 w-3 mr-1" />
                          Por defecto
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-black mt-1">{rate.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={rate.rate}
                        onChange={(e) => handleUpdateRate(rate.id, parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      />
                      <span className="text-sm text-black ml-1">%</span>
                    </div>
                    
                    {!rate.is_default && (
                      <button
                        onClick={() => handleSetDefault(rate.id)}
                        className="p-1 text-black hover:text-yellow-500"
                        title="Establecer como predeterminado"
                      >
                        <StarIcon className="h-5 w-5" />
                      </button>
                    )}
                    
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rate.is_active}
                        onChange={() => handleToggleStatus(rate.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Impuestos Comunes */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-black mb-4">Agregar Impuestos Comunes</h2>
        <p className="text-sm text-black mb-6">
          Selecciona los impuestos más comunes para agregarlos rápidamente
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {commonTaxRates
            .filter(common => !taxRates.some(existing => existing.name === common.name))
            .map((rate, index) => (
            <button
              key={index}
              onClick={() => handleAddCommonRate(rate)}
              className="border border-dashed border-gray-300 rounded-lg p-4 text-left hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-black">{rate.name}</h3>
                  <p className="text-sm text-black">{rate.description}</p>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {rate.rate}%
                </div>
              </div>
            </button>
          ))}
        </div>
        
        {commonTaxRates.every(common => taxRates.some(existing => existing.name === common.name)) && (
          <div className="text-center py-4">
            <p className="text-black">Todos los impuestos comunes ya están agregados</p>
          </div>
        )}
      </div>

      {/* Información de Ayuda */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-green-900 mb-2">Información Importante</h3>
        <ul className="text-sm text-green-800 space-y-1">
          <li>• El impuesto marcado como "Por defecto" se aplicará automáticamente a nuevos productos</li>
          <li>• Los impuestos desactivados no aparecerán como opción al crear productos</li>
          <li>• Puedes cambiar la tasa de cualquier impuesto editando directamente el porcentaje</li>
          <li>• Los cambios se guardan automáticamente</li>
        </ul>
      </div>
    </div>
  );
}