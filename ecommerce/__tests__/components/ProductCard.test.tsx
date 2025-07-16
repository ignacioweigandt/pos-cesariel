import { render, screen, fireEvent, waitFor } from '../setup/test-utils'
import ProductCard from '@/app/components/ProductCard'
import { mockProduct } from '../setup/test-utils'
import { productsApi } from '@/app/lib/api'

// Mock the API
jest.mock('@/app/lib/api', () => ({
  productsApi: {
    getImages: jest.fn(),
  },
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

const mockProductsApi = productsApi as jest.Mocked<typeof productsApi>

describe('ProductCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders product information correctly', async () => {
    mockProductsApi.getImages.mockResolvedValue({
      data: { data: [] }
    })

    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Product')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('Ver Detalles')).toBeInTheDocument()
  })

  it('shows loading state for images', () => {
    mockProductsApi.getImages.mockImplementation(() => new Promise(() => {}))

    render(<ProductCard product={mockProduct} />)

    expect(screen.getByTestId('image-loading') || document.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('loads and displays product images', async () => {
    const mockImages = [
      {
        id: 1,
        product_id: 1,
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'Image 1',
        is_main: true,
        order: 1,
        created_at: '2023-01-01'
      },
      {
        id: 2,
        product_id: 1,
        image_url: 'https://example.com/image2.jpg',
        alt_text: 'Image 2',
        is_main: false,
        order: 2,
        created_at: '2023-01-01'
      }
    ]

    mockProductsApi.getImages.mockResolvedValue({
      data: { data: mockImages }
    })

    render(<ProductCard product={mockProduct} />)

    await waitFor(() => {
      const image = screen.getByAltText('Image 1')
      expect(image).toBeInTheDocument()
      expect(image).toHaveAttribute('src', 'https://example.com/image1.jpg')
    })
  })

  it('handles image navigation with multiple images', async () => {
    const mockImages = [
      {
        id: 1,
        product_id: 1,
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'Image 1',
        is_main: true,
        order: 1,
        created_at: '2023-01-01'
      },
      {
        id: 2,
        product_id: 1,
        image_url: 'https://example.com/image2.jpg',
        alt_text: 'Image 2',
        is_main: false,
        order: 2,
        created_at: '2023-01-01'
      }
    ]

    mockProductsApi.getImages.mockResolvedValue({
      data: { data: mockImages }
    })

    render(<ProductCard product={mockProduct} />)

    await waitFor(() => {
      expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    })

    // Find navigation buttons (they should be present for multiple images)
    const nextButton = screen.getByRole('button', { name: /chevron/i }) || 
                      document.querySelector('button:has(svg)')
    
    if (nextButton) {
      fireEvent.click(nextButton)
      
      await waitFor(() => {
        expect(screen.getByAltText('Image 2')).toBeInTheDocument()
      })
    }
  })

  it('shows sale badge when originalPrice is present', () => {
    const productWithSale = {
      ...mockProduct,
      price: 80,
      originalPrice: 100
    }

    mockProductsApi.getImages.mockResolvedValue({
      data: { data: [] }
    })

    render(<ProductCard product={productWithSale} />)

    expect(screen.getByText('20% OFF')).toBeInTheDocument()
    expect(screen.getByText('$100')).toBeInTheDocument()
    expect(screen.getByText('$80')).toBeInTheDocument()
  })

  it('handles API error gracefully', async () => {
    mockProductsApi.getImages.mockRejectedValue(new Error('API Error'))

    // Product with fallback image
    const productWithImage = {
      ...mockProduct,
      images: ['https://example.com/fallback.jpg']
    }

    render(<ProductCard product={productWithImage} />)

    await waitFor(() => {
      expect(screen.getByAltText('Test Product')).toBeInTheDocument()
    })
  })

  it('renders star rating correctly', () => {
    const productWithRating = {
      ...mockProduct,
      rating: 4,
      reviews: 25
    }

    mockProductsApi.getImages.mockResolvedValue({
      data: { data: [] }
    })

    render(<ProductCard product={productWithRating} />)

    expect(screen.getByText('(25)')).toBeInTheDocument()
    
    // Check for star elements
    const stars = document.querySelectorAll('svg')
    expect(stars.length).toBeGreaterThan(0)
  })

  it('creates correct product detail link', () => {
    mockProductsApi.getImages.mockResolvedValue({
      data: { data: [] }
    })

    render(<ProductCard product={mockProduct} />)

    const detailLinks = screen.getAllByRole('link')
    const productDetailLink = detailLinks.find(link => 
      link.getAttribute('href') === '/productos/1'
    )
    
    expect(productDetailLink).toBeInTheDocument()
  })

  it('sorts images correctly with main image first', async () => {
    const mockImages = [
      {
        id: 2,
        product_id: 1,
        image_url: 'https://example.com/image2.jpg',
        alt_text: 'Image 2',
        is_main: false,
        order: 2,
        created_at: '2023-01-01'
      },
      {
        id: 1,
        product_id: 1,
        image_url: 'https://example.com/image1.jpg',
        alt_text: 'Image 1',
        is_main: true,
        order: 1,
        created_at: '2023-01-01'
      }
    ]

    mockProductsApi.getImages.mockResolvedValue({
      data: { data: mockImages }
    })

    render(<ProductCard product={mockProduct} />)

    await waitFor(() => {
      // Main image should be displayed first despite order in array
      expect(screen.getByAltText('Image 1')).toBeInTheDocument()
    })
  })
})