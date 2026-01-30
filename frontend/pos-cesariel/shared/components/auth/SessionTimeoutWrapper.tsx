'use client';

/** Wrapper que activa el sistema de cierre automático de sesión por inactividad */

import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export function SessionTimeoutWrapper() {
  useSessionTimeout();
  return null;
}
