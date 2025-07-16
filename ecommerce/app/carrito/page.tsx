"use client"

import { useState } from "react"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react"
import { useEcommerce } from "../context/EcommerceContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import RemoveFromCartModal from "../components/modals/RemoveFromCartModal"
import CheckoutErrorModal from "../components/modals/CheckoutErrorModal"
import LoadingModal from "../components/modals/LoadingModal"
import { whatsappConfigApi, WhatsAppConfig } from "../lib/api"

export default function CartPage() {
  const { 
    cartState, 
    updateQuantity, 
    removeItem, 
    setCustomerInfo, 
    setDeliveryMethod, 
    processCheckout,
    loading,
    error 
  } = useEcommerce()

  const [showRemoveModal, setShowRemoveModal] = useState(false)
  const [productToRemove, setProductToRemove] = useState<any>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorConfig, setErrorConfig] = useState({ title: "", message: "", missingFields: [] })
  const [showLoadingModal, setShowLoadingModal] = useState(false)

  // Helper function to update customer info
  const updateCustomerInfo = (updates: any) => {
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
  const updateAddress = (addressUpdates: any) => {
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

  const handleUpdateQuantity = async (id: string, newQuantity: number, size?: string, color?: string) => {
    if (newQuantity <= 0) {
      removeItem(id, size, color)
    } else {
      await updateQuantity(id, newQuantity, size, color)
    }
  }

  const handleRemoveClick = (item: any) => {
    setProductToRemove(item)
    setShowRemoveModal(true)
  }

  const confirmRemoveItem = () => {
    if (productToRemove) {
      removeItem(productToRemove.id, productToRemove.size, productToRemove.color)
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

    try {
      // Process checkout through EcommerceContext (creates sale in backend)
      const result = await processCheckout()
      
      setShowLoadingModal(false)

      if (result.success) {
        // Generate WhatsApp message after successful backend sale
        await generateWhatsAppMessage(result.saleId)
      } else {
        setErrorConfig({
          title: "Error en el Checkout",
          message: result.error || "Hubo un problema al procesar tu pedido. Intenta nuevamente.",
          missingFields: [],
        })
        setShowErrorModal(true)
      }
    } catch (error) {
      setShowLoadingModal(false)
      setErrorConfig({
        title: "Error de Conexión",
        message: "No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.",
        missingFields: [],
      })
      setShowErrorModal(true)
    }
  }

  const generateWhatsAppMessage = async (saleId?: number) => {
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

      const orderDetails = cartState.items
        .map(
          (item) =>
            `• ${item.name} (${item.color}, Talle: ${item.size}) - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`,
        )
        .join("\n")

      const deliveryInfo =
        cartState.deliveryMethod === "pickup"
          ? "*RETIRO EN LOCAL*\nAv. Corrientes 1234, CABA\nHorarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
          : `*ENVÍO A DOMICILIO*\n${cartState.customerInfo?.address?.street} ${cartState.customerInfo?.address?.number}${cartState.customerInfo?.address?.floor ? `, ${cartState.customerInfo?.address?.floor}` : ""}\n${cartState.customerInfo?.address?.city}, ${cartState.customerInfo?.address?.province}\nCP: ${cartState.customerInfo?.address?.postalCode}`

      const shippingCost = cartState.deliveryMethod === "pickup" ? 0 : cartState.total >= 10000 ? 0 : 1500
      const finalTotal = cartState.total + shippingCost

      const message = `¡Hola! Quiero realizar el siguiente pedido:

*PEDIDO #${saleId || 'CONFIRMADO'}* ✅

*PRODUCTOS:*
${orderDetails}

*MÉTODO DE ENTREGA:*
${deliveryInfo}

*RESUMEN:*
Subtotal: $${cartState.total.toLocaleString()}
${cartState.deliveryMethod === "delivery" ? `Envío: ${shippingCost === 0 ? "Gratis" : "$" + shippingCost.toLocaleString()}` : "Envío: Gratis (Retiro en local)"}
*TOTAL: $${finalTotal.toLocaleString()}*

*DATOS DEL CLIENTE:*
Nombre: ${cartState.customerInfo?.name}
Teléfono: ${cartState.customerInfo?.phone}

${cartState.customerInfo?.notes ? `*NOTAS:*\n${cartState.customerInfo?.notes}` : ""}

El pedido ya está registrado en el sistema ✅
¡Gracias!`

      const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    } catch (error) {
      console.error("Error fetching WhatsApp config:", error)
      // Fallback to hardcoded number if API fails
      const orderDetails = cartState.items
        .map(
          (item) =>
            `• ${item.name} (${item.color}, Talle: ${item.size}) - Cantidad: ${item.quantity} - $${(item.price * item.quantity).toLocaleString()}`,
        )
        .join("\n")

      const deliveryInfo =
        cartState.deliveryMethod === "pickup"
          ? "*RETIRO EN LOCAL*\nAv. Corrientes 1234, CABA\nHorarios: Lun-Vie 9:00-18:00, Sáb 9:00-13:00"
          : `*ENVÍO A DOMICILIO*\n${cartState.customerInfo?.address?.street} ${cartState.customerInfo?.address?.number}${cartState.customerInfo?.address?.floor ? `, ${cartState.customerInfo?.address?.floor}` : ""}\n${cartState.customerInfo?.address?.city}, ${cartState.customerInfo?.address?.province}\nCP: ${cartState.customerInfo?.address?.postalCode}`

      const shippingCost = cartState.deliveryMethod === "pickup" ? 0 : cartState.total >= 10000 ? 0 : 1500
      const finalTotal = cartState.total + shippingCost

      const message = `¡Hola! Quiero realizar el siguiente pedido:

*PEDIDO #${saleId || 'CONFIRMADO'}* ✅

*PRODUCTOS:*
${orderDetails}

*MÉTODO DE ENTREGA:*
${deliveryInfo}

*RESUMEN:*
Subtotal: $${cartState.total.toLocaleString()}
${cartState.deliveryMethod === "delivery" ? `Envío: ${shippingCost === 0 ? "Gratis" : "$" + shippingCost.toLocaleString()}` : "Envío: Gratis (Retiro en local)"}
*TOTAL: $${finalTotal.toLocaleString()}*

*DATOS DEL CLIENTE:*
Nombre: ${cartState.customerInfo?.name}
Teléfono: ${cartState.customerInfo?.phone}

${cartState.customerInfo?.notes ? `*NOTAS:*\n${cartState.customerInfo?.notes}` : ""}

El pedido ya está registrado en el sistema ✅
¡Gracias!`

      const whatsappUrl = `https://wa.me/5491123456789?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, "_blank")
    }
  }

  if (cartState.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar tu compra</p>
          <Button asChild>
            <a href="/productos">Explorar Productos</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cartState.items.map((item) => (
            <div key={`${item.id}-${item.size}-${item.color}`} className="bg-white rounded-lg shadow-md p-6">
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
                  <p className="text-gray-600">Color: {item.color}</p>
                  <p className="text-gray-600">Talle: {item.size}</p>
                  <p className="text-lg font-bold">${item.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.size, item.color)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{item.quantity}</span>
                  <Button variant="outline" size="sm" onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.size, item.color)}>
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
                      {cartState.total >= 10000 ? "Gratis" : "$1.500"} - Recibí tu pedido en tu casa
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
                  onChange={(e) => updateCustomerInfo({ phone: e.target.value })}
                  placeholder="Tu número de teléfono"
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
                <span className="text-green-600">
                  {cartState.deliveryMethod === "pickup" ? "Gratis (Retiro)" : cartState.total >= 10000 ? "Gratis" : "$1.500"}
                </span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>
                ${(cartState.total + (cartState.deliveryMethod === "pickup" ? 0 : cartState.total >= 10000 ? 0 : 1500)).toLocaleString()}
              </span>
            </div>

            {cartState.deliveryMethod === "delivery" && cartState.total < 10000 && (
              <p className="text-sm text-gray-600 mt-2">
                Agrega ${(10000 - cartState.total).toLocaleString()} más para envío gratis
              </p>
            )}

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
                <p>• El envío se organiza después de confirmar el pedido</p>
              )}
              <p>• Aceptamos efectivo, transferencia y tarjetas</p>
            </div>
          </div>
        </div>
      </div>
      {/* Modals */}
      <RemoveFromCartModal
        isOpen={showRemoveModal}
        onClose={() => setShowRemoveModal(false)}
        onConfirm={confirmRemoveItem}
        product={productToRemove || { name: "", color: "", size: "", image: "" }}
      />

      <CheckoutErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorConfig.title}
        message={errorConfig.message}
        missingFields={errorConfig.missingFields}
      />

      <LoadingModal isOpen={showLoadingModal} message="Preparando tu pedido..." />
    </div>
  )
}
