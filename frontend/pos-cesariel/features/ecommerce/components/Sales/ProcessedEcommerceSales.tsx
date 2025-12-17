'use client';

import { useState, useEffect } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ShoppingCartIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  PhoneIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  TruckIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface Sale {
  id: number;
  sale_number: string;
  sale_type: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  total_amount: number;
  order_status: string;
  created_at: string;
  sale_items: Array<{
    product: {
      name: string;
    };
    quantity: number;
    unit_price: number;
    total_price: number;
    size?: string;
  }>;
}

interface ProcessedSale {
  id: number;
  sale_id: number;
  customer_whatsapp: string;
  customer_name: string;
  customer_address?: string;
  shipping_method?: string;
  shipping_cost: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  sale: Sale;
}

interface ProcessedEcommerceSalesProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProcessedEcommerceSales({
  isOpen,
  onClose
}: ProcessedEcommerceSalesProps) {
  const [processedSales, setProcessedSales] = useState<ProcessedSale[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadProcessedSales();
    }
  }, [isOpen]);

  const loadProcessedSales = async () => {
    setLoading(true);
    try {
      const response = await ecommerceAdvancedApi.getWhatsAppSales();
      // Filter only delivered/completed sales
      const completedSales = response.data.filter((sale: ProcessedSale) =>
        sale.sale.order_status === 'DELIVERED'
      );
      setProcessedSales(completedSales);
    } catch (error) {
      console.error('Error loading processed sales:', error);
      toast.error('Error cargando ventas procesadas');
    } finally {
      setLoading(false);
    }
  };

  const handleViewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClose = () => {
    setProcessedSales([]);
    setSelectedSale(null);
    setShowSaleDetails(false);
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
                Ventas E-commerce Procesadas
              </h3>
              <p className="text-sm text-gray-600">
                Historial de ventas e-commerce completadas y entregadas
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* Stats Summary */}
          {!loading && processedSales.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CheckIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-600">Total Procesadas</p>
                    <p className="text-2xl font-bold text-green-900">{processedSales.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-600">Ingresos Totales</p>
                    <p className="text-2xl font-bold text-blue-900">
                      ${processedSales.reduce((sum, sale) => sum + parseFloat(sale.sale.total_amount.toString()), 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <TruckIcon className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-600">Envíos Realizados</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {processedSales.filter(sale => sale.shipping_method === 'delivery').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Processed Sales List */}
          {!loading && processedSales.length > 0 && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {processedSales.map((processedSale) => (
                <div
                  key={processedSale.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-green-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* Sale Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          #{processedSale.sale.sale_number}
                        </h4>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(processedSale.sale.order_status)}`}>
                          <CheckIcon className="h-3 w-3 mr-1" />
                          COMPLETADA
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(processedSale.updated_at)}
                        </span>
                      </div>

                      {/* Customer Info */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{processedSale.customer_name}</span>
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{processedSale.customer_whatsapp}</span>
                        </div>
                        <div className="flex items-center">
                          <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            ${parseFloat(processedSale.sale.total_amount.toString()).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Shipping Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        {processedSale.shipping_method && (
                          <div className="flex items-center">
                            <TruckIcon className="h-4 w-4 text-gray-400 mr-2" />
                            {processedSale.shipping_method === 'delivery' && 'Envío a domicilio'}
                            {processedSale.shipping_method === 'pickup' && 'Retiro en tienda'}
                            {processedSale.shipping_method === 'shipping' && 'Envío por correo'}
                            {processedSale.shipping_cost > 0 && ` (+$${processedSale.shipping_cost})`}
                          </div>
                        )}
                        {processedSale.customer_address && (
                          <div className="flex items-start">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                            <span className="text-sm">{processedSale.customer_address}</span>
                          </div>
                        )}
                      </div>

                      {/* Items Preview */}
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Productos: </span>
                        {processedSale.sale.sale_items.slice(0, 2).map((item, index) => (
                          <span key={index}>
                            {item.product.name}
                            {item.size && ` (${item.size})`}
                            {index < Math.min(processedSale.sale.sale_items.length - 1, 1) && ', '}
                          </span>
                        ))}
                        {processedSale.sale.sale_items.length > 2 && (
                          <span> y {processedSale.sale.sale_items.length - 2} más...</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleViewSaleDetails(processedSale.sale)}
                        className="p-2 text-gray-400 hover:text-blue-600"
                        title="Ver detalles completos"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && processedSales.length === 0 && (
            <div className="text-center py-12">
              <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay ventas procesadas
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Las ventas completadas aparecerán aquí
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  Detalles de Venta #{selectedSale.sale_number}
                </h3>
                <button
                  onClick={() => setShowSaleDetails(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="px-6 py-4">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total</label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(selectedSale.total_amount.toString()).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <p className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedSale.order_status)}`}>
                    <CheckIcon className="h-3 w-3 mr-1" />
                    COMPLETADA
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Venta</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedSale.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Cliente</label>
                  <p className="text-sm text-gray-900">{selectedSale.customer_name || 'No especificado'}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Productos</h4>
                <div className="space-y-2">
                  {selectedSale.sale_items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product.name}
                          {item.size && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              Talle: {item.size}
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity} × ${parseFloat(item.unit_price.toString()).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${parseFloat(item.total_price.toString()).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}