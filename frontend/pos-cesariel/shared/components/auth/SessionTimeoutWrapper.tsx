'use client';

/**
 * Session Timeout Wrapper Component
 *
 * Componente que activa el sistema de cierre automático de sesión.
 * Debe ser incluido en el árbol de componentes de la aplicación.
 */

import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export function SessionTimeoutWrapper() {
  // Activar el hook de timeout de sesión
  useSessionTimeout();

  // Este componente no renderiza nada, solo activa el hook
  return null;
}
