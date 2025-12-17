import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { FloatingCart } from '@/components/FloatingCart'
import { authStore } from '@/lib/auth'

// Mock the auth store
jest.mock('@/lib/auth', () => ({
  authStore: {
    getState: jest.fn(() => ({
      user: {
        id: 1,
        username: 'testuser',
        role: 'SELLER',
        branch_id: 1
      }
    }))
  }
}))

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    loading: jest.fn()
  }
}))

// Mock API
jest.mock('@/lib/api', () => ({
  createSale: jest.fn(),
  getPaymentConfigs: jest.fn(() => Promise.resolve({ data: [] }))
}))

const mockCartItem = {
  id: 1,
  name: 'Test Product',
  price: 10.99,
  quantity: 2,
  size: null,
  image: 'test-image.jpg'
}

describe('FloatingCart', () => {
  const defaultProps = {
    isOpen: true,
    cart: [mockCartItem],
    customer: {
      name: 'Test Customer',
      phone: '+1234567890',
      email: 'test@example.com'
    },
    onClose: jest.fn(),
    onUpdateQuantity: jest.fn(),
    onRemoveItem: jest.fn(),
    onClearCart: jest.fn(),
    onCustomerUpdate: jest.fn(),
    onProcessSale: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders cart items correctly', () => {
    render(<FloatingCart {...defaultProps} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$10.99')).toBeInTheDocument()
    expect(screen.getByDisplayValue('2')).toBeInTheDocument()
  })

  it('calculates total correctly', () => {
    render(<FloatingCart {...defaultProps} />)

    // 2 items × $10.99 = $21.98
    expect(screen.getByText('$21.98')).toBeInTheDocument()
  })

  it('handles quantity updates', async () => {
    render(<FloatingCart {...defaultProps} />)

    const quantityInput = screen.getByDisplayValue('2')
    fireEvent.change(quantityInput, { target: { value: '3' } })

    await waitFor(() => {
      expect(defaultProps.onUpdateQuantity).toHaveBeenCalledWith(1, 3, null)
    })
  })

  it('handles item removal', () => {
    render(<FloatingCart {...defaultProps} />)

    const removeButton = screen.getByLabelText(/eliminar/i)
    fireEvent.click(removeButton)

    expect(defaultProps.onRemoveItem).toHaveBeenCalledWith(1, null)
  })

  it('shows customer information form', () => {
    render(<FloatingCart {...defaultProps} />)

    expect(screen.getByDisplayValue('Test Customer')).toBeInTheDocument()
    expect(screen.getByDisplayValue('+1234567890')).toBeInTheDocument()
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument()
  })

  it('handles customer information updates', () => {
    render(<FloatingCart {...defaultProps} />)

    const nameInput = screen.getByDisplayValue('Test Customer')
    fireEvent.change(nameInput, { target: { value: 'Updated Customer' } })

    expect(defaultProps.onCustomerUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Updated Customer'
      })
    )
  })

  it('shows payment method selection', () => {
    render(<FloatingCart {...defaultProps} />)

    expect(screen.getByText('Efectivo')).toBeInTheDocument()
    expect(screen.getByText('Tarjeta')).toBeInTheDocument()
    expect(screen.getByText('Transferencia')).toBeInTheDocument()
  })

  it('handles payment method selection', () => {
    render(<FloatingCart {...defaultProps} />)

    const cardButton = screen.getByText('Tarjeta')
    fireEvent.click(cardButton)

    // Should show card type options
    expect(screen.getByText('Bancarizada')).toBeInTheDocument()
  })

  it('processes sale when all data is valid', async () => {
    render(<FloatingCart {...defaultProps} />)

    const processButton = screen.getByText(/procesar venta/i)
    fireEvent.click(processButton)

    await waitFor(() => {
      expect(defaultProps.onProcessSale).toHaveBeenCalled()
    })
  })

  it('shows empty cart message when cart is empty', () => {
    render(<FloatingCart {...defaultProps} cart={[]} />)

    expect(screen.getByText(/carrito vacío/i)).toBeInTheDocument()
  })

  it('closes when close button is clicked', () => {
    render(<FloatingCart {...defaultProps} />)

    const closeButton = screen.getByLabelText(/cerrar/i)
    fireEvent.click(closeButton)

    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('handles keyboard navigation', () => {
    render(<FloatingCart {...defaultProps} />)

    // Test ESC key to close
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(defaultProps.onClose).toHaveBeenCalled()
  })

  it('shows size information for products with sizes', () => {
    const cartWithSizes = [{
      ...mockCartItem,
      size: 'M'
    }]

    render(<FloatingCart {...defaultProps} cart={cartWithSizes} />)

    expect(screen.getByText('Talle: M')).toBeInTheDocument()
  })

  it('calculates tax correctly', () => {
    render(<FloatingCart {...defaultProps} />)

    // Should show tax calculation (21% default)
    const subtotal = 21.98
    const expectedTax = subtotal * 0.21
    
    expect(screen.getByText(`$${expectedTax.toFixed(2)}`)).toBeInTheDocument()
  })

  it('disables process button when cart is empty', () => {
    render(<FloatingCart {...defaultProps} cart={[]} />)

    const processButton = screen.getByText(/procesar venta/i)
    expect(processButton).toBeDisabled()
  })

  it('disables process button when customer info is incomplete', () => {
    const incompleteCustomer = {
      name: '',
      phone: '',
      email: ''
    }

    render(<FloatingCart {...defaultProps} customer={incompleteCustomer} />)

    const processButton = screen.getByText(/procesar venta/i)
    expect(processButton).toBeDisabled()
  })

  it('shows loading state during sale processing', async () => {
    const props = {
      ...defaultProps,
      onProcessSale: jest.fn(() => Promise.resolve({ success: true }))
    }

    render(<FloatingCart {...props} />)

    const processButton = screen.getByText(/procesar venta/i)
    fireEvent.click(processButton)

    // Should show loading state
    expect(screen.getByText(/procesando/i)).toBeInTheDocument()
  })

  it('handles sale processing errors', async () => {
    const props = {
      ...defaultProps,
      onProcessSale: jest.fn(() => Promise.reject(new Error('Sale failed')))
    }

    render(<FloatingCart {...props} />)

    const processButton = screen.getByText(/procesar venta/i)
    fireEvent.click(processButton)

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })

  it('clears cart after successful sale', async () => {
    const props = {
      ...defaultProps,
      onProcessSale: jest.fn(() => Promise.resolve({ success: true }))
    }

    render(<FloatingCart {...props} />)

    const processButton = screen.getByText(/procesar venta/i)
    fireEvent.click(processButton)

    await waitFor(() => {
      expect(defaultProps.onClearCart).toHaveBeenCalled()
    })
  })
})