"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { salesApi, handleApiError } from "../lib/api"
// import { validateStock } from "../lib/data-service" // Removed - not needed for e-commerce

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  size?: string
  color?: string
  productId: number // ID numérico para el backend
}

interface CustomerInfo {
  name: string
  phone: string
  email?: string
  address?: {
    street: string
    number: string
    floor?: string
    city: string
    province: string
    postalCode: string
  }
  notes?: string
}

interface CartState {
  items: CartItem[]
  total: number
  customerInfo: CustomerInfo | null
  deliveryMethod: 'pickup' | 'delivery'
}

interface EcommerceContextValue {
  // Cart state
  cartState: CartState
  
  // Cart actions
  addItem: (item: CartItem) => Promise<boolean>
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, quantity: number, size?: string, color?: string) => Promise<boolean>
  clearCart: () => void
  
  // Customer info
  setCustomerInfo: (info: CustomerInfo) => void
  setDeliveryMethod: (method: 'pickup' | 'delivery') => void
  
  // Checkout
  processCheckout: () => Promise<{ success: boolean; saleId?: number; error?: string }>
  
  // Loading states
  loading: boolean
  error: string | null
}

const EcommerceContext = createContext<EcommerceContextValue | null>(null)

const initialState: CartState = {
  items: [],
  total: 0,
  customerInfo: null,
  deliveryMethod: 'pickup'
}

