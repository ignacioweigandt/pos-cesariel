"use client"

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wifi, WifiOff, AlertCircle } from "lucide-react"
import { testConnection } from '../lib/data-service'

interface ConnectionStatusProps {
  onConnectionChange?: (isConnected: boolean) => void
}

export default function ConnectionStatus({ onConnectionChange }: ConnectionStatusProps) {
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkConnection = async () => {
    setIsChecking(true)
    try {
      const isConnected = await testConnection()
      setConnectionStatus(isConnected)
      onConnectionChange?.(isConnected)
    } catch (error) {
      setConnectionStatus(false)
      onConnectionChange?.(false)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    checkConnection()
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000)
    
    return () => clearInterval(interval)
  }, [])

  if (connectionStatus === null && !isChecking) {
    return null
  }

  const getStatusInfo = () => {
    if (isChecking) {
      return {
        icon: <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />,
        message: "Verificando conexión...",
        className: "border-blue-200 bg-blue-50 text-blue-800"
      }
    }

    if (connectionStatus) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-600" />,
        message: "✅ Conectado al sistema POS - Mostrando datos en tiempo real",
        className: "border-green-200 bg-green-50 text-green-800"
      }
    }

    return {
      icon: <WifiOff className="h-4 w-4 text-yellow-600" />,
      message: "⚠️ Sin conexión al sistema POS - Mostrando datos de respaldo",
      className: "border-yellow-200 bg-yellow-50 text-yellow-800"
    }
  }

  const { icon, message, className } = getStatusInfo()

  return (
    <Alert className={className}>
      <div className="flex items-center">
        <div className="mr-2">{icon}</div>
        <AlertDescription>
          {message}
          {!connectionStatus && !isChecking && (
            <button 
              onClick={checkConnection}
              className="ml-2 underline hover:no-underline"
            >
              Reintentar
            </button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  )
}