import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/src/shared/components/ui/button'

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <AlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
        <p className="text-gray-600 mb-6">
          El producto que buscas no existe o ha sido eliminado.
        </p>
        <div className="space-y-3">
          <Link href="/productos">
            <Button className="w-full">Ver todos los productos</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Volver al inicio
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
