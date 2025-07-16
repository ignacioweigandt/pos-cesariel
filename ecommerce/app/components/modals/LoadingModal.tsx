"use client"

import { Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface LoadingModalProps {
  isOpen: boolean
  message?: string
}

export default function LoadingModal({ isOpen, message = "Cargando..." }: LoadingModalProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Procesando</DialogTitle>
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-center text-gray-600">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
