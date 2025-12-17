'use client';

/**
 * Client-side Providers
 *
 * Wraps the app with necessary context providers.
 * This is a client component to enable React Context usage.
 */

import { CurrencyProvider } from '@/shared/contexts/CurrencyContext';
import { SessionTimeoutWrapper } from '@/components/auth/SessionTimeoutWrapper';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CurrencyProvider>
      {/* Sistema de cierre automático de sesión por inactividad */}
      <SessionTimeoutWrapper />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </CurrencyProvider>
  );
}
