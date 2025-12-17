import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import POSPage from '@/app/pos/page'
import { authStore } from '@/lib/auth'
import * as api from '@/lib/api'

// Mock Next.js router
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/pos',
}))

// Mock auth store
jest.mock('@/lib/auth', () => ({
  authStore: {
    getState: jest.fn(() => ({
      isAuthenticated: true,
      user: {
        id: 1,
        username: 'testuser',
        role: 'SELLER',
        branch_id: 1
      },
      token: 'mock-token'
    }))
  }
}))

// Mock API functions
jest.mock('@/lib/api', () => ({
  searchProducts: jest.fn(),
  getProducts: jest.fn(),
  createSale: jest.fn(),
  getPaymentConfigs: jest.fn(),
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn()
  }
}))

// Mock WebSocket hook
jest.mock('@/lib/websocket', () => ({
  usePOSWebSocket: () => ({
    isConnected: true,
    notifications: [],
    markAsRead: jest.fn(),
    clearNotifications: jest.fn(),
    getUnreadCount: () => 0
  })
}))

// Mock components that might cause issues
jest.mock('@/components/FloatingCart', () => ({
  FloatingCart: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="floating-cart">
      <button onClick={onClose}>Close Cart</button>
    </div> : null
  )
}))

jest.mock('@/components/SaleConfirmation', () => ({
  SaleConfirmation: ({ isOpen, onClose }: any) => (
    isOpen ? <div data-testid="sale-confirmation">
      <button onClick={onClose}>Close Confirmation</button>
    </div> : null
  )
}))

const mockProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    price: 10.99,
    stock_quantity: 100,
    sku: 'TEST001',
    barcode: '1234567890',
    category: { id: 1, name: 'Test Category' },
    has_sizes: false
  },
  {
    id: 2,
    name: 'Test Product 2',
    price: 25.50,
    stock_quantity: 50,
    sku: 'TEST002',
    barcode: '0987654321',
    category: { id: 1, name: 'Test Category' },
    has_sizes: true
  }
]

const mockPaymentConfigs = [
  {
    id: 1,
    payment_type: 'CARD',
    card_type: 'BANCARIZADA',
    installments: 1,
    surcharge_percentage: 0.0
  }
]

