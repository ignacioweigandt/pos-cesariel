import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'

// Mock auth store for testing
const mockAuthStore = {
  isAuthenticated: true,
  user: {
    id: 1,
    username: 'testuser',
    role: 'SELLER',
    branch_id: 1,
    full_name: 'Test User',
    email: 'test@example.com'
  },
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn()
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

export * from '@testing-library/react'
export { customRender as render }

// Test data utilities
export const mockProduct = {
  id: 1,
  name: 'Test Product',
  description: 'Test Description',
  price: 100.00,
  cost: 50.00,
  sku: 'TEST-001',
  barcode: '123456789',
  stock_quantity: 10,
  min_stock: 5,
  category_id: 1,
  is_active: true,
  show_in_ecommerce: true,
  has_sizes: false,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  category: {
    id: 1,
    name: 'Test Category',
    description: 'Test Category Description',
    is_active: true
  }
}

export const mockProductWithSizes = {
  ...mockProduct,
  id: 2,
  name: 'Sized Product',
  sku: 'SIZED-001',
  has_sizes: true,
  stock_quantity: 0 // Stock managed by sizes
}

export const mockCategory = {
  id: 1,
  name: 'Test Category',
  description: 'Test Category Description',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'SELLER',
  branch_id: 1,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  branch: {
    id: 1,
    name: 'Test Branch',
    address: 'Test Address',
    phone: '+1234567890',
    email: 'branch@test.com',
    is_active: true
  }
}

export const mockBranch = {
  id: 1,
  name: 'Test Branch',
  address: 'Test Address',
  phone: '+1234567890',
  email: 'branch@test.com',
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockSale = {
  id: 1,
  sale_number: 'SALE-001',
  sale_type: 'POS',
  customer_name: 'Test Customer',
  customer_phone: '+1234567890',
  customer_email: 'customer@test.com',
  payment_method: 'CASH',
  subtotal: 100.00,
  tax_amount: 21.00,
  total_amount: 121.00,
  status: 'COMPLETED',
  notes: 'Test sale',
  user_id: 1,
  branch_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
  items: [
    {
      id: 1,
      sale_id: 1,
      product_id: 1,
      quantity: 1,
      unit_price: 100.00,
      total_price: 100.00,
      size: null,
      product: mockProduct
    }
  ],
  user: mockUser,
  branch: mockBranch
}

export const mockSaleItem = {
  id: 1,
  sale_id: 1,
  product_id: 1,
  quantity: 1,
  unit_price: 100.00,
  total_price: 100.00,
  size: null,
  product: mockProduct
}

export const mockCartItem = {
  id: 1,
  name: 'Test Product',
  price: 100.00,
  quantity: 1,
  size: null,
  image: 'test-image.jpg',
  stock_quantity: 10
}

export const mockCustomer = {
  name: 'Test Customer',
  phone: '+1234567890',
  email: 'customer@test.com'
}

export const mockPaymentConfig = {
  id: 1,
  payment_type: 'CARD',
  card_type: 'BANCARIZADA',
  installments: 1,
  surcharge_percentage: 0.0,
  is_active: true,
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z'
}

export const mockInventoryMovement = {
  id: 1,
  product_id: 1,
  movement_type: 'SALE',
  quantity: -1,
  description: 'Sale of 1 unit',
  user_id: 1,
  branch_id: 1,
  created_at: '2023-01-01T00:00:00Z',
  product: mockProduct,
  user: mockUser,
  branch: mockBranch
}

export const mockNotification = {
  id: '1',
  type: 'new_sale',
  title: 'Nueva Venta',
  message: 'Se registró una nueva venta',
  data: {
    sale_id: 1,
    total: 121.00
  },
  read: false,
  timestamp: new Date().toISOString()
}

// Helper functions for testing
export const createMockAxiosResponse = (data: any, status = 200) => ({
  data,
  status,
  statusText: 'OK',
  headers: {},
  config: {}
})

export const createMockAxiosError = (message: string, status = 500) => ({
  response: {
    data: { message },
    status,
    statusText: 'Error',
    headers: {},
    config: {}
  },
  message,
  config: {}
})

// Mock localStorage for testing
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
}

// Mock WebSocket for testing
export const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  readyState: WebSocket.OPEN,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn()
}

// Form testing helpers
export const fillForm = (fields: Record<string, string>) => {
  Object.entries(fields).forEach(([name, value]) => {
    const input = document.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      input.value = value
      input.dispatchEvent(new Event('change', { bubbles: true }))
    }
  })
}

export const submitForm = (formTestId?: string) => {
  const form = formTestId 
    ? document.querySelector(`[data-testid="${formTestId}"]`) as HTMLFormElement
    : document.querySelector('form') as HTMLFormElement
  
  if (form) {
    form.dispatchEvent(new Event('submit', { bubbles: true }))
  }
}

// API mocking helpers
export const mockApiSuccess = (apiFunction: jest.Mock, data: any) => {
  apiFunction.mockResolvedValue(createMockAxiosResponse(data))
}

export const mockApiError = (apiFunction: jest.Mock, message: string, status = 500) => {
  apiFunction.mockRejectedValue(createMockAxiosError(message, status))
}

// Time testing helpers
export const mockDate = (date: string) => {
  const mockDate = new Date(date)
  jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)
  return mockDate
}

export const restoreDate = () => {
  jest.restoreAllMocks()
}

// Auth testing helpers
export const loginTestUser = (role: string = 'SELLER') => {
  const user = {
    ...mockUser,
    role
  }
  
  // Mock auth store state
  mockAuthStore.isAuthenticated = true
  mockAuthStore.user = user
  
  return user
}

export const logoutTestUser = () => {
  mockAuthStore.isAuthenticated = false
  mockAuthStore.user = null
  mockAuthStore.token = null
}

// Error boundary testing
export const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

// Performance testing helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now()
  await renderFn()
  const end = performance.now()
  return end - start
}

// Accessibility testing helpers
export const getByRole = (role: string, options?: any) => {
  return document.querySelector(`[role="${role}"]`)
}

export const getByAriaLabel = (label: string) => {
  return document.querySelector(`[aria-label="${label}"]`)
}

// Data generation helpers
export const generateMockProducts = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockProduct,
    id: index + 1,
    name: `Test Product ${index + 1}`,
    sku: `TEST-${String(index + 1).padStart(3, '0')}`,
    price: 10 + (index * 5)
  }))
}

export const generateMockSales = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockSale,
    id: index + 1,
    sale_number: `SALE-${String(index + 1).padStart(3, '0')}`,
    total_amount: 100 + (index * 50)
  }))
}

export const generateMockUsers = (count: number) => {
  return Array.from({ length: count }, (_, index) => ({
    ...mockUser,
    id: index + 1,
    username: `testuser${index + 1}`,
    email: `test${index + 1}@example.com`,
    full_name: `Test User ${index + 1}`
  }))
}