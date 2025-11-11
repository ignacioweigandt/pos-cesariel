'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/src/shared/components/ui/button'

/**
 * Error boundary for shop pages
 *
 * Catches unhandled errors in Server Components and provides graceful recovery
 * This is a fallback for cases where API errors propagate despite our handling
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('[Shop Error Boundary]', {
      name: error.name,
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">⚠️</div>

        <h1 className="text-3xl font-bold text-gray-900">
          Algo salió mal
        </h1>

        <p className="text-gray-600">
          Lo sentimos, hubo un problema al cargar la página.
          Esto puede ocurrir si el servidor está temporalmente no disponible.
        </p>

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-left">
          <p className="font-semibold text-gray-700 mb-2">
            Detalles técnicos:
          </p>
          <p className="text-gray-600 font-mono text-xs break-all">
            {error.message}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full"
            size="lg"
          >
            Intentar de nuevo
          </Button>

          <Link href="/" className="block">
            <Button
              variant="outline"
              className="w-full"
              size="lg"
            >
              Volver al inicio
            </Button>
          </Link>
        </div>

        <p className="text-sm text-gray-500">
          Si el problema persiste, por favor{' '}
          <Link href="/contacto" className="text-primary hover:underline">
            contáctanos
          </Link>
        </p>
      </div>
    </div>
  )
}
