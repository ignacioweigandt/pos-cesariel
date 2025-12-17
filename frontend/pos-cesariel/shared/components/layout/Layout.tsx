'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth, canAccessModule } from '@/lib/auth';
import { usePOSWebSocket } from '@/lib/websocket';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';
import NotificationCenter from '../feedback/NotificationCenter';
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  ChartBarIcon,
  ComputerDesktopIcon,
  UsersIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, module: 'pos' },
  { name: 'POS-Ventas', href: '/pos', icon: ShoppingCartIcon, module: 'pos' },
  { name: 'Inventario', href: '/inventory', icon: CubeIcon, module: 'inventory' },
  { name: 'Reportes', href: '/reports', icon: ChartBarIcon, module: 'reports' },
  { name: 'E-commerce', href: '/ecommerce', icon: ComputerDesktopIcon, module: 'ecommerce' },
  { name: 'Usuarios', href: '/users', icon: UsersIcon, module: 'users' },
  { name: 'Configuración', href: '/settings', icon: Cog6ToothIcon, module: 'settings' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // WebSocket para notificaciones en tiempo real
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const branchId = user?.branch_id || 1;
  
  // Conectar WebSocket para notificaciones en tiempo real
  const {
    isConnected,
    notifications,
    unreadCount,
    markAllAsRead,
    clearNotifications
  } = usePOSWebSocket(branchId, token || '', false);

  // Activar sistema de cierre automático de sesión por inactividad (4 horas)
  useSessionTimeout();

  useEffect(() => {
    setMounted(true);
  }, []);

  const filteredNavigation = navigation.filter(item => 
    canAccessModule(user, item.module)
  );

  const handleLogout = () => {
    logout('manual');
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          <Sidebar navigation={filteredNavigation} pathname={pathname} />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <Sidebar navigation={filteredNavigation} pathname={pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                POS Cesariel
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <div className="flex items-center space-x-4">
                {/* WebSocket Connection Indicator */}
                {mounted && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-xs text-gray-500">
                      {isConnected ? 'En línea' : 'Desconectado'}
                    </span>
                  </div>
                )}
                
                {/* Notification Center */}
                {mounted && (
                  <NotificationCenter
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAllAsRead={markAllAsRead}
                    onClearNotifications={clearNotifications}
                  />
                )}
                
                <span className="text-sm text-gray-700">
                  {user?.full_name} - {user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <ArrowRightOnRectangleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ navigation, pathname }: { navigation: any[], pathname: string }) {
  return (
    <div className="flex flex-col h-0 flex-1 border-r border-gray-200 bg-white">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h2 className="text-lg font-semibold text-gray-900">POS Cesariel</h2>
        </div>
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`${
                  isActive
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}