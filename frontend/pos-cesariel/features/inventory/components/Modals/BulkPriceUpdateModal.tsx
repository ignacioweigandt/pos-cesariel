'use client';

import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { apiClient } from '@/shared/api/client';

interface BulkPriceUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: string[];
  onSuccess: () => void;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  brand: string;
  price: number;
}

/**
 * Modal para actualización masiva de precios
 *
 * Permite seleccionar:
 * - Todas las marcas o una marca específica
 * - Todos los productos de la marca o productos específicos
 * - Porcentaje de aumento o disminución
 */
export function BulkPriceUpdateModal({
  isOpen,
  onClose,
  brands,
  onSuccess,
}: BulkPriceUpdateModalProps) {
  // State
  const [step, setStep] = useState<'select' | 'confirm' | 'result'>('select');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [brandProducts, setBrandProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [selectAllProducts, setSelectAllProducts] = useState(true);
  const [percentage, setPercentage] = useState<string>('');
  const [updateEcommerce, setUpdateEcommerce] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Cargar productos cuando se selecciona una marca
  useEffect(() => {
    if (selectedBrand && selectedBrand !== 'all') {
      loadBrandProducts(selectedBrand);
    } else {
      setBrandProducts([]);
      setSelectedProductIds([]);
    }
  }, [selectedBrand]);

  // Actualizar selección cuando cambia "todos los productos"
  useEffect(() => {
    if (selectAllProducts) {
      setSelectedProductIds(brandProducts.map((p) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  }, [selectAllProducts, brandProducts]);

  const loadBrandProducts = async (brand: string) => {
    setLoadingProducts(true);
    try {
      const response = await apiClient.get(
        `/products/?limit=500&brand=${encodeURIComponent(brand)}`
      );

      const products = response.data;
      setBrandProducts(products);
      setSelectedProductIds(products.map((p: Product) => p.id));
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error al cargar productos de la marca');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductToggle = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
    setSelectAllProducts(false);
  };

  const handleNext = () => {
    // Validaciones
    if (!percentage || parseFloat(percentage) === 0) {
      alert('Debe ingresar un porcentaje válido');
      return;
    }

    if (selectedBrand !== 'all' && !selectAllProducts && selectedProductIds.length === 0) {
      alert('Debe seleccionar al menos un producto');
      return;
    }

    setStep('confirm');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Preparar datos de actualización
      const updateData: any = {
        percentage: parseFloat(percentage),
        update_ecommerce_price: updateEcommerce,
      };

      // Agregar marca si no es "todas"
      if (selectedBrand !== 'all') {
        updateData.brand = selectedBrand;
      }

      // Agregar IDs de productos si no se seleccionaron todos
      if (!selectAllProducts && selectedProductIds.length > 0) {
        updateData.product_ids = selectedProductIds;
      }

      const response = await apiClient.post('/products/bulk-price-update', updateData);
      const data = response.data;
      setResult(data);
      setStep('result');
      onSuccess();
    } catch (error: any) {
      console.error('Error updating prices:', error);
      const errorMessage = error.response?.data?.detail || 'Error al actualizar precios';
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedBrand('all');
    setBrandProducts([]);
    setSelectedProductIds([]);
    setSelectAllProducts(true);
    setPercentage('');
    setUpdateEcommerce(true);
    setResult(null);
    onClose();
  };

  const renderSelectStep = () => (
    <div className="space-y-6">
      {/* Selección de marca */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Seleccionar Marca
        </label>
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        >
          <option value="all">Todas las marcas</option>
          {brands.map((brand) => (
            <option key={brand} value={brand}>
              {brand}
            </option>
          ))}
        </select>
      </div>

      {/* Selección de productos (solo si hay una marca seleccionada) */}
      {selectedBrand !== 'all' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-900">
              Productos de {selectedBrand}
            </label>
            <label className="flex items-center text-sm text-gray-900">
              <input
                type="checkbox"
                checked={selectAllProducts}
                onChange={(e) => setSelectAllProducts(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
              />
              Seleccionar todos
            </label>
          </div>

          {loadingProducts ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Cargando productos...</p>
            </div>
          ) : brandProducts.length > 0 ? (
            <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto">
              {brandProducts.map((product) => (
                <label
                  key={product.id}
                  className="flex items-center px-4 py-3 hover:bg-gray-50 border-b border-gray-200 last:border-b-0 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedProductIds.includes(product.id)}
                    onChange={() => handleProductToggle(product.id)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500">
                      SKU: {product.sku} | Precio: ${product.price}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay productos para esta marca
            </p>
          )}
        </div>
      )}

      {/* Porcentaje de ajuste */}
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Porcentaje de Ajuste
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            step="0.01"
            value={percentage}
            onChange={(e) => setPercentage(e.target.value)}
            placeholder="Ej: 10 (aumento) o -5 (disminución)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-500"
          />
          <span className="text-gray-900 font-medium">%</span>
        </div>
        <p className="mt-1 text-xs text-gray-600">
          Valores positivos aumentan el precio, valores negativos lo disminuyen
        </p>
      </div>

      {/* Actualizar precio de e-commerce */}
      <div>
        <label className="flex items-center text-sm text-gray-900">
          <input
            type="checkbox"
            checked={updateEcommerce}
            onChange={(e) => setUpdateEcommerce(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-2"
          />
          También actualizar precio de e-commerce
        </label>
      </div>
    </div>
  );

  const renderConfirmStep = () => {
    const productsCount =
      selectedBrand === 'all'
        ? 'todos los productos'
        : selectAllProducts
        ? `todos los productos de ${selectedBrand}`
        : `${selectedProductIds.length} producto(s) de ${selectedBrand}`;

    const percentageValue = parseFloat(percentage);
    const action = percentageValue > 0 ? 'aumentarán' : 'disminuirán';
    const percentageDisplay = Math.abs(percentageValue);

    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">
            ⚠️ Confirme la actualización
          </h3>
          <div className="text-sm text-yellow-700 space-y-1">
            <p>
              Los precios de <strong>{productsCount}</strong> se{' '}
              <strong>{action}</strong> en un <strong>{percentageDisplay}%</strong>.
            </p>
            {updateEcommerce && (
              <p>Los precios de e-commerce también se actualizarán.</p>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setStep('select')}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Actualizando...' : 'Confirmar Actualización'}
          </button>
        </div>
      </div>
    );
  };

  const renderResultStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
          <CheckIcon className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Actualización Completada
        </h3>
        <p className="mt-2 text-sm text-gray-500">{result?.message}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="font-medium text-gray-500">Productos actualizados</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {result?.total_products_updated}
            </dd>
          </div>
          {result?.errors && result.errors.length > 0 && (
            <div>
              <dt className="font-medium text-red-500">Errores</dt>
              <dd className="mt-1 text-lg font-semibold text-red-900">
                {result.errors.length}
              </dd>
            </div>
          )}
        </dl>
      </div>

      {result?.updated_products && result.updated_products.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Productos actualizados (primeros 10):
          </h4>
          <div className="border border-gray-200 rounded-md max-h-64 overflow-y-auto">
            {result.updated_products.slice(0, 10).map((product: any) => (
              <div
                key={product.id}
                className="px-4 py-3 border-b border-gray-200 last:border-b-0"
              >
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-xs text-gray-500">
                  Precio: ${product.old_price} → ${product.new_price}
                  {product.new_ecommerce_price && (
                    <> | E-commerce: ${product.old_ecommerce_price} → $
                    {product.new_ecommerce_price}</>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleClose}
        className="w-full px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
      >
        Cerrar
      </button>
    </div>
  );

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={handleClose}
                    disabled={loading}
                  >
                    <span className="sr-only">Cerrar</span>
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CurrencyDollarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      Actualizar Precios
                    </Dialog.Title>
                    <div className="mt-4">
                      {step === 'select' && renderSelectStep()}
                      {step === 'confirm' && renderConfirmStep()}
                      {step === 'result' && renderResultStep()}
                    </div>
                  </div>
                </div>

                {step === 'select' && (
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!percentage || parseFloat(percentage) === 0}
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                    <button
                      type="button"
                      onClick={handleClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
