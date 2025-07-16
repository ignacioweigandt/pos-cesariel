"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ecommerceApi } from "./lib/api"
import Link from "next/link"

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  button_text: string | null;
  active: boolean;
  order: number;
}

export default function Home() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [isLoadingBanners, setIsLoadingBanners] = useState(true)

  // Cargar banners
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setIsLoadingBanners(true)
        const response = await ecommerceApi.getBanners()
        const bannersData = response.data.data
        
        if (bannersData && bannersData.length > 0) {
          setBanners(bannersData)
        }
      } catch (error) {
        console.error('Error cargando banners:', error)
      } finally {
        setIsLoadingBanners(false)
      }
    }

    loadBanners()
  }, [])

  // Auto-slide de banners cada 5 segundos
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
      }, 5000)
      
      return () => clearInterval(interval)
    }
  }, [banners.length])

  const nextBanner = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
    }
  }

  const prevBanner = () => {
    if (banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
    }
  }

  const currentBanner = banners[currentBannerIndex]

  return (
    <div className="min-h-screen">
      {/* Hero Section - Banners Dinámicos */}
      <section className="relative">
        {isLoadingBanners ? (
          <div className="w-full h-96 bg-gray-200 animate-pulse flex items-center justify-center">
            <div className="text-gray-500">Cargando banners...</div>
          </div>
        ) : banners.length > 0 ? (
          <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
            {/* Banner actual */}
            <div className="relative w-full h-full">
              <Image
                src={currentBanner.image}
                alt={currentBanner.title}
                fill
                className="object-cover"
                priority
              />
              
              {/* Overlay para mejorar legibilidad del texto */}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
              
              {/* Contenido del banner */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white px-4 max-w-4xl">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {currentBanner.title}
                  </h1>
                  {currentBanner.subtitle && (
                    <p className="text-xl md:text-2xl mb-8 opacity-90">
                      {currentBanner.subtitle}
                    </p>
                  )}
                  {currentBanner.link && currentBanner.button_text && (
                    <Link href={currentBanner.link}>
                      <Button size="lg" className="text-lg px-8 py-3">
                        {currentBanner.button_text}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
            
            {/* Controles de navegación - solo si hay más de 1 banner */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                
                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all ${
                        index === currentBannerIndex 
                          ? 'bg-white' 
                          : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          /* Fallback si no hay banners */
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
        )}
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