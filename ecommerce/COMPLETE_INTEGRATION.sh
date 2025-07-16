#!/bin/bash

# 🔗 Script para Completar Integración E-commerce ↔ POS Backend
# Este script restaura los archivos necesarios para conectar el e-commerce con el backend POS

echo "🚀 Iniciando integración E-commerce ↔ POS Backend..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
show_message() {
    echo -e "${GREEN}✅ $1${NC}"
}

show_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

show_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    show_error "No se encontró package.json. Asegúrate de estar en el directorio ecommerce-pos"
    exit 1
fi

show_message "Directorio correcto detectado"

# 1. Instalar dependencias faltantes
echo "📦 Instalando dependencias..."
npm install axios
show_message "Dependencias instaladas"

# 2. Restaurar app/lib/data.ts
echo "📄 Restaurando app/lib/data.ts..."
cat > app/lib/data.ts << 'EOF'
import type { Product, Category, Brand, Banner } from "./types"

// Datos de fallback que se usan cuando el backend no está disponible
export const banners: Banner[] = [
  {
    id: "1",
    title: "Nueva Colección Primavera",
    subtitle: "Hasta 50% de descuento en toda la colección",
    image: "/placeholder.svg?height=400&width=800",
    link: "/productos?categoria=ropa",
    active: true,
  },
  {
    id: "2",
    title: "Calzado Deportivo",
    subtitle: "Las mejores marcas al mejor precio",
    image: "/placeholder.svg?height=400&width=800",
    link: "/productos?categoria=calzado",
    active: true,
  },
]

export const categories: Category[] = [
  {
    id: "1",
    name: "Ropa",
    slug: "ropa",
    subcategories: [],
  },
  {
    id: "2",
    name: "Calzado",
    slug: "calzado",
    subcategories: [],
  },
  {
    id: "3",
    name: "Accesorios",
    slug: "accesorios",
    subcategories: [],
  },
]

export const brands: Brand[] = [
  { id: "1", name: "Nike", slug: "nike" },
  { id: "2", name: "Adidas", slug: "adidas" },
  { id: "3", name: "Puma", slug: "puma" },
]

export const products: Product[] = [
  {
    id: "1",
    name: "Remera Básica Algodón",
    description: "Remera de algodón 100% con corte clásico.",
    price: 2500,
    originalPrice: 3000,
    images: ["/placeholder.svg?height=500&width=500"],
    category: "ropa",
    brand: "Nike",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Negro", "Blanco"],
    featured: true,
    inStock: true,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: "2",
    name: "Zapatillas Running Pro",
    description: "Zapatillas de running con tecnología avanzada.",
    price: 15000,
    originalPrice: 18000,
    images: ["/placeholder.svg?height=500&width=500"],
    category: "calzado",
    brand: "Adidas",
    sizes: ["35", "36", "37", "38", "39", "40"],
    colors: ["Negro", "Blanco"],
    featured: true,
    inStock: true,
    rating: 4.8,
    reviews: 89,
  },
]
EOF
show_message "app/lib/data.ts restaurado"

# 3. Restaurar app/page.tsx
echo "📄 Restaurando app/page.tsx..."
cat > app/page.tsx << 'EOF'
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Banner from "./components/Banner"
import ProductCard from "./components/ProductCard"
import ConnectionStatus from "./components/ConnectionStatus"
import { getBanners } from "./lib/data-service"
import { useProducts } from "./hooks/useProducts"
import type { Banner as BannerType } from "./lib/api-types"

