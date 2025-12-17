'use client';

import { useEffect, useState } from 'react';
import { salesApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  CogIcon,
} from '@heroicons/react/24/outline';
import { useWhatsAppSales } from '@/features/ecommerce/hooks/useWhatsAppSales';
import { useWhatsAppSaleForm } from '@/features/ecommerce/hooks/useWhatsAppSaleForm';
import { useWhatsAppConfig } from '@/features/ecommerce/hooks/useWhatsAppConfig';
import { useAvailableSales } from '@/features/ecommerce/hooks/useAvailableSales';
import { WhatsAppSaleForm } from './_forms/WhatsAppSaleForm';
import { WhatsAppConfigForm } from './_forms/WhatsAppConfigForm';
import { WhatsAppSaleCard } from './_components/WhatsAppSaleCard';
import { SimpleSaleDetailsModal } from './_components/SimpleSaleDetailsModal';

interface WhatsAppSalesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  branchId: number;
  token: string;
}

interface Sale {
  id: number;
  sale_number: string;
  total_amount: number;
  order_status: string;
  sale_items: Array<{
    product: { name: string };
    quantity: number;
    unit_price: number;
    total_price: number;
  }>;
}

/**
 * Gestor de ventas WhatsApp
 * Componente refactorizado con separación de responsabilidades
 */
export default function WhatsAppSalesManager({
  isOpen,
  onClose,
  branchId,
  token,
}: WhatsAppSalesManagerProps) {
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);

  // Hooks personalizados
  const { sales, loading, fetchSales } = useWhatsAppSales();
  const saleForm = useWhatsAppSaleForm();
  const whatsappConfig = useWhatsAppConfig();

  const existingSaleIds = sales.map((s) => s.sale_id);
  const { availableSales, loadAvailableSales } = useAvailableSales(existingSaleIds);

  // Auto-refresh cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      fetchSales();
      loadAvailableSales();
      whatsappConfig.loadConfig();

      const interval = setInterval(() => {
        fetchSales();
        loadAvailableSales();
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [isOpen, fetchSales, loadAvailableSales, whatsappConfig]);

  const handleMarkAsCompleted = async (saleId: number) => {
    try {
      await salesApi.updateSaleStatus(saleId, 'DELIVERED');
      toast.success('Venta marcada como completada');
      fetchSales();
    } catch (error: any) {
      console.error('Error updating sale status:', error);
      const errorMessage =
        error.response?.data?.detail || 'Error actualizando estado de venta';
      toast.error(errorMessage);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await saleForm.submitForm(() => {
      fetchSales();
      loadAvailableSales();
    });
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await whatsappConfig.saveConfig();
  };

  const handleViewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  const openWhatsAppChat = (whatsappUrl: string) => {
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    saleForm.closeForm();
    whatsappConfig.closeConfigModal();
    setSelectedSale(null);
    setShowSaleDetails(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-5 mx-auto p-5 border w-full max-w-7xl shadow-lg rounded-md bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Gestión de Ventas WhatsApp
              </h3>
              <p className="text-sm text-gray-600">
                Administre las ventas realizadas vía WhatsApp
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {!saleForm.showForm && !whatsappConfig.showConfigModal && (
                <>
                  <button
                    onClick={whatsappConfig.openConfigModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    title="Configurar WhatsApp empresarial"
                  >
                    <CogIcon className="h-4 w-4 mr-2" />
                    Configurar WhatsApp
                  </button>
                  <button
                    onClick={saleForm.openForm}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
                    Nueva Venta WhatsApp
                  </button>
                </>
              )}
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* WhatsApp Sale Form */}
          {saleForm.showForm && (
            <WhatsAppSaleForm
              formData={saleForm.formData}
              setFormData={saleForm.setFormData}
              onSubmit={handleFormSubmit}
              onCancel={saleForm.closeForm}
              isEditing={!!saleForm.editingSale}
              availableSales={availableSales}
            />
          )}

          {/* WhatsApp Configuration Form */}
          {whatsappConfig.showConfigModal && (
            <WhatsAppConfigForm
              config={whatsappConfig.config}
              setConfig={whatsappConfig.setConfig}
              onSubmit={handleConfigSubmit}
              onCancel={whatsappConfig.closeConfigModal}
            />
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          )}

          {/* WhatsApp Sales List */}
          {!loading && (
            <div className="space-y-4">
              {sales.map((sale) => (
                <WhatsAppSaleCard
                  key={sale.id}
                  sale={sale}
                  onEdit={saleForm.editSale}
                  onViewDetails={handleViewSaleDetails}
                  onMarkCompleted={handleMarkAsCompleted}
                  onOpenWhatsApp={openWhatsAppChat}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && sales.length === 0 && (
            <div className="text-center py-12">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay ventas de WhatsApp
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience creando registros de ventas WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <SimpleSaleDetailsModal
          sale={selectedSale}
          onClose={() => setShowSaleDetails(false)}
        />
      )}
    </>
  );
}
