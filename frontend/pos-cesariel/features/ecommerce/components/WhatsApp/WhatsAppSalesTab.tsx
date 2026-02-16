"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { useWhatsAppSales } from "@/features/ecommerce/hooks/useWhatsAppSales";
import { useWhatsAppStats } from "@/features/ecommerce/hooks/useWhatsAppStats";
import { useWhatsAppFilters } from "@/features/ecommerce/hooks/useWhatsAppFilters";
import { SalesStatsGrid } from "./_components/SalesStatsGrid";
import { SalesFilters } from "./_components/SalesFilters";
import { SalesTable } from "./_components/SalesTable";
import { SaleDetailsModal } from "./_components/SaleDetailsModal";
import type { WhatsAppSale } from "@/features/ecommerce/hooks/useWhatsAppSales";
import { usePOSWebSocket } from "@/shared/hooks/useWebSocket";

interface WhatsAppSalesTabProps {
  refreshTrigger?: number;
  onShowWhatsAppConfig: () => void;
}

/**
 * WhatsAppSalesTab Component
 *
 * Displays and manages WhatsApp sales from the e-commerce platform.
 * Features include:
 * - Real-time sales list with auto-refresh
 * - Advanced filtering (status, shipping method, date range, search)
 * - Sales statistics dashboard
 * - Detailed sale view modal
 * - WhatsApp integration for customer communication
 * - Order status management
 */
export function WhatsAppSalesTab({
  refreshTrigger,
  onShowWhatsAppConfig,
}: WhatsAppSalesTabProps) {
  const [selectedSale, setSelectedSale] = useState<WhatsAppSale | null>(null);

  // Get auth from localStorage
  const [branchId, setBranchId] = useState<number>(1);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token') || '';
      const userData = localStorage.getItem('user');
      setToken(storedToken);
      
      if (userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setBranchId(parsedUser.branch_id || 1);
        } catch (e) {
          console.error('Error parsing user data:', e);
        }
      }
    }
  }, []);

  // Hooks para datos y lógica
  const { sales, loading, fetchSales, updateSaleStatus } = useWhatsAppSales();
  const stats = useWhatsAppStats(sales);
  const { filters, setFilters, filteredSales, clearFilters, hasActiveFilters } =
    useWhatsAppFilters(sales);

  // WebSocket for real-time updates
  const { lastMessage } = usePOSWebSocket(branchId, token, !!token);

  // React to WebSocket events
  useEffect(() => {
    if (lastMessage?.type === 'new_sale' || lastMessage?.type === 'sale_status_change') {
      fetchSales();
    }
  }, [lastMessage, fetchSales]);

  // Initial load and polling de respaldo reducido
  useEffect(() => {
    if (token) {
      fetchSales(); // Carga inicial
      
      // Polling de respaldo cada 2 minutos (en vez de 10 segundos)
      const interval = setInterval(fetchSales, 120000);
      return () => clearInterval(interval);
    }
  }, [fetchSales, token]);

  // Refresh cuando cambia el trigger externo
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      fetchSales();
    }
  }, [refreshTrigger, fetchSales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ventas WhatsApp</h2>
          <p className="mt-1 text-sm text-gray-600">
            Pedidos realizados desde la página e-commerce (pendientes de coordinación)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          )}
          <button
            onClick={onShowWhatsAppConfig}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Cog6ToothIcon className="h-4 w-4 mr-2" />
            Configurar WhatsApp
          </button>
          <button
            onClick={fetchSales}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <SalesStatsGrid stats={stats} />

      {/* Filters */}
      <SalesFilters
        filters={filters}
        onFiltersChange={setFilters}
        onClearFilters={clearFilters}
        totalSales={sales.length}
        filteredCount={filteredSales.length}
        hasActiveFilters={hasActiveFilters}
      />

      {/* Sales Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Listado de Ventas WhatsApp
          </h3>
          <SalesTable
            sales={filteredSales}
            loading={loading}
            onUpdateStatus={updateSaleStatus}
            onViewDetails={setSelectedSale}
          />
        </div>
      </div>

      {/* Sale Details Modal */}
      {selectedSale && (
        <SaleDetailsModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}
