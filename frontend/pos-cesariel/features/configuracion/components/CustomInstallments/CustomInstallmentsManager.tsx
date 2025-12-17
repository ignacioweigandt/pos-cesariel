/**
 * CustomInstallmentsManager Component
 *
 * NEW FUNCTIONALITY: Allows adding custom installment plans
 * for bancarizadas and no_bancarizadas cards
 */

'use client';

import { useState } from 'react';
import { useCustomInstallments } from '../../hooks';
import type { CardType, CustomInstallmentCreate } from '../../types';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CustomInstallmentsManagerProps {
  cardType: CardType;
  title: string;
  color?: string;
}

export function CustomInstallmentsManager({
  cardType,
  title,
  color = 'blue',
}: CustomInstallmentsManagerProps) {
  const {
    installments,
    loading,
    createInstallment,
    updateInstallment,
    deleteInstallment,
    toggleActive,
  } = useCustomInstallments({ cardType });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CustomInstallmentCreate>({
    card_type: cardType,
    installments: 1,
    surcharge_percentage: 0,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      toast.error('La descripción es obligatoria');
      return;
    }

    if (formData.installments < 1 || formData.installments > 60) {
      toast.error('Las cuotas deben estar entre 1 y 60');
      return;
    }

    if (formData.surcharge_percentage < 0 || formData.surcharge_percentage > 100) {
      toast.error('El recargo debe estar entre 0% y 100%');
      return;
    }

    try {
      if (editingId) {
        await updateInstallment(editingId, formData);
      } else {
        await createInstallment(formData);
      }

      // Reset form
      setFormData({
        card_type: cardType,
        installments: 1,
        surcharge_percentage: 0,
        description: '',
      });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error saving custom installment:', err);
    }
  };

  const handleEdit = (id: number) => {
    const installment = installments.find(i => i.id === id);
    if (!installment) return;

    setFormData({
      card_type: installment.card_type,
      installments: installment.installments,
      surcharge_percentage: installment.surcharge_percentage,
      description: installment.description,
    });
    setEditingId(id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    const installment = installments.find(i => i.id === id);
    if (!installment) return;

    if (!confirm(`¿Eliminar la cuota "${installment.description}"?`)) {
      return;
    }

    try {
      await deleteInstallment(id);
    } catch (err) {
      console.error('Error deleting installment:', err);
    }
  };

  const handleCancel = () => {
    setFormData({
      card_type: cardType,
      installments: 1,
      surcharge_percentage: 0,
      description: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const filteredInstallments = installments.filter(i => i.card_type === cardType);

  return (
    <div className={`border border-${color}-200 rounded-lg p-4 bg-${color}-50`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold text-${color}-900 flex items-center`}>
          <CreditCardIcon className="h-5 w-5 mr-2" />
          {title} - Cuotas Personalizadas
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`inline-flex items-center px-3 py-1.5 text-sm border border-${color}-300 rounded-md text-${color}-700 bg-white hover:bg-${color}-100`}
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Nueva Cuota
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {editingId ? 'Editar Cuota Personalizada' : 'Nueva Cuota Personalizada'}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Cuotas
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.installments}
                onChange={(e) => setFormData({ ...formData, installments: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recargo (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.surcharge_percentage}
                onChange={(e) => setFormData({ ...formData, surcharge_percentage: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Plan especial 18 cuotas"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm border border-transparent rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      )}

      {/* Installments List */}
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredInstallments.length === 0 ? (
        <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500">No hay cuotas personalizadas configuradas</p>
          <p className="text-sm text-gray-400 mt-1">Haz clic en "Nueva Cuota" para agregar una</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredInstallments
            .sort((a, b) => a.installments - b.installments)
            .map((installment) => (
              <div
                key={installment.id}
                className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">
                        {installment.installments} cuota{installment.installments > 1 ? 's' : ''}
                      </span>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                        installment.surcharge_percentage > 0
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {installment.surcharge_percentage > 0
                          ? `+${installment.surcharge_percentage}%`
                          : 'Sin recargo'
                        }
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{installment.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={installment.is_active}
                        onChange={() => toggleActive(installment.id)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>

                    <button
                      onClick={() => handleEdit(installment.id)}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(installment.id)}
                      className="p-1 text-red-600 hover:text-red-800"
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

      {/* Help Text */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-xs text-blue-800">
          <strong>Cuotas personalizadas:</strong> Puedes agregar planes de cuotas específicos para {title.toLowerCase()}.
          Por ejemplo: 15 cuotas, 18 cuotas, 24 cuotas, etc. Cada plan puede tener su propio recargo.
        </p>
      </div>
    </div>
  );
}
