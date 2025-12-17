import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ImportModal from '@/components/ImportModal'
import axios from 'axios'

// Mock axios
jest.mock('axios')
const mockedAxios = axios as jest.Mocked<typeof axios>

// Mock the heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  XMarkIcon: () => <div data-testid="x-mark-icon">X Mark Icon</div>,
  DocumentArrowUpIcon: () => <div data-testid="document-arrow-up-icon">Document Arrow Up Icon</div>,
  CheckCircleIcon: () => <div data-testid="check-circle-icon">Check Circle Icon</div>,
  ExclamationCircleIcon: () => <div data-testid="exclamation-circle-icon">Exclamation Circle Icon</div>,
  InformationCircleIcon: () => <div data-testid="information-circle-icon">Information Circle Icon</div>,
}))

describe('ImportModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    onImportSuccess: jest.fn(),
    token: 'test-token'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockedAxios.post.mockReset()
  })

  it('renders modal when open', () => {
    render(<ImportModal {...defaultProps} />)
    
    expect(screen.getByText('Importar Productos')).toBeInTheDocument()
    expect(screen.getByText('Subir archivo CSV o Excel')).toBeInTheDocument()
    expect(screen.getByTestId('document-arrow-up-icon')).toBeInTheDocument()
  })

  it('does not render modal when closed', () => {
    render(<ImportModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Importar Productos')).not.toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<ImportModal {...defaultProps} onClose={onClose} />)
    
    const closeButton = screen.getByTestId('x-mark-icon').parentElement!
    fireEvent.click(closeButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn()
    render(<ImportModal {...defaultProps} onClose={onClose} />)
    
    const cancelButton = screen.getByText('Cancelar')
    fireEvent.click(cancelButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows file format instructions', () => {
    render(<ImportModal {...defaultProps} />)
    
    expect(screen.getByText('Formato requerido:')).toBeInTheDocument()
    expect(screen.getByText('codigo_barra')).toBeInTheDocument()
    expect(screen.getByText('modelo')).toBeInTheDocument()
    expect(screen.getByText('efectivo')).toBeInTheDocument()
    expect(screen.getByText('Formatos soportados: CSV, Excel (.xlsx)')).toBeInTheDocument()
  })

  it('accepts file upload', async () => {
    const user = userEvent.setup()
    render(<ImportModal {...defaultProps} />)
    
    const fileInput = screen.getByRole('button', { name: /seleccionar archivo/i })
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    expect(screen.getByText('test.csv')).toBeInTheDocument()
  })

  it('shows error for invalid file type', async () => {
    const user = userEvent.setup()
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['invalid'], 'test.txt', { type: 'text/plain' })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    
    await user.upload(hiddenInput, file)
    
    expect(screen.getByText('Formato de archivo no válido')).toBeInTheDocument()
  })

  it('shows error for file too large', async () => {
    const user = userEvent.setup()
    render(<ImportModal {...defaultProps} />)
    
    // Create a file that's too large (over 10MB)
    const largeContent = 'a'.repeat(11 * 1024 * 1024) // 11MB
    const file = new File([largeContent], 'large.csv', { type: 'text/csv' })
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 })
    
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    expect(screen.getByText('El archivo es demasiado grande')).toBeInTheDocument()
  })

  it('disables upload button when no file selected', () => {
    render(<ImportModal {...defaultProps} />)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    expect(uploadButton).toBeDisabled()
  })

  it('enables upload button when valid file is selected', async () => {
    const user = userEvent.setup()
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    expect(uploadButton).not.toBeDisabled()
  })

  it('shows loading state during upload', async () => {
    const user = userEvent.setup()
    mockedAxios.post.mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    expect(screen.getByText('Procesando archivo...')).toBeInTheDocument()
    expect(uploadButton).toBeDisabled()
  })

  it('handles successful import', async () => {
    const user = userEvent.setup()
    const onImportSuccess = jest.fn()
    
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        total_rows: 3,
        successful_rows: 3,
        failed_rows: 0,
        errors: []
      }
    })
    
    render(<ImportModal {...defaultProps} onImportSuccess={onImportSuccess} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Importación exitosa')).toBeInTheDocument()
    })
    
    expect(screen.getByText('3 productos importados correctamente')).toBeInTheDocument()
    expect(screen.getByText('0 productos fallidos')).toBeInTheDocument()
    expect(onImportSuccess).toHaveBeenCalledTimes(1)
  })

  it('handles import with errors', async () => {
    const user = userEvent.setup()
    
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        total_rows: 3,
        successful_rows: 2,
        failed_rows: 1,
        errors: [
          { row: 3, error: 'Producto ya existe' }
        ]
      }
    })
    
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Importación completada con advertencias')).toBeInTheDocument()
    })
    
    expect(screen.getByText('2 productos importados correctamente')).toBeInTheDocument()
    expect(screen.getByText('1 productos fallidos')).toBeInTheDocument()
    expect(screen.getByText('Fila 3: Producto ya existe')).toBeInTheDocument()
  })

  it('handles import failure', async () => {
    const user = userEvent.setup()
    
    mockedAxios.post.mockRejectedValueOnce({
      response: {
        data: {
          detail: 'Formato de archivo no soportado'
        }
      }
    })
    
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Error en la importación')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Formato de archivo no soportado')).toBeInTheDocument()
  })

  it('allows removing selected file', async () => {
    const user = userEvent.setup()
    render(<ImportModal {...defaultProps} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    expect(screen.getByText('test.csv')).toBeInTheDocument()
    
    const removeButton = screen.getByRole('button', { name: /×/i })
    await user.click(removeButton)
    
    expect(screen.queryByText('test.csv')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /importar productos/i })).toBeDisabled()
  })

  it('resets state after successful import', async () => {
    const user = userEvent.setup()
    const onImportSuccess = jest.fn()
    
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        total_rows: 1,
        successful_rows: 1,
        failed_rows: 0,
        errors: []
      }
    })
    
    render(<ImportModal {...defaultProps} onImportSuccess={onImportSuccess} />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(screen.getByText('Importación exitosa')).toBeInTheDocument()
    })
    
    const newImportButton = screen.getByText('Nueva Importación')
    await user.click(newImportButton)
    
    expect(screen.queryByText('Importación exitosa')).not.toBeInTheDocument()
    expect(screen.getByText('Seleccionar archivo')).toBeInTheDocument()
  })

  it('sends correct request to backend', async () => {
    const user = userEvent.setup()
    
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        total_rows: 1,
        successful_rows: 1,
        failed_rows: 0,
        errors: []
      }
    })
    
    render(<ImportModal {...defaultProps} token="test-token" />)
    
    const file = new File(['codigo_barra,modelo,efectivo\\n123,Test,10.99'], 'test.csv', {
      type: 'text/csv'
    })
    const hiddenInput = screen.getByDisplayValue('').closest('input')!
    await user.upload(hiddenInput, file)
    
    const uploadButton = screen.getByRole('button', { name: /importar productos/i })
    await user.click(uploadButton)
    
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:8000/products/import',
        expect.any(FormData),
        {
          headers: {
            'Authorization': 'Bearer test-token',
            'Content-Type': 'multipart/form-data'
          }
        }
      )
    })
  })
})