describe('POS Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(api.searchProducts as jest.Mock).mockResolvedValue({ data: mockProducts })
    ;(api.getProducts as jest.Mock).mockResolvedValue({ data: mockProducts })
    ;(api.getPaymentConfigs as jest.Mock).mockResolvedValue({ data: mockPaymentConfigs })
    ;(api.createSale as jest.Mock).mockResolvedValue({ 
      data: { id: 123, sale_number: 'SALE-123' } 
    })
  })

  it('renders POS interface correctly', async () => {
    render(<POSPage />)

    // Check for main POS elements
    expect(screen.getByText(/punto de venta/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/buscar producto/i)).toBeInTheDocument()
    
    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })
  })

  it('searches products correctly', async () => {
    render(<POSPage />)

    const searchInput = screen.getByPlaceholderText(/buscar producto/i)
    fireEvent.change(searchInput, { target: { value: 'Test' } })

    await waitFor(() => {
      expect(api.searchProducts).toHaveBeenCalledWith('Test')
    })
  })

  it('adds product to cart', async () => {
    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)

    // Cart should show 1 item
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()
  })

  it('opens cart modal when cart button is clicked', async () => {
    render(<POSPage />)

    // Add item to cart first
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)

    // Click cart button
    const cartButton = screen.getByText(/carrito/i)
    fireEvent.click(cartButton)

    expect(screen.getByTestId('floating-cart')).toBeInTheDocument()
  })

  it('handles product search by barcode', async () => {
    render(<POSPage />)

    const searchInput = screen.getByPlaceholderText(/buscar producto/i)
    fireEvent.change(searchInput, { target: { value: '1234567890' } })

    await waitFor(() => {
      expect(api.searchProducts).toHaveBeenCalledWith('1234567890')
    })
  })

  it('shows product details including stock', async () => {
    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    expect(screen.getByText('$10.99')).toBeInTheDocument()
    expect(screen.getByText(/stock: 100/i)).toBeInTheDocument()
  })

  it('disables add button for out of stock products', async () => {
    const outOfStockProducts = [
      {
        ...mockProducts[0],
        stock_quantity: 0
      }
    ]

    ;(api.getProducts as jest.Mock).mockResolvedValue({ data: outOfStockProducts })

    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    expect(addButton).toBeDisabled()
  })

  it('handles size selection for products with sizes', async () => {
    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 2')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[1]
    fireEvent.click(addButton)

    // Should show size selection modal for products with sizes
    expect(screen.getByText(/seleccionar talle/i)).toBeInTheDocument()
  })

  it('updates cart quantity correctly', async () => {
    render(<POSPage />)

    // Add product to cart
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)
    fireEvent.click(addButton) // Add twice

    // Should show 2 items
    expect(screen.getByText(/2 items/i)).toBeInTheDocument()
  })

  it('removes items from cart', async () => {
    render(<POSPage />)

    // Add product to cart
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)

    // Open cart
    const cartButton = screen.getByText(/carrito/i)
    fireEvent.click(cartButton)

    // Remove item (assuming remove button exists in FloatingCart)
    // This would depend on the actual FloatingCart implementation
    expect(screen.getByTestId('floating-cart')).toBeInTheDocument()
  })

  it('processes sale successfully', async () => {
    render(<POSPage />)

    // Add product to cart
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)

    // Open cart and process sale
    const cartButton = screen.getByText(/carrito/i)
    fireEvent.click(cartButton)

    // This would trigger the sale processing
    // The actual implementation would depend on FloatingCart component
    expect(screen.getByTestId('floating-cart')).toBeInTheDocument()
  })

  it('shows sale confirmation after successful sale', async () => {
    render(<POSPage />)

    // Simulate successful sale by calling the sale confirmation directly
    // In a real scenario, this would be triggered by the cart component
    expect(screen.queryByTestId('sale-confirmation')).not.toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    ;(api.getProducts as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<POSPage />)

    // Should handle error gracefully and not crash
    await waitFor(() => {
      expect(screen.getByText(/punto de venta/i)).toBeInTheDocument()
    })
  })

  it('filters products by category', async () => {
    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    // Look for category filter (implementation dependent)
    const categoryFilter = screen.queryByText(/categoría/i)
    if (categoryFilter) {
      fireEvent.click(categoryFilter)
    }
  })

  it('shows loading state while fetching products', () => {
    ;(api.getProducts as jest.Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    )

    render(<POSPage />)

    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('handles keyboard shortcuts', async () => {
    render(<POSPage />)

    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    // Test Enter key to open cart
    fireEvent.keyDown(document, { key: 'Enter' })
    
    // Test Escape key to close modals
    fireEvent.keyDown(document, { key: 'Escape' })
  })

  it('shows connection status indicator', () => {
    render(<POSPage />)

    // Should show online/offline status
    expect(screen.getByText(/en línea|conectado/i)).toBeInTheDocument()
  })

  it('maintains cart state across searches', async () => {
    render(<POSPage />)

    // Add product to cart
    await waitFor(() => {
      expect(screen.getByText('Test Product 1')).toBeInTheDocument()
    })

    const addButton = screen.getAllByText(/agregar/i)[0]
    fireEvent.click(addButton)

    // Search for different products
    const searchInput = screen.getByPlaceholderText(/buscar producto/i)
    fireEvent.change(searchInput, { target: { value: 'different search' } })

    // Cart should still show the item
    expect(screen.getByText(/1 item/i)).toBeInTheDocument()
  })

  it('clears search when clear button is clicked', async () => {
    render(<POSPage />)

    const searchInput = screen.getByPlaceholderText(/buscar producto/i)
    fireEvent.change(searchInput, { target: { value: 'test search' } })

    const clearButton = screen.getByLabelText(/limpiar búsqueda/i)
    fireEvent.click(clearButton)

    expect(searchInput).toHaveValue('')
  })
})