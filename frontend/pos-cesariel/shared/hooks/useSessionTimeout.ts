/**
 * Cierre automático de sesión por inactividad (4 horas).
 * Detecta actividad del usuario (mouse, teclado, touch, scroll).
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

const SESSION_TIMEOUT = 4 * 60 * 60 * 1000;

export type SessionTimeoutReason =
  | 'inactivity'
  | 'expired'
  | 'manual';

export const useSessionTimeout = () => {
  const router = useRouter();
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const handleSessionTimeout = useCallback((reason: SessionTimeoutReason) => {
    logout(reason);
    router.push('/');
  }, [logout, router]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    lastActivityRef.current = Date.now();

    timeoutRef.current = setTimeout(() => {
      handleSessionTimeout('inactivity');
    }, SESSION_TIMEOUT);
  }, [handleSessionTimeout]);

  const handleUserActivity = useCallback(() => {
    if (isAuthenticated) {
      resetTimeout();
    }
  }, [isAuthenticated, resetTimeout]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    resetTimeout();

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    events.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated, resetTimeout, handleUserActivity]);

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
