"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"
import type { Banner } from "@/types"

interface BannerCarouselProps {
  banners: Banner[]
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

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

  if (banners.length === 0) {
    return null
  }

  const currentBanner = banners[currentBannerIndex]

  return (
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
            {currentBanner.link && currentBanner.link !== '#' && (
              <Link href={currentBanner.link}>
                <Button size="lg" className="text-lg px-8 py-3">
                  Ver Más
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
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 p-2 rounded-full transition-all"
            aria-label="Banner siguiente"
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
                aria-label={`Ir al banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
