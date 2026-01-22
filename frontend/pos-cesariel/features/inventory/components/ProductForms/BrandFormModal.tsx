'use client';

import { useState, useEffect } from 'react';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Brand {
  id: number;
  name: string;
  description?: string;
}

interface BrandFormData {
  name: string;
  description: string;
}

interface BrandFormModalProps {
  isOpen: boolean;
  brand: Brand | null;
  brands: Brand[];
  onClose: () => void;
  onSave: (brandData: any) => Promise<void>;
  onDelete: (brandId: number) => Promise<void>;
}

/**
 * BrandFormModal Component
 *
 * Modal for creating, editing, and deleting brands:
 * - Create/Edit form
 * - List of existing brands with delete option
 */
export function BrandFormModal({
  isOpen,
  brand,
  brands,
  onClose,
  onSave,
  onDelete,
}: BrandFormModalProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'list'>('form');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Initialize form when brand changes
  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        description: brand.description || '',
      });
      setActiveTab('form');
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const brandData = {
        name: formData.name,
        description: formData.description || null,
      };

      await onSave(brandData);
      setFormData({ name: '', description: '' });
      setActiveTab('list');
    } catch (error: any) {
      console.error('Error submitting brand:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al guardar la marca';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brandId: number, brandName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la marca "${brandName}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    setDeletingId(brandId);
    try {
      await onDelete(brandId);
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Error al eliminar la marca';
      alert(`Error: ${errorMessage}`);
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Gestión de Marcas
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab('form')}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'form'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {brand ? 'Editar Marca' : 'Nueva Marca'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-2 px-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'list'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Listar Marcas ({brands.length})
            </button>
          </div>

          {/* Form Tab */}
          {activeTab === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Ej: Nike, Adidas..."
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows={3}
                  placeholder="Descripción opcional de la marca"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSubmitting
                    ? 'Guardando...'
                    : brand
                    ? 'Actualizar'
                    : 'Crear'}
                </button>
              </div>
            </form>
          )}

          {/* List Tab */}
          {activeTab === 'list' && (
            <div className="space-y-2">
              {brands.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No hay marcas creadas aún
                </div>
              ) : (
                <div className="space-y-2">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{b.name}</p>
                        {b.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {b.description}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDelete(b.id, b.name)}
                        disabled={deletingId === b.id}
                        className="ml-3 p-2 text-red-600 hover:bg-red-50 rounded-md disabled:opacity-50"
                        title="Eliminar marca"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