export default function Home() {
  const [banners, setBanners] = useState<BannerType[]>([])
  const [bannersLoading, setBannersLoading] = useState(true)
  
  // Usar el hook para productos destacados
  const { products: featuredProducts, loading: productsLoading, error } = useProducts({ featured: true })

  // Cargar banners al montar el componente
  useEffect(() => {
    const loadBanners = async () => {
      try {
        setBannersLoading(true)
        const bannersData = await getBanners()
        setBanners(bannersData)
      } catch (error) {
        console.error('Error loading banners:', error)
      } finally {
        setBannersLoading(false)
      }
    }

    loadBanners()
  }, [])

  return (
    <div className="min-h-screen">
      <ConnectionStatus />

      {/* Hero Banners */}
      <section className="container mx-auto px-4 py-8">
        {bannersLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners
              .filter((banner) => banner.active)
              .map((banner) => (
                <Banner key={banner.id} banner={banner} />
              ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Productos Destacados</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Descubre nuestra selección especial de productos
          </p>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="h-48 bg-gray-200 rounded-md animate-pulse mb-4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

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
}
EOF
show_message "app/page.tsx restaurado"

# 4. Restaurar app/productos/page.tsx
echo "📄 Restaurando app/productos/page.tsx..."
cat > app/productos/page.tsx << 'EOF'
"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "../components/ProductCard"
import { useProducts } from "../hooks/useProducts"
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

  // Usar el hook para obtener productos con filtros
  const { products: allProducts, loading, error } = useProducts({
    search: filters.search || undefined,
    category: filters.category !== "all" ? filters.category : undefined,
    brand: filters.brand !== "all" ? filters.brand : undefined,
    inStock: filters.inStock || undefined,
  })

  const filteredProducts = useMemo(() => {
    let filtered = [...allProducts]

    // Filtros adicionales del frontend
    if (filters.minPrice && !isNaN(Number(filters.minPrice))) {
      filtered = filtered.filter(product => product.price >= Number(filters.minPrice))
    }
    if (filters.maxPrice && !isNaN(Number(filters.maxPrice))) {
      filtered = filtered.filter(product => product.price <= Number(filters.maxPrice))
    }

    // Ordenamiento
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating)
        break
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
    }

    return filtered
  }, [allProducts, filters.minPrice, filters.maxPrice, sortBy])

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

  return (
    <div className="container mx-auto px-4 py-8">
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

          <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
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
                  <SelectItem value="ropa">Ropa</SelectItem>
                  <SelectItem value="calzado">Calzado</SelectItem>
                  <SelectItem value="accesorios">Accesorios</SelectItem>
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
            <Button variant="outline" onClick={clearFilters} className="w-full">
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
              Productos ({filteredProducts.length})
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

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">
                ⚠️ Error al cargar productos del servidor. Mostrando productos de demostración.
              </p>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
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
}
EOF
show_message "app/productos/page.tsx restaurado"

# 5. Verificar backend POS
echo "🔍 Verificando conexión con backend POS..."
if curl -s http://localhost:8000/health > /dev/null; then
    show_message "Backend POS está funcionando en puerto 8000"
    
    # Verificar productos para e-commerce
    PRODUCTS_COUNT=$(curl -s "http://localhost:8000/products?show_in_ecommerce=true" | grep -o '"id"' | wc -l)
    if [ "$PRODUCTS_COUNT" -gt 0 ]; then
        show_message "Encontrados $PRODUCTS_COUNT productos habilitados para e-commerce"
    else
        show_warning "No hay productos habilitados para e-commerce"
        echo "   Ejecuta este SQL en el backend POS:"
        echo "   UPDATE products SET show_in_ecommerce = true WHERE is_active = true;"
    fi
else
    show_warning "Backend POS no está funcionando en puerto 8000"
    echo "   Inicia el backend con: cd ../pos-cesariel && make dev"
fi

# 6. Mostrar comandos finales
echo ""
echo "🎉 Integración completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Verificar que el backend POS esté corriendo: cd ../pos-cesariel && make dev"
echo "2. Habilitar productos para e-commerce en la BD"
echo "3. Iniciar el e-commerce: npm run dev"
echo "4. Visitar: http://localhost:3001"
echo ""
echo "✅ La infraestructura de integración está lista:"
echo "   - API client configurado"
echo "   - Tipos TypeScript mapeados"
echo "   - Hooks React implementados"
echo "   - Sistema de fallback funcionando"
echo "   - Cache de 5 minutos configurado"
echo ""
show_message "¡E-commerce listo para conectarse con el POS!"
