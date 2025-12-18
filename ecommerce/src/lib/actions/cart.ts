'use server'

/**
 * Server Actions for cart operations
 *
 * These actions run on the server and provide:
 * - Real-time stock validation
 * - Secure sale creation
 * - Better error handling
 */

import { revalidatePath } from 'next/cache'
import { apiFetch } from '../api/client'
import type { ApiResponse } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface StockValidationResult {
  available: boolean
  availableQuantity: number
  message?: string
}

export interface SaleItem {
  product_id: number
  quantity: number
  unit_price: number
  size?: string
}

export interface CreateSaleData {
  sale_type: 'ECOMMERCE'
  customer_name: string
  customer_phone: string
  customer_email?: string
  notes?: string
  payment_method: string
  items: SaleItem[]
}

export interface CreateSaleResult {
  success: boolean
  saleId?: number
  saleNumber?: string
  whatsappSaleId?: number
  error?: string
}

// ============================================================================
// STOCK VALIDATION
// ============================================================================

/**
 * Validate product stock availability (Server Action)
 *
 * Checks if a product has sufficient stock before adding to cart.
 * For products with sizes, validates the specific size stock.
 *
 * @param productId - Product ID to validate
 * @param quantity - Quantity requested
 * @param size - Optional size for sized products
 * @returns Stock validation result
 */
export async function validateProductStock(
  productId: number,
  quantity: number,
  size?: string
): Promise<StockValidationResult> {
  try {
    // Fetch product basic info to check if it has sizes
    const productResponse = await apiFetch<any>(
      `/ecommerce/products/${productId}`,
      { cache: 'no-store' } // Always get fresh data for stock validation
    )

    // Handle both response formats (direct product or wrapped in data)
    const product = 'data' in productResponse ? productResponse.data : productResponse

    if (!product) {
      return {
        available: false,
        availableQuantity: 0,
        message: 'Producto no encontrado'
      }
    }

    // If product has sizes, validate size-specific stock
    if (product.has_sizes) {
      if (!size) {
        return {
          available: false,
          availableQuantity: 0,
          message: 'Debe seleccionar un talle'
        }
      }

      // Fetch available sizes with stock
      const sizesResponse = await apiFetch<{ available_sizes: Array<{ size: string; stock: number }> }>(
        `/ecommerce/products/${productId}/sizes`,
        { cache: 'no-store' }
      )

      if (!sizesResponse?.available_sizes) {
        return {
          available: false,
          availableQuantity: 0,
          message: 'No se pudo verificar el stock de talles'
        }
      }

      // Find the requested size
      const sizeStock = sizesResponse.available_sizes.find(s => s.size === size)

      if (!sizeStock) {
        return {
          available: false,
          availableQuantity: 0,
          message: `Talle ${size} no disponible`
        }
      }

      // Check if requested quantity is available
      if (sizeStock.stock < quantity) {
        return {
          available: false,
          availableQuantity: sizeStock.stock,
          message: `Solo hay ${sizeStock.stock} unidades disponibles del talle ${size}`
        }
      }

      return {
        available: true,
        availableQuantity: sizeStock.stock,
        message: 'Stock disponible'
      }
    }

    // Product without sizes - check general stock
    const availableStock = product.stock || 0

    if (availableStock < quantity) {
      return {
        available: false,
        availableQuantity: availableStock,
        message: `Solo hay ${availableStock} unidades disponibles`
      }
    }

    return {
      available: true,
      availableQuantity: availableStock,
      message: 'Stock disponible'
    }

  } catch (error) {
    console.error('[Stock Validation] Error:', error)
    return {
      available: false,
      availableQuantity: 0,
      message: 'Error al verificar stock. Por favor intente nuevamente.'
    }
  }
}

// ============================================================================
// CHECKOUT / SALE CREATION
// ============================================================================

/**
 * Create e-commerce sale (Server Action)
 *
 * Creates a sale in the backend POS system. The sale is created with:
 * - Type: ECOMMERCE
 * - Status: PENDING (requires coordination via WhatsApp)
 * - Payment: Coordinated via WhatsApp
 *
 * @param saleData - Sale data including items and customer info
 * @returns Sale creation result with ID or error
 */
export async function createEcommerceSale(
  saleData: CreateSaleData
): Promise<CreateSaleResult> {
  try {
    // Validate sale data
    if (!saleData.items || saleData.items.length === 0) {
      return {
        success: false,
        error: 'El carrito está vacío'
      }
    }

    if (!saleData.customer_name || !saleData.customer_phone) {
      return {
        success: false,
        error: 'Información del cliente incompleta'
      }
    }

    // Log the request for debugging
    console.log('[Create Sale] Request data:', JSON.stringify(saleData, null, 2))

    // Create sale in backend using direct fetch to get proper error handling
    // Hardcoded for Railway production deployment
    const response = await fetch('https://backend-production-c20a.up.railway.app/ecommerce/sales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(saleData),
      cache: 'no-store',
      signal: AbortSignal.timeout(30000) // 30s timeout for Railway cold starts
    })

    // Parse response
    const data = await response.json()

    // Check if sale was created successfully
    if (response.ok && data && ('id' in data || 'sale_id' in data)) {
      // Revalidate products to update stock
      revalidatePath('/productos')
      revalidatePath('/productos/[id]', 'page')

      return {
        success: true,
        saleId: data.id || data.sale_id,
        saleNumber: data.sale_number,
        whatsappSaleId: data.whatsapp_sale_id
      }
    }

    // Handle error response
    console.error('[Create Sale] Backend error:', {
      status: response.status,
      statusText: response.statusText,
      data: JSON.stringify(data, null, 2)
    })

    // Parse Pydantic validation errors
    let errorMessage = `Error ${response.status}: ${response.statusText}`

    if (data.detail) {
      // Pydantic returns detail as array of validation errors or as string
      if (Array.isArray(data.detail)) {
        // Extract error messages from Pydantic validation errors
        const errors = data.detail.map((err: any) => {
          const field = err.loc ? err.loc.join(' > ') : 'campo desconocido'
          return `${field}: ${err.msg || err.message || 'error de validación'}`
        })
        errorMessage = errors.join('\n')
      } else if (typeof data.detail === 'string') {
        errorMessage = data.detail
      }
    } else if (data.message) {
      errorMessage = data.message
    }

    return {
      success: false,
      error: errorMessage
    }

  } catch (error: any) {
    console.error('[Create Sale] Unexpected error:', error)

    return {
      success: false,
      error: error.message || 'Error inesperado al procesar la compra'
    }
  }
}

// ============================================================================
// HELPER ACTIONS
// ============================================================================

/**
 * Validate multiple items in cart (Server Action)
 *
 * Validates stock for all items in the cart before checkout
 */
export async function validateCartItems(
  items: Array<{ productId: number; quantity: number; size?: string }>
): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  for (const item of items) {
    const result = await validateProductStock(item.productId, item.quantity, item.size)

    if (!result.available) {
      errors.push(`${result.message}`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
