/**
 * Session Timeout Hook
 *
 * Maneja el cierre automático de sesión después de un período de inactividad.
 * - Detecta actividad del usuario (mouse, teclado, touch, scroll)
 * - Cierra sesión automáticamente después de 4 horas (configurable)
 * - Guarda la razón del cierre para mostrar al usuario
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

// Configuración: 4 horas en milisegundos (duración de un turno)
const SESSION_TIMEOUT = 4 * 60 * 60 * 1000; // 4 horas
// const SESSION_TIMEOUT = 60 * 1000; // 1 minuto (para pruebas rápidas)

export type SessionTimeoutReason =
  | 'inactivity'      // Inactividad del usuario
  | 'expired'         // Sesión expirada
  | 'manual';         // Cierre manual

export const useSessionTimeout = () => {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  /**
   * Cierra la sesión y guarda la razón
   */
  const handleSessionTimeout = useCallback((reason: SessionTimeoutReason) => {
    // Cerrar sesión con la razón apropiada
    logout(reason);

    // Redirigir al login
    router.push('/');
  }, [logout, router]);

  /**
   * Resetea el timer de inactividad
   */
  const resetTimeout = useCallback(() => {
    // Limpiar timeout anterior
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Actualizar última actividad
    lastActivityRef.current = Date.now();

    // Crear nuevo timeout
    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout('inactivity');
    }, SESSION_TIMEOUT);
  }, [handleSessionTimeout]);

  /**
   * Handler para eventos de actividad del usuario
   */
  const handleUserActivity = useCallback(() => {
    // Solo resetear si el usuario está autenticado
    if (isAuthenticated) {
      resetTimeout();
    }
  }, [isAuthenticated, resetTimeout]);

  /**
   * Efecto principal: configura listeners de actividad
   */
  useEffect(() => {
    // Solo activar si el usuario está autenticado
    if (!isAuthenticated) {
      return;
    }

    // Iniciar el timer
    resetTimeout();

    // Eventos que indican actividad del usuario
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Agregar listeners
    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Cleanup: remover listeners y limpiar timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetTimeout, handleUserActivity]);

  /**
   * Función para obtener el tiempo restante de sesión
   */
  const getTimeRemaining = useCallback(() => {
    const elapsed = Date.now() - lastActivityRef.current;
    const remaining = Math.max(0, SESSION_TIMEOUT - elapsed);
    return {
      hours: Math.floor(remaining / (60 * 60 * 1000)),
      minutes: Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000)),
      seconds: Math.floor((remaining % (60 * 1000)) / 1000),
      total: remaining,
    };
  }, []);

  return {
    resetTimeout,
    getTimeRemaining,
    handleSessionTimeout,
  };
};
