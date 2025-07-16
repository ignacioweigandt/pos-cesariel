"use client"

import { AlertCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CheckoutErrorModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  missingFields?: string[]
}

export default function CheckoutErrorModal({
  isOpen,
  onClose,
  title,
  message,
  missingFields = [],
}: CheckoutErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center whitespace-pre-line">{message}</DialogDescription>
        </DialogHeader>

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-sm">Campos faltantes:</p>
            <ul className="space-y-1">
              {missingFields.map((field, index) => (
                <li key={index} className="flex items-center text-sm text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full mr-2" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            Entendido
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
