'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth, canAccessModule } from './useAuth';

/**
 * Protección de rutas según permisos del usuario.
 * Muestra toast y redirige al dashboard si no tiene acceso.
 */
export function useRouteProtection() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (pathname === '/' || !isAuthenticated) {
      return;
    }

    const routeToModule: Record<string, string> = {
      '/dashboard': 'pos',
      '/pos': 'pos',
      '/inventory': 'inventory',
      '/reports': 'reports',
      '/ecommerce': 'ecommerce',
      '/users': 'users',
      '/settings': 'settings',
    };

    const currentRoute = Object.keys(routeToModule).find(route =>
      pathname.startsWith(route)
    );

    if (!currentRoute) {
      return;
    }

    const module = routeToModule[currentRoute];

    if (!canAccessModule(user, module)) {
      const moduleNames: Record<string, string> = {
        dashboard: 'Dashboard',
        pos: 'POS-Ventas',
        inventory: 'Inventario',
        reports: 'Reportes',
        ecommerce: 'E-commerce',
        users: 'Usuarios',
        settings: 'Configuración',
      };

      toast.error(
        `No tienes permisos para acceder al módulo de ${moduleNames[module] || module}`,
        { duration: 4000, position: 'top-center', icon: '🚫' }
      );

      const defaultRoute = user?.role === 'SELLER' ? '/pos' : '/dashboard';
      router.push(defaultRoute);
    }
  }, [pathname, user, isAuthenticated, router]);
}
