'use client'

import { useEffect } from 'react'
import { Button } from '@/src/shared/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('[Products Error]', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Error al cargar productos
        </h2>
        <p className="text-gray-600 mb-6">
          Ocurrió un problema al cargar los productos. Por favor, intenta de nuevo.
        </p>
        <div className="space-y-3">
          <Button onClick={reset} className="w-full">
            Intentar de nuevo
          </Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = '/')}
            className="w-full"
          >
            Volver al inicio
          </Button>
        </div>
        {error.message && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">
              Detalles técnicos
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
