import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SizeStockModal from '@/components/SizeStockModal'

// Mock fetch
global.fetch = jest.fn()
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>

// Mock the heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <div data-testid="x-mark-icon">X Mark Icon</div>,
  PlusIcon: () => <div data-testid="plus-icon">Plus Icon</div>,
  MinusIcon: () => <div data-testid="minus-icon">Minus Icon</div>,
  CheckIcon: () => <div data-testid="check-icon">Check Icon</div>,
}))

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(() => 'test-token'),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock alert
global.alert = jest.fn()

describe('SizeStockModal', () => {
  const clothingProduct = {
    id: 1,
    name: 'Remera Test',
    category: {
      name: 'Indumentaria'
    }
  }

  const footwearProduct = {
    id: 2,
    name: 'Zapatillas Test',
    category: {
      name: 'Calzado'
    }
  }

  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    product: clothingProduct,
    onUpdateSuccess: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedFetch.mockClear()
    localStorageMock.getItem.mockReturnValue('test-token')
  })

  it('renders modal when open', () => {
    render(<SizeStockModal {...defaultProps} />)
    
    expect(screen.getByText('Gestión de Stock por Talles')).toBeInTheDocument()
    expect(screen.getByText('Remera Test - Indumentaria')).toBeInTheDocument()
  })

  it('does not render modal when closed', () => {
    render(<SizeStockModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Gestión de Stock por Talles')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<SizeStockModal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByTestId('x-mark-icon').parentElement!
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows loading state initially', () => {
    mockedFetch.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<SizeStockModal {...defaultProps} />)
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('displays clothing sizes (XS to XXL)', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [
          { size: 'S', stock_quantity: 10 },
          { size: 'M', stock_quantity: 15 }
        ]
      })
    })

    render(<SizeStockModal {...defaultProps} product={clothingProduct} />)
    
    await waitFor(() => {
      expect(screen.getByText('S')).toBeInTheDocument()
      expect(screen.getByText('M')).toBeInTheDocument()
      expect(screen.getByText('L')).toBeInTheDocument()
      expect(screen.getByText('XL')).toBeInTheDocument()
      expect(screen.getByText('XXL')).toBeInTheDocument()
    })
  })

  it('displays footwear sizes (35 to 45)', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [
          { size: '38', stock_quantity: 5 },
          { size: '39', stock_quantity: 3 }
        ]
      })
    })

    render(<SizeStockModal {...defaultProps} product={footwearProduct} />)
    
    await waitFor(() => {
      expect(screen.getByText('Talle 35')).toBeInTheDocument()
      expect(screen.getByText('Talle 38')).toBeInTheDocument()
      expect(screen.getByText('Talle 42')).toBeInTheDocument()
      expect(screen.getByText('Talle 45')).toBeInTheDocument()
    })
  })

  it('loads and displays existing stock quantities', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [
          { size: 'S', stock_quantity: 10 },
          { size: 'M', stock_quantity: 15 },
          { size: 'L', stock_quantity: 8 }
        ]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
      expect(screen.getByDisplayValue('15')).toBeInTheDocument()
      expect(screen.getByDisplayValue('8')).toBeInTheDocument()
    })
  })

  it('initializes with zero stock for new products', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: false,
        sizes: []
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      const stockInputs = screen.getAllByDisplayValue('0')
      expect(stockInputs.length).toBeGreaterThan(0)
    })
  })

  it('increases stock when plus button is clicked', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [{ size: 'S', stock_quantity: 5 }]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })

    const plusButtons = screen.getAllByTestId('plus-icon')
    await user.click(plusButtons[0]) // Click first plus button (S size)
    
    expect(screen.getByDisplayValue('6')).toBeInTheDocument()
  })

  it('decreases stock when minus button is clicked', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [{ size: 'S', stock_quantity: 5 }]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    })

    const minusButtons = screen.getAllByTestId('minus-icon')
    await user.click(minusButtons[0]) // Click first minus button (S size)
    
    expect(screen.getByDisplayValue('4')).toBeInTheDocument()
  })

  it('disables minus button when stock is zero', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [{ size: 'S', stock_quantity: 0 }]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      const minusButtons = screen.getAllByTestId('minus-icon')
      expect(minusButtons[0].parentElement).toBeDisabled()
    })
  })

  it('allows manual stock input', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [{ size: 'S', stock_quantity: 5 }]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      const stockInput = screen.getByDisplayValue('5')
      expect(stockInput).toBeInTheDocument()
    })

    const stockInput = screen.getByDisplayValue('5')
    await user.clear(stockInput)
    await user.type(stockInput, '25')
    
    expect(screen.getByDisplayValue('25')).toBeInTheDocument()
  })

  it('displays total stock calculation', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [
          { size: 'S', stock_quantity: 10 },
          { size: 'M', stock_quantity: 15 },
          { size: 'L', stock_quantity: 8 }
        ]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('33 unidades')).toBeInTheDocument()
    })
  })

  it('updates total when stock changes', async () => {
    const user = userEvent.setup()
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: true,
        sizes: [
          { size: 'S', stock_quantity: 10 },
          { size: 'M', stock_quantity: 15 }
        ]
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByText('25 unidades')).toBeInTheDocument()
    })

    const plusButtons = screen.getAllByTestId('plus-icon')
    await user.click(plusButtons[0]) // Increase S size stock
    
    expect(screen.getByText('26 unidades')).toBeInTheDocument()
  })

  it('saves stock changes successfully', async () => {
    const user = userEvent.setup()
    const onUpdateSuccess = jest.fn()
    
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          has_sizes: true,
          sizes: [{ size: 'S', stock_quantity: 10 }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Stock de talles actualizado correctamente'
        })
      })

    render(<SizeStockModal {...defaultProps} onUpdateSuccess={onUpdateSuccess} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /guardar stock/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(onUpdateSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('shows error message on save failure', async () => {
    const user = userEvent.setup()
    
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          has_sizes: true,
          sizes: [{ size: 'S', stock_quantity: 10 }]
        })
      })
      .mockRejectedValueOnce({
        ok: false,
        json: async () => ({
          detail: 'Error al guardar'
        })
      })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /guardar stock/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(screen.getByText('Error de conexión al servidor')).toBeInTheDocument()
    })
  })

  it('shows saving state during save', async () => {
    const user = userEvent.setup()
    
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          has_sizes: true,
          sizes: [{ size: 'S', stock_quantity: 10 }]
        })
      })
      .mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /guardar stock/i })
    await user.click(saveButton)
    
    expect(screen.getByText('Guardando...')).toBeInTheDocument()
    expect(saveButton).toBeDisabled()
  })

  it('makes correct API calls', async () => {
    const user = userEvent.setup()
    
    mockedFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          has_sizes: true,
          sizes: [{ size: 'S', stock_quantity: 10 }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Stock de talles actualizado correctamente'
        })
      })

    render(<SizeStockModal {...defaultProps} product={clothingProduct} />)
    
    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:8000/products/1/sizes',
        expect.objectContaining({
          headers: { 'Authorization': 'Bearer test-token' }
        })
      )
    })

    const saveButton = screen.getByRole('button', { name: /guardar stock/i })
    await user.click(saveButton)
    
    await waitFor(() => {
      expect(mockedFetch).toHaveBeenCalledWith(
        'http://localhost:8000/products/1/sizes',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            sizes: [{ size: 'S', stock_quantity: 10 }]
          })
        })
      )
    })
  })

  it('resets state when modal is closed and reopened', async () => {
    const { rerender } = render(<SizeStockModal {...defaultProps} />)
    
    // Close modal
    rerender(<SizeStockModal {...defaultProps} isOpen={false} />)
    
    // Reopen modal
    rerender(<SizeStockModal {...defaultProps} isOpen={true} />)
    
    // Should show loading state again
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('handles product without sizes', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        has_sizes: false,
        sizes: []
      })
    })

    render(<SizeStockModal {...defaultProps} />)
    
    await waitFor(() => {
      // Should initialize all sizes with 0 stock
      const stockInputs = screen.getAllByDisplayValue('0')
      expect(stockInputs.length).toBeGreaterThan(0)
    })
  })
})