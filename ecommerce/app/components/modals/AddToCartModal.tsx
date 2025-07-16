"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle, ShoppingCart, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AddToCartModalProps {
  isOpen: boolean
  onClose: () => void
  product: {
    name: string
    price: number
    image: string
    color: string
    size: string
    quantity: number
  }
  cartItemsCount: number
}

export default function AddToCartModal({ isOpen, onClose, product, cartItemsCount }: AddToCartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center">¡Producto Agregado!</DialogTitle>
          <DialogDescription className="text-center">
            El producto se agregó correctamente a tu carrito de compras
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Product Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              width={60}
              height={60}
              className="rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold">{product.name}</h4>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Color: {product.color}</span>
                <span>•</span>
                <span>Talle: {product.size}</span>
                <span>•</span>
                <span>Cant: {product.quantity}</span>
              </div>
              <p className="font-bold text-lg">${product.price.toLocaleString()}</p>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Tu carrito</span>
              </div>
              <Badge variant="secondary">{cartItemsCount} productos</Badge>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
            Seguir Comprando
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/carrito" className="flex items-center justify-center">
              Ver Carrito
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
