"use client"

import { useState, useEffect, useCallback } from 'react'
import { getProducts, getProductById, searchProducts, getCategories } from '@/app/lib/data-service'
import type { Product, Category } from '@/app/lib/api-types'

interface UseProductsOptions {
  search?: string
  category?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  featured?: boolean
}

interface UseProductsResult {
  products: Product[]
  loading: boolean
  error: string | null
  refetch: () => void
  hasMore: boolean
  loadMore: () => void
}

export function useProducts(options: UseProductsOptions = {}): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  const loadProducts = useCallback(async (reset = true) => {
    try {
      if (reset) {
        setLoading(true)
        setError(null)
      }

      const filters = {
        search: options.search,
        category: options.category,
        brand: options.brand,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        inStock: options.inStock
      }

      let productsData = await getProducts(filters)

      // Filtrar productos destacados si es necesario
      if (options.featured) {
        productsData = productsData.slice(0, 8) // Máximo 8 productos destacados
      }

      if (reset) {
        setProducts(productsData)
      } else {
        setProducts(prev => [...prev, ...productsData])
      }

      // Por simplicidad, asumimos que no hay más productos
      // En una implementación real, esto vendría del backend
      setHasMore(false)

    } catch (err) {
      console.error('Error loading products:', err)
      setError('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }, [options.search, options.category, options.brand, options.minPrice, options.maxPrice, options.inStock, options.featured])

  useEffect(() => {
    loadProducts(true)
  }, [loadProducts])

  return {
    products,
    loading,
    error,
    refetch: () => loadProducts(true),
    hasMore,
    loadMore: () => loadProducts(false)
  }
}

interface UseProductResult {
  product: Product | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useProduct(id: string): UseProductResult {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const productData = await getProductById(id)
      setProduct(productData)
      
    } catch (err) {
      console.error('Error loading product:', err)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    if (id) {
      loadProduct()
    }
  }, [loadProduct, id])

  return {
    product,
    loading,
    error,
    refetch: loadProduct
  }
}

interface UseSearchResult {
  results: Product[]
  loading: boolean
  error: string | null
  search: (query: string) => void
  clear: () => void
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      const searchResults = await searchProducts(query)
      setResults(searchResults)
      
    } catch (err) {
      console.error('Error searching products:', err)
      setError('Error en la búsqueda')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    loading,
    error,
    search,
    clear
  }
}

interface UseCategoriesResult {
  categories: Category[]
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useCategories(): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const categoriesData = await getCategories()
      setCategories(categoriesData)
      
    } catch (err) {
      console.error('Error loading categories:', err)
      setError('Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  }
}