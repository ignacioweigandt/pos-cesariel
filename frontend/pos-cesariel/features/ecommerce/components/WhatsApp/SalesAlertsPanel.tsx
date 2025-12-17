'use client';

import { useState, useEffect } from 'react';
import {
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { salesApi, ecommerceAdvancedApi } from '@/lib/api';

interface SaleAlert {
  id: number;
  sale_id: number;
  sale_number: string;
  alert_type: 'SUCCESS' | 'WARNING' | 'ERROR' | 'INFO';
  title: string;
  message: string;
  customer_name: string;
  total_amount: number;
  created_at: string;
  is_read: boolean;
  sale_type: 'POS' | 'ECOMMERCE';
  order_status: string;
}

interface Sale {
  id: number;
  sale_number: string;
  customer_name: string;
  total_amount: number;
  sale_type: string;
  order_status: string;
  created_at: string;
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    size?: string;
  }>;
}

interface SalesAlertsPanelProps {
  refreshTrigger?: number;
}

export default function SalesAlertsPanel({ refreshTrigger = 0 }: SalesAlertsPanelProps) {
  const [alerts, setAlerts] = useState<SaleAlert[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<SaleAlert | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'success' | 'warning' | 'error'>('all');

  useEffect(() => {
    loadAlertsAndSales();
  }, [refreshTrigger]);

  const loadAlertsAndSales = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadRecentSales(),
        generateAlertsFromSales()
      ]);
    } catch (error) {
      console.error('Error loading alerts and sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRecentSales = async () => {
    try {
      // Obtener ventas de las últimas 24 horas
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const response = await salesApi.getSales({
        start_date: yesterday.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        limit: 50
      });
      
      if (response.data && Array.isArray(response.data)) {
        setRecentSales(response.data);
      }
    } catch (error) {
      console.error('Error loading recent sales:', error);
      setRecentSales([]);
    }
  };

  const generateAlertsFromSales = async () => {
    try {
      const alertsData: SaleAlert[] = [];
      
      // Generar alertas basadas en las ventas recientes
      recentSales.forEach(sale => {
        // Alerta de venta exitosa para ventas POS
        if (sale.sale_type === 'POS' && sale.order_status === 'DELIVERED') {
          alertsData.push({
            id: Date.now() + sale.id,
            sale_id: sale.id,
            sale_number: sale.sale_number,
            alert_type: 'SUCCESS',
            title: 'Venta POS Procesada',
            message: `Venta procesada exitosamente desde el módulo POS admin. Stock actualizado.`,
            customer_name: sale.customer_name,
            total_amount: sale.total_amount,
            created_at: sale.created_at,
            is_read: false,
            sale_type: sale.sale_type as 'POS' | 'ECOMMERCE',
            order_status: sale.order_status
          });
        }

        // Alerta de venta pendiente para ventas ECOMMERCE
        if (sale.sale_type === 'ECOMMERCE' && sale.order_status === 'PENDING') {
          alertsData.push({
            id: Date.now() + sale.id + 1000,
            sale_id: sale.id,
            sale_number: sale.sale_number,
            alert_type: 'INFO',
            title: 'Nueva Venta E-commerce',
            message: `Venta pendiente desde e-commerce. Requiere coordinación por WhatsApp.`,
            customer_name: sale.customer_name,
            total_amount: sale.total_amount,
            created_at: sale.created_at,
            is_read: false,
            sale_type: sale.sale_type as 'POS' | 'ECOMMERCE',
            order_status: sale.order_status
          });
        }

        // Alerta de warning para ventas de alto valor
        if (sale.total_amount > 100000) {
          alertsData.push({
            id: Date.now() + sale.id + 2000,
            sale_id: sale.id,
            sale_number: sale.sale_number,
            alert_type: 'WARNING',
            title: 'Venta de Alto Valor',
            message: `Venta de alto valor detectada. Revisar detalles.`,
            customer_name: sale.customer_name,
            total_amount: sale.total_amount,
            created_at: sale.created_at,
            is_read: false,
            sale_type: sale.sale_type as 'POS' | 'ECOMMERCE',
            order_status: sale.order_status
          });
        }
      });

      // Ordenar por fecha más reciente
      alertsData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error generating alerts:', error);
    }
  };

  const markAsRead = (alertId: number) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, is_read: true } : alert
    ));
  };

  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, is_read: true })));
  };

  const viewSaleDetails = async (alert: SaleAlert) => {
    setSelectedAlert(alert);
    setShowDetails(true);
    markAsRead(alert.id);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'WARNING':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'ERROR':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'INFO':
        return <ClockIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertBgColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? 'bg-opacity-30' : 'bg-opacity-70';
    switch (type) {
      case 'SUCCESS':
        return `bg-green-100 ${opacity}`;
      case 'WARNING':
        return `bg-yellow-100 ${opacity}`;
      case 'ERROR':
        return `bg-red-100 ${opacity}`;
      case 'INFO':
        return `bg-blue-100 ${opacity}`;
      default:
        return `bg-gray-100 ${opacity}`;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'unread') return !alert.is_read;
    if (filter === 'success') return alert.alert_type === 'SUCCESS';
    if (filter === 'warning') return alert.alert_type === 'WARNING';
    if (filter === 'error') return alert.alert_type === 'ERROR';
    return true;
  });

  const unreadCount = alerts.filter(alert => !alert.is_read).length;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BellIcon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-lg font-medium text-gray-900">
              Alertas de Ventas
            </h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} nuevas
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAlertsAndSales}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md"
              title="Actualizar alertas"
            >
              <ArrowPathIcon className="w-5 h-5" />
            </button>
            <button
              onClick={markAllAsRead}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Marcar todas como leídas
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-4 flex space-x-2">
          {[
            { id: 'all', label: 'Todas', count: alerts.length },
            { id: 'unread', label: 'No leídas', count: unreadCount },
            { id: 'success', label: 'Exitosas', count: alerts.filter(a => a.alert_type === 'SUCCESS').length },
            { id: 'warning', label: 'Advertencias', count: alerts.filter(a => a.alert_type === 'WARNING').length },
            { id: 'error', label: 'Errores', count: alerts.filter(a => a.alert_type === 'ERROR').length }
          ].map(filterOption => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                filter === filterOption.id
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label} ({filterOption.count})
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="text-center py-8">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay alertas para mostrar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getAlertBgColor(alert.alert_type, alert.is_read)} ${
                  alert.is_read ? 'border-gray-200' : 'border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.alert_type)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${
                          alert.is_read ? 'text-gray-700' : 'text-gray-900'
                        }`}>
                          {alert.title}
                        </h4>
                        {!alert.is_read && (
                          <div className="w-2 h-2 bg-indigo-600 rounded-full"></div>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${
                        alert.is_read ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        {alert.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>Cliente: {alert.customer_name}</span>
                        <span>Total: ${alert.total_amount.toLocaleString()}</span>
                        <span>#{alert.sale_number}</span>
                        <span>{new Date(alert.created_at).toLocaleDateString()} {new Date(alert.created_at).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => viewSaleDetails(alert)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Ver detalles"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                Detalles de la Alerta
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Venta
                  </label>
                  <p className="text-sm text-gray-900">#{selectedAlert.sale_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Alerta
                  </label>
                  <div className="flex items-center space-x-2">
                    {getAlertIcon(selectedAlert.alert_type)}
                    <span className="text-sm text-gray-900">{selectedAlert.alert_type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente
                  </label>
                  <p className="text-sm text-gray-900">{selectedAlert.customer_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total
                  </label>
                  <p className="text-sm text-gray-900">${selectedAlert.total_amount.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Venta
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAlert.sale_type === 'POS' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedAlert.sale_type}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAlert.order_status === 'DELIVERED' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAlert.order_status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje
                </label>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                  {selectedAlert.message}
                </p>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha y Hora
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedAlert.created_at).toLocaleDateString()} a las {new Date(selectedAlert.created_at).toLocaleTimeString()}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}