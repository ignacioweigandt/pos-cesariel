"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import ProductCard from "@/src/shared/components/ProductCard"
import { useProducts } from "@/src/shared/hooks/useProducts"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import { Checkbox } from "@/src/shared/components/ui/checkbox"
import { Label } from "@/src/shared/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/shared/components/ui/select"
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
