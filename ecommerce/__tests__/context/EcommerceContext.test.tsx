import { renderHook, act } from '@testing-library/react'
import { EcommerceProvider, useEcommerce } from '@/app/context/EcommerceContext'
import { salesApi } from '@/app/lib/api'
import { ReactNode } from 'react'

// Mock the API
jest.mock('@/app/lib/api', () => ({
  salesApi: {
    create: jest.fn(),
  },
  handleApiError: jest.fn((err) => ({
    message: err.message || 'Error',
    errors: []
  }))
}))

const mockSalesApi = salesApi as jest.Mocked<typeof salesApi>

// Wrapper component for tests
const wrapper = ({ children }: { children: ReactNode }) => (
  <EcommerceProvider>{children}</EcommerceProvider>
)

describe('EcommerceContext', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Cart Management', () => {
    it('initializes with empty cart', () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      expect(result.current.cartState.items).toEqual([])
      expect(result.current.cartState.total).toBe(0)
      expect(result.current.cartState.customerInfo).toBeNull()
      expect(result.current.cartState.deliveryMethod).toBe('pickup')
    })

    it('adds items to cart correctly', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 2,
        productId: 1
      }

      await act(async () => {
        const success = await result.current.addItem(testItem)
        expect(success).toBe(true)
      })

      expect(result.current.cartState.items).toHaveLength(1)
      expect(result.current.cartState.items[0]).toEqual(testItem)
      expect(result.current.cartState.total).toBe(200)
    })

    it('updates quantity of existing items', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      // Add item first
      await act(async () => {
        await result.current.addItem(testItem)
      })

      // Add same item again
      await act(async () => {
        await result.current.addItem(testItem)
      })

      expect(result.current.cartState.items).toHaveLength(1)
      expect(result.current.cartState.items[0].quantity).toBe(2)
      expect(result.current.cartState.total).toBe(200)
    })

    it('handles items with different sizes separately', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const itemSizeM = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        size: 'M',
        productId: 1
      }

      const itemSizeL = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        size: 'L',
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(itemSizeM)
        await result.current.addItem(itemSizeL)
      })

      expect(result.current.cartState.items).toHaveLength(2)
      expect(result.current.cartState.total).toBe(200)
    })

    it('removes items from cart', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      act(() => {
        result.current.removeItem('1')
      })

      expect(result.current.cartState.items).toHaveLength(0)
      expect(result.current.cartState.total).toBe(0)
    })

    it('updates item quantity', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      await act(async () => {
        const success = await result.current.updateQuantity('1', 3)
        expect(success).toBe(true)
      })

      expect(result.current.cartState.items[0].quantity).toBe(3)
      expect(result.current.cartState.total).toBe(300)
    })

    it('removes item when quantity is set to 0', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      await act(async () => {
        const success = await result.current.updateQuantity('1', 0)
        expect(success).toBe(true)
      })

      expect(result.current.cartState.items).toHaveLength(0)
    })

    it('clears cart completely', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      act(() => {
        result.current.clearCart()
      })

      expect(result.current.cartState.items).toHaveLength(0)
      expect(result.current.cartState.total).toBe(0)
      expect(result.current.cartState.customerInfo).toBeNull()
    })
  })

  describe('Customer Information', () => {
    it('sets customer information', () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const customerInfo = {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com'
      }

      act(() => {
        result.current.setCustomerInfo(customerInfo)
      })

      expect(result.current.cartState.customerInfo).toEqual(customerInfo)
    })

    it('sets delivery method', () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      act(() => {
        result.current.setDeliveryMethod('delivery')
      })

      expect(result.current.cartState.deliveryMethod).toBe('delivery')
    })
  })

  describe('Checkout Process', () => {
    it('fails checkout with empty cart', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      await act(async () => {
        const checkoutResult = await result.current.processCheckout()
        expect(checkoutResult.success).toBe(false)
        expect(checkoutResult.error).toBe('El carrito está vacío')
      })
    })

    it('fails checkout without customer info', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      await act(async () => {
        await result.current.addItem(testItem)
      })

      await act(async () => {
        const checkoutResult = await result.current.processCheckout()
        expect(checkoutResult.success).toBe(false)
        expect(checkoutResult.error).toBe('Información del cliente incompleta')
      })
    })

    it('fails checkout with delivery method but incomplete address', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      const customerInfo = {
        name: 'John Doe',
        phone: '+1234567890'
      }

      await act(async () => {
        await result.current.addItem(testItem)
        result.current.setCustomerInfo(customerInfo)
        result.current.setDeliveryMethod('delivery')
      })

      await act(async () => {
        const checkoutResult = await result.current.processCheckout()
        expect(checkoutResult.success).toBe(false)
        expect(checkoutResult.error).toBe('Dirección de entrega incompleta')
      })
    })

    it('successfully processes checkout with valid data', async () => {
      mockSalesApi.create.mockResolvedValue({
        data: { id: 123, sale_id: 123 }
      })

      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      const customerInfo = {
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com'
      }

      await act(async () => {
        await result.current.addItem(testItem)
        result.current.setCustomerInfo(customerInfo)
      })

      await act(async () => {
        const checkoutResult = await result.current.processCheckout()
        expect(checkoutResult.success).toBe(true)
        expect(checkoutResult.saleId).toBe(123)
      })

      // Verify cart is cleared after successful checkout
      expect(result.current.cartState.items).toHaveLength(0)
    })

    it('handles API errors during checkout', async () => {
      mockSalesApi.create.mockRejectedValue(new Error('API Error'))

      const { result } = renderHook(() => useEcommerce(), { wrapper })

      const testItem = {
        id: '1',
        name: 'Test Product',
        price: 100,
        image: 'test.jpg',
        quantity: 1,
        productId: 1
      }

      const customerInfo = {
        name: 'John Doe',
        phone: '+1234567890'
      }

      await act(async () => {
        await result.current.addItem(testItem)
        result.current.setCustomerInfo(customerInfo)
      })

      await act(async () => {
        const checkoutResult = await result.current.processCheckout()
        expect(checkoutResult.success).toBe(false)
        expect(checkoutResult.error).toContain('Error')
      })
    })
  })

  describe('Error Handling', () => {
    it('handles and clears errors', async () => {
      const { result } = renderHook(() => useEcommerce(), { wrapper })

      // Initially no error
      expect(result.current.error).toBeNull()

      // Adding item should clear any previous errors
      await act(async () => {
        await result.current.addItem({
          id: '1',
          name: 'Test Product',
          price: 100,
          image: 'test.jpg',
          quantity: 1,
          productId: 1
        })
      })

      expect(result.current.error).toBeNull()
    })
  })
})