#!/usr/bin/env node

/**
 * Script de migración para actualizar el e-commerce a usar el API del POS
 * Este script actualiza automáticamente los archivos principales
 */

const fs = require('fs')
const path = require('path')

const APP_DIR = path.join(__dirname, '..', 'app')

// Archivo: app/page.tsx
const homePageContent = `"use client"

import { useState, useEffect } from "react"
import Banner from "./components/Banner"
import ProductCard from "./components/ProductCard"
import ConnectionStatus from "./components/ConnectionStatus"
import { getBanners, getProducts } from "./lib/data-service"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  const [banners, setBanners] = useState([])
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)

        // Cargar banners y productos destacados
        const [bannersData, productsData] = await Promise.all([
          getBanners(),
          getProducts()
        ])

        setBanners(bannersData)
        
        // Tomar los primeros 8 productos como destacados
        const featured = productsData.slice(0, 8)
        setFeaturedProducts(featured)

      } catch (err) {
        console.error('Error loading homepage data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando productos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Connection Status */}
      <div className="container mx-auto px-4 pt-4">
        <ConnectionStatus onConnectionChange={setIsConnected} />
      </div>

      {/* Hero Banners */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners
            .filter((banner) => banner.active)
            .map((banner) => (
              <Banner key={banner.id} banner={banner} />
            ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección especial de productos con las mejores ofertas y novedades
          </p>
          {isConnected && (
            <p className="text-sm text-green-600 mt-2">
              📊 Stock actualizado en tiempo real
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="text-center">
          <Button asChild size="lg">
            <Link href="/productos">Ver Todos los Productos</Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Compra por Categoría</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/productos?categoria=ropa" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">Ropa</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">Encuentra la mejor ropa para todas las ocasiones</p>
                </div>
              </div>
            </Link>

            <Link href="/productos?categoria=calzado" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">Calzado</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">Zapatos y zapatillas de las mejores marcas</p>
                </div>
              </div>
            </Link>

            <Link href="/productos?categoria=accesorios" className="group">
              <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">Accesorios</h3>
                </div>
                <div className="p-4">
                  <p className="text-gray-600">Complementa tu look con nuestros accesorios</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}`

// Archivo: app/productos/page.tsx
const productsPageContent = `"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "../components/ProductCard"
import ConnectionStatus from "../components/ConnectionStatus"
import { useProducts, useCategories } from "../hooks/useProducts"
import { getBrands } from "../lib/data-service"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get("buscar") || "",
    category: searchParams.get("categoria") || "all",
    brand: searchParams.get("marca") || "all",
    minPrice: "",
    maxPrice: "",
    inStock: false,
  })
  const [sortBy, setSortBy] = useState("featured")

  // Use our custom hooks
  const { products, loading, error, refetch } = useProducts({
    search: filters.search || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    brand: filters.brand !== "all" ? filters.brand : undefined,
    minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
    inStock: filters.inStock,
  })

  const { categories } = useCategories()
  const [brands, setBrands] = useState([])

  // Load brands
  React.useEffect(() => {
    getBrands().then(setBrands)
  }, [])

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...products]
    
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        sorted.sort((a, b) => b.price - a.price)
        break
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Keep original order (featured first if applicable)
        break
    }
    
    return sorted
  }, [products, sortBy])

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "all",
      brand: "all",
      minPrice: "",
      maxPrice: "",
      inStock: false,
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Connection Status */}
      <ConnectionStatus />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
          <button onClick={refetch} className="text-red-800 underline">
            Reintentar
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-1/4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h2 className="text-xl font-semibold">Filtros</h2>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ocultar" : "Mostrar"}
            </Button>
          </div>

          <div className={\`space-y-6 \${showFilters ? "block" : "hidden lg:block"}\`}>
            {/* Search */}
            <div>
              <Label htmlFor="search" className="text-sm font-medium mb-2 block">
                Buscar
              </Label>
              <Input
                id="search"
                type="text"
                placeholder="Buscar productos..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Categoría</Label>
              <Select value={filters.category} onValueChange={(value) => handleFilterChange("category", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Brand Filter */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Marca</Label>
              <Select value={filters.brand} onValueChange={(value) => handleFilterChange("brand", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas las marcas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las marcas</SelectItem>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.slug}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Rango de Precio</Label>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                />
              </div>
            </div>

            {/* Stock Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="inStock"
                checked={filters.inStock}
                onCheckedChange={(checked) => handleFilterChange("inStock", checked as boolean)}
              />
              <Label htmlFor="inStock" className="text-sm">
                Solo productos en stock
              </Label>
            </div>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-3/4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              Productos ({sortedProducts.length})
            </h1>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Destacados</SelectItem>
                <SelectItem value="name">Nombre A-Z</SelectItem>
                <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                <SelectItem value="rating">Mejor Valorados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Products Grid */}
          {sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No se encontraron productos con los filtros seleccionados.</p>
              <Button onClick={clearFilters} className="mt-4">
                Limpiar Filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}`

// Función para escribir archivos
function writeFile(filePath, content) {
  try {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`✅ Actualizado: ${filePath}`)
  } catch (error) {
    console.error(`❌ Error actualizando ${filePath}:`, error.message)
  }
}

// Función principal
function migrate() {
  console.log('🚀 Iniciando migración a API del POS...\n')

  // Actualizar app/page.tsx
  writeFile(path.join(APP_DIR, 'page.tsx'), homePageContent)

  // Actualizar app/productos/page.tsx
  writeFile(path.join(APP_DIR, 'productos', 'page.tsx'), productsPageContent)

  console.log('\n✅ Migración completada!')
  console.log('\n📋 Próximos pasos:')
  console.log('1. Instalar axios: npm install axios')
  console.log('2. Verificar que el backend POS esté funcionando')
  console.log('3. Iniciar el e-commerce: npm run dev')
  console.log('4. Revisar los logs para verificar la conexión')
}

// Ejecutar migración
if (require.main === module) {
  migrate()
}

module.exports = { migrate }`