'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Star, Plus, Minus, ShoppingCart, Heart } from 'lucide-react'
import type { Product } from '@/src/types'
import { useEcommerce } from '@/src/shared/providers/ecommerce-provider'
import { Button } from '@/src/shared/components/ui/button'
import { Label } from '@/src/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Badge } from '@/src/shared/components/ui/badge'
import SizeSelectionModal from '@/app/components/modals/SizeSelectionModal'
import ColorSelectionModal from '@/app/components/modals/ColorSelectionModal'
import AddToCartModal from '@/app/components/modals/AddToCartModal'
import AlertModal from '@/app/components/modals/AlertModal'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { cartState, addItem } = useEcommerce()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [quantity, setQuantity] = useState(1)

  // Modal states
  const [showSizeModal, setShowSizeModal] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false)
  const [showAddToCartModal, setShowAddToCartModal] = useState(false)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertConfig, setAlertConfig] = useState({ title: '', description: '' })

  const handleAddToCart = () => {
    // Validate stock
    if (!product?.inStock) {
      setAlertConfig({
        title: 'Sin Stock',
        description: 'Este producto no tiene stock disponible.',
      })
      setShowAlertModal(true)
      return
    }

    // Validate size selection if product has sizes
    if (product?.has_sizes && !selectedSize) {
      setShowSizeModal(true)
      return
    }

    // Validate color selection
    if (!selectedColor) {
      setShowColorModal(true)
      return
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg',
      quantity,
      size: selectedSize || undefined,
      color: selectedColor,
      productId: parseInt(product.id),
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
    if (product?.has_sizes && !selectedSize) {
      setShowSizeModal(true)
    }
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-white border border-gray-200">
              <Image
                src={product.images[selectedImage] || '/placeholder.svg'}
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-contain p-4"
                priority
              />
            </div>

            {/* Thumbnail Images - Only show if there are multiple images */}
            {product.images.length > 1 && (
              <div className="flex space-x-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 bg-white ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${product.name} ${index + 1}`}
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
                        i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({product.reviews} reseñas)</span>
                {product.brand && (
                  <Badge variant="secondary">{product.brand.name}</Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-center space-x-4">
              <span className="text-3xl font-bold text-gray-800">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.originalPrice.toLocaleString()}
                  </span>
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
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - Only show if product has sizes */}
            {product?.has_sizes && product.sizes.length > 0 && (
              <div>
                <Label className="text-base font-medium mb-3 block">
                  Talle: {selectedSize && <span className="font-normal">({selectedSize})</span>}
                </Label>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona un talle" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {product.category === 'calzado' && (
                  <p className="text-sm text-gray-500 mt-1">Talles disponibles del 35 al 45</p>
                )}
                {product.category === 'ropa' && (
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
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
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
        sizes={product.sizes}
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
          image: product.images[0] || '/placeholder.svg',
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
