import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { EcommerceProvider } from '@/context/EcommerceContext'

// Mock cart context data
const mockCartContext = {
  cart: [],
  addToCart: jest.fn(),
  removeFromCart: jest.fn(),
  updateQuantity: jest.fn(),
  clearCart: jest.fn(),
  getTotalItems: () => 0,
  getTotalPrice: () => 0,
  customer: {
    name: '',
    whatsapp: '',
    address: '',
    shipping_method: 'pickup',
  },
  setCustomer: jest.fn(),
  isLoading: false,
  error: null,
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <EcommerceProvider value={mockCartContext}>
      {children}
    </EcommerceProvider>
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
  sku: 'TEST-001',
  barcode: '123456789',
  stock_quantity: 10,
  low_stock_alert: 5,
  category_id: 1,
  branch_id: 1,
  is_active: true,
  show_in_ecommerce: true,
  has_sizes: false,
  images: [
    {
      id: 1,
      product_id: 1,
      image_url: 'https://example.com/image.jpg',
      image_order: 1,
      alt_text: 'Test Image'
    }
  ],
  category: {
    id: 1,
    name: 'Test Category',
    description: 'Test Category Description',
    is_active: true
  }
}

export const mockCategory = {
  id: 1,
  name: 'Test Category',
  description: 'Test Category Description',
  is_active: true
}

export const mockCartItem = {
  product: mockProduct,
  quantity: 1,
  size: null
}

export const mockCustomer = {
  name: 'Test Customer',
  whatsapp: '+1234567890',
  address: 'Test Address',
  shipping_method: 'pickup' as const
}