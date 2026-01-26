'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { apiClient } from '@/shared/api/client';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [logoutMessage, setLogoutMessage] = useState<{
    type: 'info' | 'warning';
    message: string;
  } | null>(null);
  const router = useRouter();
  const { login, logoutReason, clearLogoutReason } = useAuth();

  // Handle hydration and logout messages
  useEffect(() => {
    setMounted(true);

    // Check if already logged in
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/dashboard');
      return;
    }

    // Verificar si hay una razón de logout
    if (logoutReason) {
      const messages = {
        inactivity: {
          type: 'warning' as const,
          message: '⏰ Tu sesión se cerró automáticamente por inactividad. Por seguridad, las sesiones se cierran después de 4 horas (duración de un turno de trabajo). Por favor, inicia sesión nuevamente.',
        },
        expired: {
          type: 'warning' as const,
          message: '🔒 Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        },
        manual: {
          type: 'info' as const,
          message: '👋 Has cerrado sesión correctamente.',
        },
      };

      setLogoutMessage(messages[logoutReason]);

      // Limpiar la razón después de mostrarla
      setTimeout(() => {
        clearLogoutReason();
      }, 100);
    }
  }, [router, logoutReason, clearLogoutReason]);

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Login request using apiClient (configured for Railway)
      const response = await apiClient.post('/auth/login',
        new URLSearchParams({
          username,
          password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      const data = response.data;

      // Get user info using apiClient
      const userResponse = await apiClient.get('/users/me', {
        headers: {
          'Authorization': `Bearer ${data.access_token}`
        }
      });

      const userData = userResponse.data;

      // Use the Zustand login method to update the store
      login(data.access_token, userData);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      if (error.response) {
        // Server responded with error
        setError(error.response.data?.detail || 'Usuario o contraseña incorrectos');
      } else {
        // Network error
        setError('Error de conexión. Verifica que el backend esté funcionando');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-20 flex items-center justify-center rounded-full bg-indigo-100">
            <svg
              className="h-10 w-10 text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            POS Cesariel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sistema de Punto de Venta Multisucursal
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Inicia sesión en tu cuenta
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin} noValidate>
          <div className="space-y-4">
            {/* Mensaje de logout */}
            {logoutMessage && (
              <div
                className={`${
                  logoutMessage.type === 'warning'
                    ? 'bg-yellow-50 border border-yellow-300 text-yellow-800'
                    : 'bg-blue-50 border border-blue-300 text-blue-800'
                } px-4 py-3 rounded-lg relative shadow-sm`}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-0.5">
                    {logoutMessage.type === 'warning' ? (
                      <svg
                        className="h-5 w-5 text-yellow-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium">{logoutMessage.message}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLogoutMessage(null)}
                    className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Usuario
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm invalid:border-gray-300"
                placeholder="Ingresa tu usuario"
                data-testid="username-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm invalid:border-gray-300"
                  placeholder="Ingresa tu contraseña"
                  data-testid="password-input"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </div>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="text-center">
              <h4 className="text-sm font-medium text-blue-800 mb-3">🔑 Usuarios de Prueba</h4>
              <div className="text-xs text-blue-700 space-y-2">
                <div className="bg-white rounded px-3 py-2 shadow-sm">
                  <strong>👑 Administrador:</strong> admin / admin123
                </div>
                <div className="bg-white rounded px-3 py-2 shadow-sm">
                  <strong>👨‍💼 Gerente:</strong> manager / manager123
                </div>
                <div className="bg-white rounded px-3 py-2 shadow-sm">
                  <strong>👤 Vendedor:</strong> seller / seller123
                </div>
              </div>
              <p className="mt-2 text-xs text-blue-600">
                💡 Usa admin/admin123 para acceso completo
              </p>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            <p>🚀 Sistema POS Cesariel - Versión 1.0</p>
            <p>🔒 Conexión segura establecida</p>
          </div>
        </form>
      </div>
    </div>
  );
}