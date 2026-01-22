import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import type { Product } from "../lib/types"
import { productsApi } from "../lib/api"
import { Button } from "@/components/ui/button"

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  is_main: boolean;
  order: number;
  created_at: string | null;
}

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const [images, setImages] = useState<ProductImage[]>([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoadingImages, setIsLoadingImages] = useState(true)

  // Cargar imágenes del producto
  useEffect(() => {
    const loadProductImages = async () => {
      try {
        setIsLoadingImages(true)
        const response = await productsApi.getImages(Number(product.id))
        const productImages = response.data.data
        
        if (productImages && productImages.length > 0) {
          // Ordenar imágenes: imagen principal primero, luego por orden
          const sortedImages = productImages.sort((a: ProductImage, b: ProductImage) => {
            if (a.is_main && !b.is_main) return -1
            if (!a.is_main && b.is_main) return 1
            return a.order - b.order
          })
          setImages(sortedImages)
        } else {
          // Si no hay imágenes específicas, usar la imagen del producto si existe
          if (product.images && product.images.length > 0 && product.images[0]) {
            setImages([{
              id: 0,
              product_id: Number(product.id),
              image_url: product.images[0],
              alt_text: product.name,
              is_main: true,
              order: 0,
              created_at: null
            }])
          }
        }
      } catch (error) {
        console.error('Error cargando imágenes del producto:', error)
        // Fallback a imagen del producto si falla la API
        if (product.images && product.images.length > 0 && product.images[0]) {
          setImages([{
            id: 0,
            product_id: Number(product.id),
            image_url: product.images[0],
            alt_text: product.name,
            is_main: true,
            order: 0,
            created_at: null
          }])
        }
      } finally {
        setIsLoadingImages(false)
      }
    }

    loadProductImages()
  }, [product.id, product.images, product.name])

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length)
    }
  }

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
    }
  }

  const currentImage = images[currentImageIndex]

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={`/productos/${product.id}`}>
        <div className="relative group bg-white">
          {isLoadingImages ? (
            <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
          ) : (
            <>
              <Image
                src={currentImage?.image_url || "/placeholder.svg"}
                alt={currentImage?.alt_text || product.name}
                width={300}
                height={300}
                className="w-full h-48 object-contain p-2"
              />
              
              {/* Botones de navegación - aparecen en hover y solo si hay más de 1 imagen */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      prevImage()
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      nextImage()
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  
                  {/* Indicadores de imagen */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentImageIndex(index)
                        }}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
          
          {product.originalPrice && (
            <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/productos/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
        </Link>

        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600 ml-2">({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-xl font-bold text-gray-800">${product.price.toLocaleString()}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {product.brand && (
            <span className="text-sm text-gray-600">{product.brand.name}</span>
          )}
        </div>

        <Button asChild className="w-full">
          <Link href={`/productos/${product.id}`}>Ver Detalles</Link>
        </Button>
      </div>
    </div>
  )
}
