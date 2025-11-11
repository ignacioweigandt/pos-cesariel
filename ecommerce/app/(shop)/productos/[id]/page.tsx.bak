"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import { Star, Plus, Minus, ShoppingCart, Heart } from "lucide-react"
import { getProductById, getProductSizes } from "../../lib/data-service"
import { productsApi } from "../../lib/api"
import type { Product } from "../../lib/types"

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text: string | null;
  is_main: boolean;
  order: number;
  created_at: string | null;
}
import { useEcommerce } from "../../context/EcommerceContext"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import SizeSelectionModal from "../../components/modals/SizeSelectionModal"
import ColorSelectionModal from "../../components/modals/ColorSelectionModal"
import AddToCartModal from "../../components/modals/AddToCartModal"
import AlertModal from "../../components/modals/AlertModal"

export default function ProductDetailPage() {
  const params = useParams()
  const { cartState, addItem } = useEcommerce()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [availableSizes, setAvailableSizes] = useState<{ size: string; stock: number }[]>([])
  const [sizesLoading, setSizesLoading] = useState(false)
  const [images, setImages] = useState<ProductImage[]>([])
  const [isLoadingImages, setIsLoadingImages] = useState(true)

  // Modal states
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ title: "", description: "" })

  // Load product data from backend
  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true)
        const productData = await getProductById(String(params.id))
        setProduct(productData)
        
        // Load product images from API
        if (productData) {
          loadProductImages(String(params.id), productData)
        }
        
        // Load available sizes if product has sizes enabled
        if (productData && (productData.has_sizes || (productData.sizes && productData.sizes.length > 0))) {
          setSizesLoading(true)
          try {
            const sizesData = await getProductSizes(String(params.id))
            setAvailableSizes(sizesData)
          } catch (error) {
            console.error('Error loading product sizes:', error)
            // Fallback to static sizes if API fails
            setAvailableSizes(productData.sizes.map(size => ({ size, stock: 1 })))
          } finally {
            setSizesLoading(false)
          }
        }
      } catch (error) {
        console.error('Error loading product:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      loadProduct()
    }
  }, [params.id])

  // Load product images from API
  const loadProductImages = async (productId: string, productData: Product | null = null) => {
    try {
      setIsLoadingImages(true)
      const response = await productsApi.getImages(parseInt(productId))
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
        const currentProduct = productData || product
        if (currentProduct?.images && currentProduct.images.length > 0 && currentProduct.images[0]) {
          setImages([{
            id: 0,
            product_id: parseInt(productId),
            image_url: currentProduct.images[0],
            alt_text: currentProduct.name,
            is_main: true,
            order: 0,
            created_at: null
          }])
        } else {
          // Si no hay imágenes, usar placeholder
          setImages([{
            id: 0,
            product_id: parseInt(productId),
            image_url: "/placeholder.svg",
            alt_text: currentProduct?.name || "Producto",
            is_main: true,
            order: 0,
            created_at: null
          }])
        }
      }
    } catch (error) {
      console.error('Error cargando imágenes del producto:', error)
      // Fallback a imagen del producto si falla la API
      const currentProduct = productData || product
      if (currentProduct?.images && currentProduct.images.length > 0 && currentProduct.images[0]) {
        setImages([{
          id: 0,
          product_id: parseInt(productId),
          image_url: currentProduct.images[0],
          alt_text: currentProduct.name,
          is_main: true,
          order: 0,
          created_at: null
        }])
      } else {
        // Fallback final a placeholder
        setImages([{
          id: 0,
          product_id: parseInt(productId),
          image_url: "/placeholder.svg",
          alt_text: currentProduct?.name || "Producto",
          is_main: true,
          order: 0,
          created_at: null
        }])
      }
    } finally {
      setIsLoadingImages(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Cargando producto...</h1>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
          <p className="text-gray-600">El producto que buscas no existe o ha sido eliminado.</p>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    // Validar que el producto tenga stock general
    if (!product?.inStock) {
      setAlertConfig({
        title: "Sin Stock",
        description: "Este producto no tiene stock disponible."
      })
      setShowAlertModal(true)
      return
    }

    // Si el producto tiene talles habilitados, validar selección y stock por talle
    if (product?.has_sizes) {
      if (!selectedSize) {
        setShowSizeModal(true)
        return
      }
      
      // Validar stock del talle seleccionado
      const stock = getSizeStock(selectedSize)
      if (stock < quantity) {
        setAlertConfig({
          title: "Stock Insuficiente",
          description: `Solo hay ${stock} unidades disponibles del talle ${selectedSize}.`
        })
        setShowAlertModal(true)
        return
      }
    }

    if (!selectedColor) {
      setShowColorModal(true)
      return
    }

    addItem({
      id: product.id, // Already a string from mapApiProductToFrontend
      name: product.name,
      price: product.price,
      image: images[0]?.image_url || "/placeholder.svg",
      quantity,
      size: selectedSize,
      color: selectedColor,
      productId: parseInt(product.id), // Convert string ID back to number for backend
    })

    setShowAddToCartModal(true)
  }

  const handleSizeConfirm = (size: string) => {
    setSelectedSize(size)
    if (!selectedColor) {
      setShowColorModal(true)
    }
  }

  const handleColorConfirm = (color: string) => {
    setSelectedColor(color)
    if (!selectedSize) {
      setShowSizeModal(true)
    }
  }

  const getSizeOptions = () => {
    // Solo mostrar talles si el producto tiene talles habilitados
    if (!product?.has_sizes) {
      return []
    }
    
    // Si tenemos talles disponibles del backend, usar esos (solo con stock > 0)
    if (availableSizes.length > 0) {
      return availableSizes
        .filter(sizeInfo => sizeInfo.stock > 0)
        .map(sizeInfo => sizeInfo.size)
    }
    
    // Fallback a talles estáticos del producto si has_sizes está habilitado
    if (product?.category === "calzado") {
      return product.sizes // Talles numéricos para calzado
    } else {
      return product?.sizes || [] // Talles de ropa (XS, S, M, L, XL, XXL)
    }
  }

  const getSizeStock = (size: string) => {
    const sizeInfo = availableSizes.find(s => s.size === size)
    return sizeInfo ? sizeInfo.stock : 0
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-white border border-gray-200">
              {isLoadingImages ? (
                <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                  <div className="text-gray-500">Cargando imagen...</div>
                </div>
              ) : (
                <Image
                  src={images[selectedImage]?.image_url || "/placeholder.svg"}
                  alt={images[selectedImage]?.alt_text || product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain p-4"
                />
              )}
            </div>

            {/* Thumbnail Images - Solo mostrar si hay más de una imagen */}
            {images.length > 1 && (
              <div className="flex space-x-4">
                {images.map((image, index) => (
                  <button
                    key={image.id || index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 bg-white ${
                      selectedImage === index ? "border-blue-500" : "border-gray-200"
                    }`}
                  >
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.alt_text || `${product.name} ${index + 1}`}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(product.rating) ? "text-yellow-400 fill-current" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviews} reseñas)</span>
                <Badge variant="secondary">{product.brand}</Badge>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-800">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">${product.originalPrice.toLocaleString()}</span>
                  <Badge variant="destructive">
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Descripción</h3>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Color: {selectedColor && <span className="font-normal">({selectedColor})</span>}
              </Label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedColor === color
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - Only show if product has sizes */}
            {product?.has_sizes && (
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Talle: {selectedSize && <span className="font-normal">({selectedSize})</span>}
                  {selectedSize && availableSizes.length > 0 && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Stock: {getSizeStock(selectedSize)})
                    </span>
                  )}
                </Label>
                {sizesLoading ? (
                  <div className="w-full p-3 border rounded-md text-gray-500">
                    Cargando talles disponibles...
                  </div>
                ) : (
                  <Select value={selectedSize} onValueChange={setSelectedSize}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={
                        getSizeOptions().length > 0 
                          ? "Selecciona un talle" 
                          : "No hay talles disponibles"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {getSizeOptions().map((size) => {
                        const stock = getSizeStock(size)
                        return (
                          <SelectItem key={size} value={size}>
                            {size} {availableSizes.length > 0 && `(Stock: ${stock})`}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                )}
                {product.category === "calzado" && (
                  <p className="text-sm text-gray-500 mt-1">Talles disponibles del 35 al 45</p>
                )}
                {product.category === "ropa" && (
                  <p className="text-sm text-gray-500 mt-1">
                    Guía de talles: XS (34-36), S (38-40), M (42-44), L (46-48), XL (50-52), XXL (54-56)
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div>
              <Label className="text-base font-medium mb-3 block">Cantidad</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-lg font-medium w-12 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    const maxStock = selectedSize ? getSizeStock(selectedSize) : 99
                    setQuantity(Math.min(quantity + 1, maxStock > 0 ? maxStock : 99))
                  }}
                  disabled={selectedSize && getSizeStock(selectedSize) > 0 && quantity >= getSizeStock(selectedSize)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {selectedSize && availableSizes.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  Máximo disponible: {getSizeStock(selectedSize)}
                </p>
              )}
            </div>

            {/* Stock Status */}
            <div>
              {product.inStock ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  En Stock
                </Badge>
              ) : (
                <Badge variant="destructive">Sin Stock</Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button onClick={handleAddToCart} disabled={!product.inStock} className="w-full" size="lg">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al Carrito
              </Button>

              <Button variant="outline" className="w-full bg-transparent" size="lg">
                <Heart className="h-5 w-5 mr-2" />
                Agregar a Favoritos
              </Button>
            </div>

            {/* Additional Info */}
            <div className="border-t pt-6 space-y-2 text-sm text-gray-600">
              <p>• Envío gratis en compras superiores a $10.000</p>
              <p>• Cambios y devoluciones hasta 30 días</p>
              <p>• Garantía de calidad</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SizeSelectionModal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        onConfirm={handleSizeConfirm}
        sizes={getSizeOptions()}
        category={product.category}
        selectedSize={selectedSize}
      />

      <ColorSelectionModal
        isOpen={showColorModal}
        onClose={() => setShowColorModal(false)}
        onConfirm={handleColorConfirm}
        colors={product.colors}
        selectedColor={selectedColor}
      />

      <AddToCartModal
        isOpen={showAddToCartModal}
        onClose={() => setShowAddToCartModal(false)}
        product={{
          name: product.name,
          price: product.price,
          image: images[0]?.image_url || "/placeholder.svg",
          color: selectedColor,
          size: selectedSize,
          quantity,
        }}
        cartItemsCount={cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
      />

      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertConfig.title}
        description={alertConfig.description}
      />
    </>
  )
}
