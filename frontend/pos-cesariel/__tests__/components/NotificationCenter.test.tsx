import { render, screen, fireEvent } from '@testing-library/react'
import NotificationCenter from '@/components/NotificationCenter'
import { WebSocketMessage } from '@/lib/websocket'

// Mock the heroicons
jest.mock('@heroicons/react/24/outline', () => ({
  BellIcon: () => <div data-testid="bell-icon">Bell Icon</div>,
  XMarkIcon: () => <div data-testid="x-mark-icon">X Mark Icon</div>,
  CheckCircleIcon: () => <div data-testid="check-circle-icon">Check Circle Icon</div>,
  ExclamationTriangleIcon: () => <div data-testid="exclamation-triangle-icon">Exclamation Triangle Icon</div>,
  InformationCircleIcon: () => <div data-testid="information-circle-icon">Information Circle Icon</div>,
  ShoppingCartIcon: () => <div data-testid="shopping-cart-icon">Shopping Cart Icon</div>,
  CubeIcon: () => <div data-testid="cube-icon">Cube Icon</div>,
  PencilSquareIcon: () => <div data-testid="pencil-square-icon">Pencil Square Icon</div>,
  ChartBarIcon: () => <div data-testid="chart-bar-icon">Chart Bar Icon</div>,
  ClipboardDocumentListIcon: () => <div data-testid="clipboard-document-list-icon">Clipboard Document List Icon</div>,
}))

const mockNotifications: WebSocketMessage[] = [
  {
    type: 'new_sale',
    message: 'Nueva venta registrada',
    timestamp: new Date().toISOString(),
    details: 'Venta #12345 por $100.00',
    user_name: 'Juan Pérez',
    branch_id: 1
  },
  {
    type: 'low_stock_alert',
    message: 'Stock bajo detectado',
    timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
    details: 'Producto: Widget ABC',
    user_name: 'Sistema',
    branch_id: 1
  },
  {
    type: 'inventory_change',
    message: 'Inventario actualizado',
    timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
    details: 'Stock ajustado manualmente',
    user_name: 'María García',
    branch_id: 2
  }
]

describe('NotificationCenter', () => {
  const defaultProps = {
    notifications: [],
    unreadCount: 0,
    onMarkAllAsRead: jest.fn(),
    onClearNotifications: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders notification bell button', () => {
    render(<NotificationCenter {...defaultProps} />)
    expect(screen.getByTestId('bell-icon')).toBeInTheDocument()
  })

  it('shows unread count badge when there are unread notifications', () => {
    render(<NotificationCenter {...defaultProps} unreadCount={3} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('shows 9+ when unread count is more than 9', () => {
    render(<NotificationCenter {...defaultProps} unreadCount={15} />)
    expect(screen.getByText('9+')).toBeInTheDocument()
  })

  it('does not show badge when unread count is 0', () => {
    render(<NotificationCenter {...defaultProps} />)
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('opens notification panel when bell is clicked', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText('Notificaciones en Tiempo Real')).toBeInTheDocument()
  })

  it('calls onMarkAllAsRead when opened with unread notifications', () => {
    const onMarkAllAsRead = jest.fn()
    render(
      <NotificationCenter 
        {...defaultProps} 
        unreadCount={2}
        onMarkAllAsRead={onMarkAllAsRead}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(onMarkAllAsRead).toHaveBeenCalledTimes(1)
  })

  it('shows empty state when no notifications', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText('No hay notificaciones')).toBeInTheDocument()
    expect(screen.getByText('Las notificaciones en tiempo real aparecerán aquí')).toBeInTheDocument()
  })

  it('displays notifications when provided', () => {
    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={mockNotifications}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText('Nueva venta registrada')).toBeInTheDocument()
    expect(screen.getByText('Stock bajo detectado')).toBeInTheDocument()
    expect(screen.getByText('Inventario actualizado')).toBeInTheDocument()
  })

  it('shows notification details and metadata', () => {
    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={[mockNotifications[0]]}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText('Venta #12345 por $100.00')).toBeInTheDocument()
    expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument()
  })

  it('formats time correctly for different intervals', () => {
    const now = new Date()
    const notificationsWithTime = [
      {
        ...mockNotifications[0],
        timestamp: new Date(now.getTime() - 30000).toISOString() // 30 seconds ago
      },
      {
        ...mockNotifications[1],
        timestamp: new Date(now.getTime() - 300000).toISOString() // 5 minutes ago
      },
      {
        ...mockNotifications[2],
        timestamp: new Date(now.getTime() - 7200000).toISOString() // 2 hours ago
      }
    ]

    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={notificationsWithTime}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText(/Ahora|5m|2h/)).toBeInTheDocument()
  })

  it('calls onClearNotifications when clear button is clicked', () => {
    const onClearNotifications = jest.fn()
    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={mockNotifications}
        onClearNotifications={onClearNotifications}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    const clearButton = screen.getByText('Limpiar')
    fireEvent.click(clearButton)
    
    expect(onClearNotifications).toHaveBeenCalledTimes(1)
  })

  it('closes panel when X button is clicked', () => {
    render(<NotificationCenter {...defaultProps} />)
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText('Notificaciones en Tiempo Real')).toBeInTheDocument()
    
    const closeButton = screen.getByTestId('x-mark-icon').parentElement!
    fireEvent.click(closeButton)
    
    expect(screen.queryByText('Notificaciones en Tiempo Real')).not.toBeInTheDocument()
  })

  it('displays correct icons for different notification types', () => {
    const typeNotifications = [
      { ...mockNotifications[0], type: 'new_sale' },
      { ...mockNotifications[1], type: 'low_stock_alert' },
      { ...mockNotifications[2], type: 'inventory_change' }
    ]

    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={typeNotifications}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByTestId('shopping-cart-icon')).toBeInTheDocument()
    expect(screen.getByTestId('exclamation-triangle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('cube-icon')).toBeInTheDocument()
  })

  it('shows branch information for notifications from different branches', () => {
    const notification = {
      ...mockNotifications[0],
      branch_id: 5
    }

    render(
      <NotificationCenter 
        {...defaultProps} 
        notifications={[notification]}
      />
    )
    
    const bellButton = screen.getByRole('button')
    fireEvent.click(bellButton)
    
    expect(screen.getByText(/Sucursal 5/)).toBeInTheDocument()
  })
})