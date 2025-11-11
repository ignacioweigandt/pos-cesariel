// Server Component - Home Page
import { Suspense } from 'react'
import Link from 'next/link'
import { getBanners } from '@/src/lib/api'
import { BannerCarousel } from './_components/banner-carousel'
import { Button } from '@/src/shared/components/ui/button'

// Loading component for banner carousel
function BannerSkeleton() {
  return (
    <div className="w-full h-96 md:h-[500px] bg-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-gray-500">Cargando banners...</div>
    </div>
  )
}

// Fallback cuando no hay banners
function FallbackHero() {
  return (
    <section className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-6">
        Bienvenido a POS Cesariel
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Descubre nuestra selección de productos de calidad con los mejores precios
      </p>
      <div className="space-x-4">
        <Link href="/productos">
          <Button size="lg">Ver Productos</Button>
        </Link>
        <Link href="/carrito">
          <Button variant="outline" size="lg">Ver Carrito</Button>
        </Link>
      </div>
    </section>
  )
}

export default async function HomePage() {
  // Server-side data fetching with caching
  const banners = await getBanners()

  return (
    <div className="min-h-screen">
      {/* Hero Section - Banners Dinámicos */}
      <section className="relative">
        <Suspense fallback={<BannerSkeleton />}>
          {banners.length > 0 ? (
            <BannerCarousel banners={banners} />
          ) : (
            <FallbackHero />
          )}
        </Suspense>
      </section>

      {/* Quick Links */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/productos?categoria=ropa" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">👔</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ropa</h3>
                <p className="text-gray-600">Encuentra la última moda</p>
              </div>
            </Link>

            <Link href="/productos?categoria=calzado" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">👟</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Calzado</h3>
                <p className="text-gray-600">Zapatos para toda ocasión</p>
              </div>
            </Link>

            <Link href="/productos?categoria=accesorios" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">👜</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Accesorios</h3>
                <p className="text-gray-600">Complementa tu look</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

// Metadata for SEO
export const metadata = {
  title: 'POS Cesariel - Tienda Online',
  description: 'Descubre nuestra selección de productos de calidad con los mejores precios. Ropa, calzado y accesorios.',
}