export function EcommerceProvider({ children }: { children: ReactNode }) {
  const [cartState, setCartState] = useState<CartState>(initialState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Utility function to calculate total
  const calculateTotal = (items: CartItem[]): number => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  // Utility function to find item
  const findItem = (items: CartItem[], id: string, size?: string, color?: string) => {
    return items.find(item => 
      item.id === id && 
      item.size === size && 
      item.color === color
    )
  }

  const addItem = useCallback(async (newItem: CartItem): Promise<boolean> => {
    try {
      setError(null)
      
      // Skip stock validation for e-commerce - will be validated at checkout
      // Stock validation requires authentication which e-commerce doesn't have

      setCartState(prev => {
        const existingItem = findItem(prev.items, newItem.id, newItem.size, newItem.color)
        
        let newItems: CartItem[]
        
        if (existingItem) {
          // Update quantity of existing item
          newItems = prev.items.map(item =>
            findItem([item], newItem.id, newItem.size, newItem.color)
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          // Add new item
          newItems = [...prev.items, newItem]
        }

        return {
          ...prev,
          items: newItems,
          total: calculateTotal(newItems)
        }
      })

      return true
    } catch (err) {
      console.error('Error adding item to cart:', err)
      setError('Error al agregar producto al carrito')
      return false
    }
  }, [])

  const removeItem = useCallback((id: string, size?: string, color?: string) => {
    setCartState(prev => {
      const newItems = prev.items.filter(item => 
        !(item.id === id && item.size === size && item.color === color)
      )
      
      return {
        ...prev,
        items: newItems,
        total: calculateTotal(newItems)
      }
    })
  }, [])

  const updateQuantity = useCallback(async (id: string, quantity: number, size?: string, color?: string): Promise<boolean> => {
    try {
      setError(null)
      
      if (quantity <= 0) {
        removeItem(id, size, color)
        return true
      }

      // Find the item to validate stock
      const item = findItem(cartState.items, id, size, color)
      if (!item) return false

      // Skip stock validation for e-commerce - will be validated at checkout
      // Stock validation requires authentication which e-commerce doesn't have

      setCartState(prev => {
        const newItems = prev.items.map(item =>
          findItem([item], id, size, color)
            ? { ...item, quantity }
            : item
        )
        
        return {
          ...prev,
          items: newItems,
          total: calculateTotal(newItems)
        }
      })

      return true
    } catch (err) {
      console.error('Error updating quantity:', err)
      setError('Error al actualizar cantidad')
      return false
    }
  }, [cartState.items, removeItem])

  const clearCart = useCallback(() => {
    setCartState(initialState)
    setError(null)
  }, [])

  const setCustomerInfo = useCallback((info: CustomerInfo) => {
    setCartState(prev => ({ ...prev, customerInfo: info }))
  }, [])

  const setDeliveryMethod = useCallback((method: 'pickup' | 'delivery') => {
    setCartState(prev => ({ ...prev, deliveryMethod: method }))
  }, [])

  const processCheckout = useCallback(async (): Promise<{ success: boolean; saleId?: number; error?: string }> => {
    try {
      setLoading(true)
      setError(null)

      // Validate required data
      if (cartState.items.length === 0) {
        return { success: false, error: 'El carrito está vacío' }
      }

      if (!cartState.customerInfo?.name || !cartState.customerInfo?.phone) {
        return { success: false, error: 'Información del cliente incompleta' }
      }

      // Validate delivery address if needed
      if (cartState.deliveryMethod === 'delivery') {
        const { address } = cartState.customerInfo
        if (!address?.street || !address?.number || !address?.city || !address?.province || !address?.postalCode) {
          return { success: false, error: 'Dirección de entrega incompleta' }
        }
      }

      // Prepare delivery notes
      let deliveryNotes = `Entrega: ${cartState.deliveryMethod === 'pickup' ? 'Retiro en local' : 'Domicilio'}`
      if (cartState.deliveryMethod === 'delivery' && cartState.customerInfo.address) {
        const addr = cartState.customerInfo.address
        deliveryNotes += `\nDirección: ${addr.street} ${addr.number}${addr.floor ? `, Piso ${addr.floor}` : ''}, ${addr.city}, ${addr.province}, CP: ${addr.postalCode}`
      }
      if (cartState.customerInfo.notes) {
        deliveryNotes += `\nNotas: ${cartState.customerInfo.notes}`
      }

      // Prepare sale data
      const saleData = {
        sale_type: 'ECOMMERCE' as const,
        customer_name: cartState.customerInfo.name,
        customer_phone: cartState.customerInfo.phone,
        notes: deliveryNotes,
        payment_method: 'WHATSAPP', // Se coordina por WhatsApp
        items: cartState.items.map(item => ({
          product_id: item.productId || parseInt(item.id), // Fallback to string ID converted to number
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size || undefined
        }))
      }

      // Log the sale data for debugging
      console.log('Sending sale data:', JSON.stringify(saleData, null, 2))
      
      // Validate sale data before sending
      console.log('Sale data validation:')
      console.log('- sale_type:', saleData.sale_type, typeof saleData.sale_type)
      console.log('- payment_method:', saleData.payment_method, typeof saleData.payment_method)
      console.log('- customer_name:', saleData.customer_name, typeof saleData.customer_name)
      console.log('- items count:', saleData.items.length)
      
      saleData.items.forEach((item, index) => {
        console.log(`- item ${index}:`, {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          size: item.size
        })
      })
      
      // Create sale in backend
      console.log('Making API call to /ecommerce/sales with:', saleData)
      const response = await salesApi.create(saleData)
      console.log('API Response:', response)
      
      if (response.data) {
        // Clear cart on success
        clearCart()
        
        return { 
          success: true, 
          saleId: response.data.id || response.data.sale_id 
        }
      }

      return { success: false, error: 'Error al procesar la venta' }

    } catch (err) {
      console.error('Error processing checkout:', err)
      console.error('Error response:', err.response)
      console.error('Error status:', err.response?.status)
      console.error('Error data:', err.response?.data)
      console.error('Error message:', err.message)
      const errorInfo = handleApiError(err)
      
      // Combine main error message with validation errors
      let errorMessage = errorInfo.message || 'Error al procesar la compra'
      if (errorInfo.errors && errorInfo.errors.length > 0) {
        errorMessage += '\n\nDetalles:\n' + errorInfo.errors.join('\n')
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      setLoading(false)
    }
  }, [cartState, clearCart])

  const contextValue: EcommerceContextValue = {
    cartState,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    setCustomerInfo,
    setDeliveryMethod,
    processCheckout,
    loading,
    error
  }

  return (
    <EcommerceContext.Provider value={contextValue}>
      {children}
    </EcommerceContext.Provider>
  )
}

export function useEcommerce() {
  const context = useContext(EcommerceContext)
  if (!context) {
    throw new Error("useEcommerce must be used within an EcommerceProvider")
  }
  return context
}

// Legacy compatibility with existing CartContext
export function useCart() {
  const { cartState, addItem, removeItem, updateQuantity, clearCart } = useEcommerce()
  
  return {
    state: cartState,
    dispatch: (action: any) => {
      switch (action.type) {
        case 'ADD_ITEM':
          addItem(action.payload)
          break
        case 'REMOVE_ITEM':
          removeItem(action.payload)
          break
        case 'UPDATE_QUANTITY':
          updateQuantity(action.payload.id, action.payload.quantity)
          break
        case 'CLEAR_CART':
          clearCart()
          break
      }
    }
  }
}