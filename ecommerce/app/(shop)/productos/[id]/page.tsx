import { notFound } from 'next/navigation'
import { getProductById } from '@/src/lib/api/products'
import { ProductDetailClient } from './_components/product-detail-client'
import type { Metadata } from 'next'

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

// Generate metadata for the product page
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  // Await params (Next.js 15 requirement)
  const resolvedParams = await params
  const product = await getProductById(resolvedParams.id)

  if (!product) {
    return {
      title: 'Producto no encontrado - POS Cesariel',
      description: 'El producto que buscas no existe o ha sido eliminado.',
    }
  }

  return {
    title: `${product.name} - POS Cesariel`,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images,
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  // Await params (Next.js 15 requirement)
  const resolvedParams = await params

  // Fetch product data server-side
  const product = await getProductById(resolvedParams.id)

  // Handle product not found
  if (!product) {
    notFound()
  }

  // Render Client Component with server-fetched data
  return <ProductDetailClient product={product} />
}

// Enable dynamic rendering for real-time product data
export const dynamic = 'force-dynamic'
