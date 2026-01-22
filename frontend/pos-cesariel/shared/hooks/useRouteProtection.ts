'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth, canAccessModule } from './useAuth';

/**
 * Hook para proteger rutas basado en permisos del usuario
 * Muestra un toast cuando el usuario intenta acceder a un módulo sin permisos
 * y lo redirige al dashboard
 */
export function useRouteProtection() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // No ejecutar protección en la página de login
    if (pathname === '/' || !isAuthenticated) {
      return;
    }

    // Mapear rutas a módulos
    const routeToModule: Record<string, string> = {
      '/dashboard': 'pos',
      '/pos': 'pos',
      '/inventory': 'inventory',
      '/reports': 'reports',
      '/ecommerce': 'ecommerce',
      '/users': 'users',
      '/settings': 'settings',
    };

    // Obtener el módulo actual basado en la ruta
    const currentRoute = Object.keys(routeToModule).find(route =>
      pathname.startsWith(route)
    );

    if (!currentRoute) {
      return; // Ruta no mapeada, no proteger
    }

    const module = routeToModule[currentRoute];

    // Verificar si el usuario puede acceder al módulo
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
        {
          duration: 4000,
          position: 'top-center',
          icon: '🚫',
        }
      );

      // Redirigir al dashboard o a la página de POS según el rol
      const defaultRoute = user?.role === 'SELLER' ? '/pos' : '/dashboard';
      router.push(defaultRoute);
    }
  }, [pathname, user, isAuthenticated, router]);
}
