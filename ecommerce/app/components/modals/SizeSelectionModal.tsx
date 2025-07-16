"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface SizeSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (size: string) => void
  sizes: string[]
  category: string
  selectedSize?: string
}

export default function SizeSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  sizes,
  category,
  selectedSize,
}: SizeSelectionModalProps) {
  const [tempSelectedSize, setTempSelectedSize] = useState(selectedSize || "")

  const handleConfirm = () => {
    if (tempSelectedSize) {
      onConfirm(tempSelectedSize)
      onClose()
    }
  }

  const getSizeGuide = () => {
    if (category === "calzado") {
      return "Talles disponibles del 35 al 45. Si tenés dudas, consultanos por WhatsApp."
    } else {
      return "Guía de talles: XS (34-36), S (38-40), M (42-44), L (46-48), XL (50-52), XXL (54-56)"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Talle</DialogTitle>
          <DialogDescription>Elegí el talle que mejor te quede</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => (
              <Button
                key={size}
                variant={tempSelectedSize === size ? "default" : "outline"}
                onClick={() => setTempSelectedSize(size)}
                className="h-12"
              >
                {size}
              </Button>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>Guía de Talles:</strong>
              <br />
              {getSizeGuide()}
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!tempSelectedSize} className="w-full sm:w-auto">
            Confirmar Talle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
