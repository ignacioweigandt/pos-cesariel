"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CheckCircle, MessageCircle } from "lucide-react"
import { Button } from "@/src/shared/components/ui/button"

interface PurchaseSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  onContinueToWhatsApp: () => void
  saleId?: number
}

export default function PurchaseSuccessModal({
  isOpen,
  onClose,
  onContinueToWhatsApp,
  saleId
}: PurchaseSuccessModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  // Solo usamos mounted para evitar errores de hidratación
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    console.log('🎯 PurchaseSuccessModal ACTUALIZADO - isOpen:', isOpen, 'saleId:', saleId, 'isMounted:', isMounted)

    if (isOpen) {
      console.log('🔓 Modal ABIERTO - bloqueando scroll')
      document.body.style.overflow = 'hidden'
    } else {
      console.log('🔒 Modal CERRADO - habilitando scroll')
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, saleId, isMounted])

  // No renderizar en el servidor
  if (!isMounted) {
    return null
  }

  const modalContent = (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4 z-50">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="mx-auto mb-4 flex justify-center">
            <CheckCircle className="h-20 w-20 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            ¡Gracias por tu compra!
          </h2>
        </div>

        {/* Content */}
        <div className="space-y-4 mb-6">
          <p className="font-semibold text-lg text-gray-800 text-center">
            Pedido #{saleId || 'CONFIRMADO'} registrado exitosamente
          </p>
          <p className="text-gray-600 text-center">
            Tu venta está en proceso. A continuación serás redirigido a WhatsApp para coordinar el pago y la entrega.
          </p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✅ <strong>Pedido confirmado</strong>
              <br />
              📱 <strong>Siguiente paso:</strong> Confirmar por WhatsApp
              <br />
              💰 <strong>Pago:</strong> Se coordina vía WhatsApp
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => {
              console.log('🟢 Botón "Continuar por WhatsApp" clickeado')
              onContinueToWhatsApp()
            }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Continuar por WhatsApp
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
