"use client"

import Image from "next/image"
import { Trash2, AlertTriangle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RemoveFromCartModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  product: {
    name: string
    color: string
    size: string
    image: string
  }
}

export default function RemoveFromCartModal({ isOpen, onClose, onConfirm, product }: RemoveFromCartModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <AlertDialogTitle className="text-center">¿Eliminar producto?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Esta acción no se puede deshacer. El producto será eliminado de tu carrito.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={60}
            height={60}
            className="rounded-lg object-cover"
          />
          <div>
            <h4 className="font-semibold">{product.name}</h4>
            <p className="text-sm text-gray-600">
              {product.color} • Talle {product.size}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600 hover:bg-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
