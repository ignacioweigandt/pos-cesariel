import { Suspense } from 'react'
import { getProducts, getCategories, getBrands, type GetProductsParams } from '@/src/lib/api'
import { ProductFilters } from './_components/product-filters'
import { ProductGrid } from './_components/product-grid'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Productos - POS Cesariel',
  description: 'Explora nuestro catálogo completo de productos deportivos. Ropa, calzado y accesorios de las mejores marcas.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    buscar?: string
    categoria?: string
    marca?: string
    minPrecio?: string
    maxPrecio?: string
    enStock?: string
  }>
}

// Loading component for Suspense
function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="h-48 bg-gray-200 rounded-md animate-pulse mb-4" />
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  // Await searchParams (Next.js 15 requirement)
  const resolvedSearchParams = await Promise.resolve(searchParams)

  // Build filter params from URL search params
  const params: GetProductsParams = {}

  if (resolvedSearchParams.buscar) {
    params.search = resolvedSearchParams.buscar
  }
  if (resolvedSearchParams.categoria && resolvedSearchParams.categoria !== 'all') {
    params.category = resolvedSearchParams.categoria
  }
  if (resolvedSearchParams.marca && resolvedSearchParams.marca !== 'all') {
    params.brand = resolvedSearchParams.marca
  }
  if (resolvedSearchParams.minPrecio) {
    params.minPrice = Number(resolvedSearchParams.minPrecio)
  }
  if (resolvedSearchParams.maxPrecio) {
    params.maxPrice = Number(resolvedSearchParams.maxPrecio)
  }
  if (resolvedSearchParams.enStock === 'true') {
    params.inStock = true
  }

  // Fetch products, categories, and brands in parallel (server-side)
  const [products, categories, brands] = await Promise.all([
    getProducts(params),
    getCategories(),
    getBrands(),
  ])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar - Client Component for interactivity */}
        <ProductFilters categories={categories} brands={brands} />

        {/* Products Grid - Client Component for sorting */}
        <Suspense fallback={<ProductsLoading />}>
          <ProductGrid products={products} />
        </Suspense>
      </div>
    </div>
  )
}

// Enable dynamic rendering to handle search params
export const dynamic = 'force-dynamic'
