"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useEcommerce } from "@/src/shared/providers/ecommerce-provider"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Separator } from "@/src/shared/components/ui/separator"
import RemoveFromCartModal from "@/app/components/modals/RemoveFromCartModal"
import CheckoutErrorModal from "@/app/components/modals/CheckoutErrorModal"
import LoadingModal from "@/app/components/modals/LoadingModal"
import PurchaseSuccessModal from "@/app/components/modals/PurchaseSuccessModal"
import { whatsappConfigApi } from "@/app/lib/api"

export default function CartPage() {
  const {
    cartState,
    updateQuantity,
    removeItem,
    setCustomerInfo,
    setDeliveryMethod,
    processCheckout
  } = useEcommerce()

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [productToRemove, setProductToRemove] = useState<{ id: string; name: string; size?: string } | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorConfig, setErrorConfig] = useState<{ title: string; message: string; missingFields: string[] }>({ title: "", message: "", missingFields: [] })
  const [showLoadingModal, setShowLoadingModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [completedSaleId, setCompletedSaleId] = useState<number | undefined>(undefined)
  const [savedCartState, setSavedCartState] = useState<typeof cartState | null>(null)

  // Debug useEffect to monitor modal state
  useEffect(() => {
    console.log('🔔 showSuccessModal cambió a:', showSuccessModal)
  }, [showSuccessModal])

  // Helper function to update customer info
  const updateCustomerInfo = (updates: Partial<typeof cartState.customerInfo>) => {
    const currentInfo = cartState.customerInfo || {
      name: "",
      phone: "",
      email: "",
      address: {
        street: "",
        number: "",
        floor: "",
        city: "",
        province: "",
        postalCode: ""
      },
      notes: ""
    }
    setCustomerInfo({ ...currentInfo, ...updates })
  }

  // Helper function to update address
  const updateAddress = (addressUpdates: Partial<NonNullable<typeof cartState.customerInfo>['address']>) => {
    const currentAddress = cartState.customerInfo?.address || {
      street: "",
      number: "",
      floor: "",
      city: "",
      province: "",
      postalCode: ""
    }
    updateCustomerInfo({ 
      address: { ...currentAddress, ...addressUpdates } 
    })
  }

  const handleUpdateQuantity = async (id: string, newQuantity: number, size?: string) => {
    if (newQuantity <= 0) {
      removeItem(id, size)
    } else {
      await updateQuantity(id, newQuantity, size)
    }
  }

  const handleRemoveClick = (item: { id: string; name: string; size?: string }) => {
    setProductToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = () => {
    if (productToRemove) {
      removeItem(productToRemove.id, productToRemove.size)
      setShowRemoveModal(false)
      setProductToRemove(null)
    }
  }

  const handleCheckout = async () => {
    // Validate customer info using the form state
    const missingFields = []

    if (!cartState.customerInfo?.name) missingFields.push("Nombre completo")
    if (!cartState.customerInfo?.phone) missingFields.push("Teléfono")

    if (cartState.deliveryMethod === "delivery") {
      const address = cartState.customerInfo?.address
      if (!address?.street) missingFields.push("Calle")
      if (!address?.number) missingFields.push("Número")
      if (!address?.city) missingFields.push("Ciudad")
      if (!address?.province) missingFields.push("Provincia")
      if (!address?.postalCode) missingFields.push("Código Postal")
    }

    if (missingFields.length > 0) {
      setErrorConfig({
        title: "Información Incompleta",
        message: "Por favor completa todos los campos obligatorios para continuar.",
        missingFields,
      })
      setShowErrorModal(true)
      return
    }

    setShowLoadingModal(true)

    // Save cart state before checkout (cart will be cleared after processCheckout)
    setSavedCartState({ ...cartState })

    try {
      // Process checkout through EcommerceContext (creates sale in backend)
      const result = await processCheckout()

      console.log('🔍 Checkout result:', result)
      setShowLoadingModal(false)

      if (result.success) {
        // Store sale ID and show success modal
        console.log('✅ Checkout exitoso, mostrando modal de éxito')
        setCompletedSaleId(result.saleId)
        setShowSuccessModal(true)
      } else {
        console.log('❌ Checkout falló:', result.error)
        setErrorConfig({
          title: "Error en el Checkout",
          message: result.error || "Hubo un problema al procesar tu pedido. Intenta nuevamente.",
          missingFields: [],
        })
        setShowErrorModal(true)
      }
    } catch {
      setShowLoadingModal(false)
      setErrorConfig({
        title: "Error de Conexión",
        message: "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.",
        missingFields: [],
      })
      setShowErrorModal(true)
    }
  }

  const handleContinueToWhatsApp = async () => {
    console.log('📱 Continuando a WhatsApp con sale ID:', completedSaleId)
    console.log('📦 Saved cart state:', savedCartState)

    // Close success modal
    setShowSuccessModal(false)

    // Generate WhatsApp message with the stored sale ID
    await generateWhatsAppMessage(completedSaleId)
  }

  const generateWhatsAppMessage = async (saleId?: number) => {
    console.log('🚀 Generando mensaje de WhatsApp...')
    // Use saved cart state (since cart is cleared after checkout)
    const cart = savedCartState || cartState
    console.log('📋 Cart para WhatsApp:', cart)

    try {
      // Fetch WhatsApp configuration from backend
      const configResponse = await whatsappConfigApi.getConfig()
      let whatsappPhone = "5491123456789" // Fallback number

      if (configResponse.data && configResponse.data.data) {
        const config = configResponse.data.data
        if (config.is_active && config.business_phone) {
          // Clean the phone number (remove + and spaces)
          whatsappPhone = config.business_phone.replace(/[\+\s\-]/g, "")
        }
      }

      const orderDetails = cart.items
        .map(
          (item) =>
            `• ${item.name}${item.size ? ` - Talle: ${item.size}` : ''} - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`,
        )
        .join("\n")

      const deliveryInfo =
        cart.deliveryMethod === "pickup"
          ? "*RETIRO EN LOCAL*\nAv. Corrientes 1234, CABA\nHorarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
          : `*ENVÍO A DOMICILIO*\n${cart.customerInfo?.address?.street} ${cart.customerInfo?.address?.number}${cart.customerInfo?.address?.floor ? `, ${cart.customerInfo?.address?.floor}` : ""}\n${cart.customerInfo?.address?.city}, ${cart.customerInfo?.address?.province}\nCP: ${cart.customerInfo?.address?.postalCode}`

      const message = `¡Hola! Quiero realizar el siguiente pedido:

*PEDIDO #${saleId || 'CONFIRMADO'}* ✅

*PRODUCTOS:*
${orderDetails}

*MÉTODO DE ENTREGA:*
${deliveryInfo}

*RESUMEN:*
Subtotal: $${cart.total.toLocaleString()}
${cart.deliveryMethod === "delivery" ? "Envío: A coordinar por WhatsApp" : "Envío: Gratis (Retiro en local)"}
*TOTAL: $${cart.total.toLocaleString()}*

*DATOS DEL CLIENTE:*
Nombre: ${cart.customerInfo?.name}
Teléfono: ${cart.customerInfo?.phone}

${cart.customerInfo?.notes ? `*NOTAS:*\n${cart.customerInfo?.notes}` : ""}

El pedido ya está registrado en el sistema ✅
¡Gracias!`

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      console.log('📲 Abriendo WhatsApp:', whatsappUrl)
      window.open(whatsappUrl, "_blank")
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error)
      // Fallback to hardcoded number if API fails
      const orderDetails = cart.items
        .map(
          (item) =>
            `• ${item.name}${item.size ? ` - Talle: ${item.size}` : ''} - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`,
        )
        .join("\n")

      const deliveryInfo =
        cart.deliveryMethod === "pickup"
          ? "*RETIRO EN LOCAL*\nAv. Corrientes 1234, CABA\nHorarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
          : `*ENVÍO A DOMICILIO*\n${cart.customerInfo?.address?.street} ${cart.customerInfo?.address?.number}${cart.customerInfo?.address?.floor ? `, ${cart.customerInfo?.address?.floor}` : ""}\n${cart.customerInfo?.address?.city}, ${cart.customerInfo?.address?.province}\nCP: ${cart.customerInfo?.address?.postalCode}`

      const message = `¡Hola! Quiero realizar el siguiente pedido:

*PEDIDO #${saleId || 'CONFIRMADO'}* ✅

*PRODUCTOS:*
${orderDetails}

*MÉTODO DE ENTREGA:*
${deliveryInfo}

*RESUMEN:*
Subtotal: $${cart.total.toLocaleString()}
${cart.deliveryMethod === "delivery" ? "Envío: A coordinar por WhatsApp" : "Envío: Gratis (Retiro en local)"}
*TOTAL: $${cart.total.toLocaleString()}*

*DATOS DEL CLIENTE:*
Nombre: ${cart.customerInfo?.name}
Teléfono: ${cart.customerInfo?.phone}

${cart.customerInfo?.notes ? `*NOTAS:*\n${cart.customerInfo?.notes}` : ""}

El pedido ya está registrado en el sistema ✅
¡Gracias!`

      const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(message)}`
      console.log('📲 Abriendo WhatsApp (fallback):', whatsappUrl)
      window.open(whatsappUrl, "_blank")
    }
  }

  // Solo mostrar "carrito vacío" si no hay un modal de éxito activo
  if (cartState.items.length === 0 && !showSuccessModal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar tu compra</p>
          <Button asChild>
            <Link href="/productos">Explorar Productos</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Si el modal de éxito está abierto, mostrar solo el modal */}
      {showSuccessModal ? (
        <div className="h-screen flex items-center justify-center">
          {/* El modal se renderiza al final del componente */}
        </div>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartState.items.map((item) => (
            <div key={`${item.id}-${item.size || 'no-size'}`} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center space-x-4">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="rounded-lg object-cover"
                />

                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  {item.size && <p className="text-gray-600">Talle: {item.size}</p>}
                  <p className="text-lg font-bold">${item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg">${(item.price * item.quantity).toLocaleString()}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveClick(item)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary & Customer Info */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Información de Contacto</h2>

            {/* Delivery Method Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">Método de Entrega</label>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="pickup"
                    name="deliveryMethod"
                    value="pickup"
                    checked={cartState.deliveryMethod === "pickup"}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="pickup" className="ml-2 block text-sm text-gray-700">
                    <span className="font-medium">Retiro en Local</span>
                    <span className="block text-gray-500 text-xs">Gratis - Retirá tu pedido en nuestro local</span>
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="delivery"
                    name="deliveryMethod"
                    value="delivery"
                    checked={cartState.deliveryMethod === "delivery"}
                    onChange={(e) => setDeliveryMethod(e.target.value as 'pickup' | 'delivery')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label htmlFor="delivery" className="ml-2 block text-sm text-gray-700">
                    <span className="font-medium">Envío a Domicilio</span>
                    <span className="block text-gray-500 text-xs">
                      Costo a coordinar por WhatsApp - Recibí tu pedido en tu casa
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                <Input
                  type="text"
                  value={cartState.customerInfo?.name || ""}
                  onChange={(e) => updateCustomerInfo({ name: e.target.value })}
                  placeholder="Tu nombre completo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
                <Input
                  type="tel"
                  value={cartState.customerInfo?.phone || ""}
                  onChange={(e) => {
                    // Solo permitir números, espacios, guiones, paréntesis y el símbolo +
                    const value = e.target.value.replace(/[^0-9+\-\s()]/g, '')
                    updateCustomerInfo({ phone: value })
                  }}
                  placeholder="Ej: +54 11 1234-5678"
                  pattern="[0-9+\-\s()]*"
                  title="Solo se permiten números y caracteres de formato (+, -, espacios, paréntesis)"
                  required
                />
              </div>

              {/* Conditional Address Fields */}
              {cartState.deliveryMethod === "delivery" && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium text-gray-800">Dirección de Entrega</h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Calle *</label>
                      <Input
                        type="text"
                        value={cartState.customerInfo?.address?.street || ""}
                        onChange={(e) => updateAddress({ street: e.target.value })}
                        placeholder="Nombre de la calle"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número *</label>
                      <Input
                        type="text"
                        value={cartState.customerInfo?.address?.number || ""}
                        onChange={(e) => updateAddress({ number: e.target.value })}
                        placeholder="1234"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Piso/Departamento</label>
                    <Input
                      type="text"
                      value={cartState.customerInfo?.address?.floor || ""}
                      onChange={(e) => updateAddress({ floor: e.target.value })}
                      placeholder="Piso 2, Dpto A (opcional)"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad *</label>
                      <Input
                        type="text"
                        value={cartState.customerInfo?.address?.city || ""}
                        onChange={(e) => updateAddress({ city: e.target.value })}
                        placeholder="Buenos Aires"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Provincia *</label>
                      <select
                        value={cartState.customerInfo?.address?.province || ""}
                        onChange={(e) => updateAddress({ province: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar provincia</option>
                        <option value="Buenos Aires">Buenos Aires</option>
                        <option value="CABA">Ciudad Autónoma de Buenos Aires</option>
                        <option value="Catamarca">Catamarca</option>
                        <option value="Chaco">Chaco</option>
                        <option value="Chubut">Chubut</option>
                        <option value="Córdoba">Córdoba</option>
                        <option value="Corrientes">Corrientes</option>
                        <option value="Entre Ríos">Entre Ríos</option>
                        <option value="Formosa">Formosa</option>
                        <option value="Jujuy">Jujuy</option>
                        <option value="La Pampa">La Pampa</option>
                        <option value="La Rioja">La Rioja</option>
                        <option value="Mendoza">Mendoza</option>
                        <option value="Misiones">Misiones</option>
                        <option value="Neuquén">Neuquén</option>
                        <option value="Río Negro">Río Negro</option>
                        <option value="Salta">Salta</option>
                        <option value="San Juan">San Juan</option>
                        <option value="San Luis">San Luis</option>
                        <option value="Santa Cruz">Santa Cruz</option>
                        <option value="Santa Fe">Santa Fe</option>
                        <option value="Santiago del Estero">Santiago del Estero</option>
                        <option value="Tierra del Fuego">Tierra del Fuego</option>
                        <option value="Tucumán">Tucumán</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal *</label>
                    <Input
                      type="text"
                      value={cartState.customerInfo?.address?.postalCode || ""}
                      onChange={(e) => updateAddress({ postalCode: e.target.value })}
                      placeholder="1234"
                      maxLength={4}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Código postal de 4 dígitos</p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                    <p className="text-sm text-yellow-800">
                      📦 <strong>Importante:</strong> Verificá que todos los datos sean correctos para evitar demoras en
                      la entrega.
                    </p>
                  </div>
                </div>
              )}

              {cartState.deliveryMethod === "pickup" && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <h4 className="font-medium text-blue-800 mb-1">Información del Local</h4>
                  <p className="text-sm text-blue-700">
                    📍 Av. Corrientes 1234, CABA
                    <br />🕒 Lunes a Viernes: 9:00 - 18:00
                    <br />🕒 Sábados: 9:00 - 13:00
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={cartState.customerInfo?.notes || ""}
                  onChange={(e) => updateCustomerInfo({ notes: e.target.value })}
                  placeholder="Comentarios sobre tu pedido..."
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal ({cartState.items.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
                <span>${cartState.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="text-blue-600">
                  {cartState.deliveryMethod === "pickup" ? "Gratis (Retiro)" : "A coordinar por WhatsApp"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                ${cartState.total.toLocaleString()}
              </span>
            </div>

            <Button onClick={handleCheckout} className="w-full mt-6" size="lg">
              Finalizar Compra por WhatsApp
            </Button>

            <div className="mt-4 text-sm text-gray-600">
              <p>• El pago se coordina por WhatsApp</p>
              {cartState.deliveryMethod === "pickup" ? (
                <>
                  <p>• Retiro en Av. Corrientes 1234, CABA</p>
                  <p>• Horarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00</p>
                </>
              ) : (
                <>
                  <p>• El envío y su costo se coordinan por WhatsApp</p>
                  <p>• El costo depende de la zona de entrega</p>
                </>
              )}
              <p>• Aceptamos efectivo, transferencia y tarjetas</p>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Modals */}
      {productToRemove && (
        <RemoveFromCartModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={confirmRemoveItem}
          product={{ name: productToRemove.name, color: productToRemove.color || "", size: productToRemove.size || "", image: "" }}
        />
      )}

      <CheckoutErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorConfig.title}
        message={errorConfig.message}
        missingFields={errorConfig.missingFields}
      />

      <LoadingModal isOpen={showLoadingModal} message="Preparando tu pedido..." />

      {/* Success Modal - Renderizado directamente */}
      {showSuccessModal && (() => {
        console.log('🎉 MODAL SE ESTÁ RENDERIZANDO - saleId:', completedSaleId)
        return (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black"
          style={{
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0
          }}
          onClick={() => console.log('🖱️ Click en el backdrop del modal')}
        >
          <div className="relative bg-white rounded-lg shadow-xl p-8 w-full max-w-md mx-4">
            <div className="text-center mb-6">
              <div className="mx-auto mb-4 flex justify-center">
                <div className="h-20 w-20 text-green-500">
                  <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Gracias por tu compra!
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <p className="font-semibold text-lg text-gray-800 text-center">
                Pedido #{completedSaleId || 'CONFIRMADO'} registrado exitosamente
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

            <Button
              onClick={() => {
                console.log('🟢 Botón WhatsApp clickeado')
                handleContinueToWhatsApp()
              }}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
            >
              <span className="mr-2">📱</span>
              Continuar por WhatsApp
            </Button>
          </div>
        </div>
        )
      })()}
    </div>
  )
}
