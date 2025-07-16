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

interface ColorSelectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (color: string) => void
  colors: string[]
  selectedColor?: string
}

export default function ColorSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  colors,
  selectedColor,
}: ColorSelectionModalProps) {
  const [tempSelectedColor, setTempSelectedColor] = useState(selectedColor || "")

  const handleConfirm = () => {
    if (tempSelectedColor) {
      onConfirm(tempSelectedColor)
      onClose()
    }
  }

  const getColorClass = (color: string) => {
    const colorMap: { [key: string]: string } = {
      Negro: "bg-black",
      Blanco: "bg-white border-2 border-gray-300",
      Gris: "bg-gray-500",
      Azul: "bg-blue-500",
      Rojo: "bg-red-500",
      Verde: "bg-green-500",
      Amarillo: "bg-yellow-400",
      Rosa: "bg-pink-400",
      Marrón: "bg-amber-700",
      Beige: "bg-amber-200",
    }
    return colorMap[color] || "bg-gray-400"
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Seleccionar Color</DialogTitle>
          <DialogDescription>Elegí el color que más te guste</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setTempSelectedColor(color)}
                className={`flex items-center space-x-3 p-3 border-2 rounded-lg transition-all ${
                  tempSelectedColor === color ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className={`w-6 h-6 rounded-full ${getColorClass(color)}`} />
                <span className="font-medium">{color}</span>
              </button>
            ))}
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
            <p className="text-sm text-gray-600">
              💡 <strong>Tip:</strong> Los colores pueden variar ligeramente según tu pantalla. Si tenés dudas,
              consultanos por WhatsApp.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!tempSelectedColor} className="w-full sm:w-auto">
            Confirmar Color
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
