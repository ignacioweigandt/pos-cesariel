'use client';

import { useState, useEffect } from 'react';
import { 
  BellIcon, 
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShoppingCartIcon,
  CubeIcon,
  PencilSquareIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';
import { WebSocketMessage } from '@/lib/websocket';

interface NotificationCenterProps {
  notifications: WebSocketMessage[];
  unreadCount: number;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
}

export default function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAllAsRead,
  onClearNotifications
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inventory_change':
        return <CubeIcon className="h-5 w-5 text-blue-500" />;
      case 'new_sale':
        return <ShoppingCartIcon className="h-5 w-5 text-green-500" />;
      case 'low_stock_alert':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
      case 'user_action':
        return <InformationCircleIcon className="h-5 w-5 text-purple-500" />;
      case 'system_message':
        return <CheckCircleIcon className="h-5 w-5 text-indigo-500" />;
      case 'product_update':
        return <PencilSquareIcon className="h-5 w-5 text-orange-500" />;
      case 'sale_status_change':
        return <ClipboardDocumentListIcon className="h-5 w-5 text-cyan-500" />;
      case 'dashboard_update':
        return <ChartBarIcon className="h-5 w-5 text-pink-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'inventory_change':
        return 'border-l-blue-500 bg-blue-50';
      case 'new_sale':
        return 'border-l-green-500 bg-green-50';
      case 'low_stock_alert':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'user_action':
        return 'border-l-purple-500 bg-purple-50';
      case 'system_message':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'product_update':
        return 'border-l-orange-500 bg-orange-50';
      case 'sale_status_change':
        return 'border-l-cyan-500 bg-cyan-50';
      case 'dashboard_update':
        return 'border-l-pink-500 bg-pink-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const messageTime = new Date(timestamp).getTime();
    const diffInMinutes = Math.floor((now - messageTime) / 60000);

    if (diffInMinutes < 1) return 'Ahora';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen && unreadCount > 0) {
            onMarkAllAsRead();
          }
        }}
        className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-96 max-w-sm rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Notificaciones en Tiempo Real
              </h3>
              <div className="flex space-x-2">
                {notifications.length > 0 && (
                  <button
                    onClick={onClearNotifications}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay notificaciones
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Las notificaciones en tiempo real aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.slice().reverse().map((notification, index) => (
                    <div
                      key={`${notification.timestamp}-${index}`}
                      className={`border-l-4 p-3 rounded ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          {notification.details && (
                            <p className="text-xs text-gray-600 mt-1">
                              {notification.details}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.timestamp && formatTimeAgo(notification.timestamp)}
                            {notification.user_name && ` • ${notification.user_name}`}
                            {notification.branch_id && notification.branch_id !== 1 && ` • Sucursal ${notification.branch_id}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  Mostrando las últimas {Math.min(notifications.length, 20)} notificaciones
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}