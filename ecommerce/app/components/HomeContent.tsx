"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Banner from "./Banner"
import ProductCard from "./ProductCard"
import ConnectionStatus from "./ConnectionStatus"
import { getBanners } from "../lib/data-service"
import { useProducts } from "../hooks/useProducts"
import type { Banner as BannerType } from "../lib/types"

export default function HomeContent() {
  const [banners, setBanners] = useState<BannerType[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  
  // Usar el hook para productos destacados
  const { products: featuredProducts, loading: productsLoading, error } = useProducts({ featured: true })

  // Cargar banners al montar el componente
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setBannersLoading(true)
        const bannersData = await getBanners()
        setBanners(bannersData)
      } catch (error) {
        console.error('Error loading banners:', error)
      } finally {
        setBannersLoading(false)
      }
    }

    loadBanners()
  }, [])

  return (
    <div className="min-h-screen">
      <ConnectionStatus />

      {/* Hero Banners */}
      <section className="container mx-auto px-4 py-8">
        {bannersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners
              .filter((banner) => banner.active)
              .map((banner) => (
                <Banner key={banner.id} banner={banner} />
              ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección de productos más populares con los mejores precios y la mejor calidad.
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">Error al cargar productos: {error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/productos">
            <Button size="lg">Ver Todos los Productos</Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Categorías</h2>
            <p className="text-gray-600">Explora nuestras categorías de productos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/productos?categoria=ropa" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <span className="text-2xl">👔</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Ropa</h3>
                <p className="text-gray-600">Encuentra la última moda en ropa para todos los estilos</p>
              </div>
            </Link>

            <Link href="/productos?categoria=calzado" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                  <span className="text-2xl">👟</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Calzado</h3>
                <p className="text-gray-600">Zapatos cómodos y elegantes para cualquier ocasión</p>
              </div>
            </Link>

            <Link href="/productos?categoria=accesorios" className="group">
              <div className="bg-white rounded-lg p-8 text-center shadow-md hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <span className="text-2xl">👜</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Accesorios</h3>
                <p className="text-gray-600">Complementa tu look con nuestros accesorios únicos</p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}