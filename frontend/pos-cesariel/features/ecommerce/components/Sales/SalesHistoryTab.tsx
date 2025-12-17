"use client";

import {
  CheckIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  EyeIcon,
  GlobeAltIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { salesApi } from "@/lib/api";

interface SalesHistoryTabProps {
  refreshTrigger?: number;
}

/**
 * SalesHistoryTab Component
 *
 * Displays history of confirmed POS sales (sales created from admin panel).
 * E-commerce sales from the public website appear in WhatsApp Sales tab.
 * Features auto-refresh capability and real-time alerts for new sales.
 *
 * @param refreshTrigger - Optional counter to trigger manual refresh of sales data
 */
export function SalesHistoryTab({ refreshTrigger }: SalesHistoryTabProps) {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadSales();

    // Auto-refresh every 15 seconds to detect new sales
    const interval = setInterval(() => {
      loadSales(true);
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      loadSales();
    }
  }, [refreshTrigger]);

  // Load sales - Only POS sales (confirmed sales from admin, not from e-commerce web)
  const loadSales = async (showAlert = false) => {
    setLoading(true);
    try {
      // Filter to only show POS sales (confirmed from admin panel)
      // E-commerce sales appear in WhatsApp Sales tab
      const response = await salesApi.getSales({ sale_type: 'POS' });
      const newSales = response.data;

      // Check for new sales
      if (sales.length > 0 && showAlert) {
        if (newSales.length > sales.length) {
          const latestSale = newSales[0]; // Assuming sorted by newest first
          const saleType =
            latestSale.sale_type === "ECOMMERCE" ? "E-commerce" : "POS";
          setSuccessMessage(
            `¡Nueva venta ${saleType} procesada! Venta #${
              latestSale.sale_number || latestSale.id
            } por $${parseFloat(latestSale.total_amount).toFixed(2)}`
          );
          setShowSuccessAlert(true);

          setTimeout(() => {
            setShowSuccessAlert(false);
          }, 5000);
        }
      }

      setSales(newSales || []);
    } catch (error) {
      console.error("Error loading sales:", error);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "Entregada";
      case "completed":
        return "Confirmada";
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviada";
      case "pending":
        return "Pendiente";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  // Get sale type color
  const getSaleTypeColor = (type: string) => {
    switch (type) {
      case "POS":
        return "bg-blue-100 text-blue-800";
      case "ECOMMERCE":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // View sale details
  const viewSaleDetails = (sale: any) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Historial de Ventas
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Ventas confirmadas realizadas desde la pestaña Ventas (POS)
          </p>
        </div>
        <button
          onClick={() => loadSales()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Actualizar
        </button>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Ventas POS
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sales.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ComputerDesktopIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ventas Confirmadas
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sales.filter((s) => s.order_status === "DELIVERED").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <GlobeAltIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ventas Pendientes
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {sales.filter((s) => s.order_status === "PENDING").length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ingresos Totales
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    $
                    {sales
                      .reduce(
                        (sum, sale) => sum + parseFloat(sale.total_amount || 0),
                        0
                      )
                      .toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{sale.sale_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sale.customer_name || "Cliente no especificado"}
                    </div>
                    {sale.customer_email && (
                      <div className="text-sm text-gray-500">
                        {sale.customer_email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSaleTypeColor(
                        sale.sale_type
                      )}`}
                    >
                      {sale.sale_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${parseFloat(sale.total_amount || 0).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        sale.order_status
                      )}`}
                    >
                      {getStatusText(sale.order_status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sale.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => viewSaleDetails(sale)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sale Details Modal */}
      {showSaleDetails && selectedSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Cliente
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedSale.customer_name || "No especificado"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipo
                  </label>
                  <p className="text-sm text-gray-900">
                    {selectedSale.sale_type}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Total
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    ${parseFloat(selectedSale.total_amount || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Estado
                  </label>
                  <p
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      selectedSale.order_status
                    )}`}
                  >
                    {getStatusText(selectedSale.order_status)}
                  </p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Productos
                </h4>
                <div className="space-y-2">
                  {selectedSale.sale_items?.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.product?.name || "Producto"}
                        </p>
                        <p className="text-xs text-gray-500">
                          Cantidad: {item.quantity} × $
                          {parseFloat(item.unit_price || 0).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        ${parseFloat(item.total_price || 0).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {showSuccessAlert && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-green-600 shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <CheckIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3 w-0 flex-1 pt-0.5">
                <p className="text-sm font-medium text-white">
                  ¡Venta exitosa!
                </p>
                <p className="mt-1 text-sm text-green-100">{successMessage}</p>
              </div>
              <div className="ml-4 flex-shrink-0 flex">
                <button
                  className="inline-flex text-white hover:text-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onClick={() => setShowSuccessAlert(false)}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
