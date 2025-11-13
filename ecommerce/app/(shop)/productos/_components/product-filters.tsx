'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/src/shared/components/ui/button'
import { Input } from '@/src/shared/components/ui/input'
import { Checkbox } from '@/src/shared/components/ui/checkbox'
import { Label } from '@/src/shared/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select'
import { Filter, X } from 'lucide-react'

interface ProductFiltersProps {
  categories?: Array<{ id: number; name: string }>
  brands?: Array<{ name: string }>
}

export function ProductFilters({ categories = [], brands = [] }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)

  // Get current filters from URL
  const currentSearch = searchParams.get('buscar') || ''
  const currentCategory = searchParams.get('categoria') || 'all'
  const currentBrand = searchParams.get('marca') || 'all'
  const currentMinPrice = searchParams.get('minPrecio') || ''
  const currentMaxPrice = searchParams.get('maxPrecio') || ''
  const currentInStock = searchParams.get('enStock') === 'true'

  const updateFilters = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === '' || value === 'all' || value === false) {
      params.delete(key)
    } else {
      params.set(key, value.toString())
    }

    router.push(`/productos?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/productos', { scroll: false })
  }

  return (
    <div className="lg:w-1/4">
      {/* Mobile Filter Toggle */}
      <div className="flex items-center justify-between mb-4 lg:hidden">
        <h2 className="text-xl font-semibold">Filtros</h2>
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
          <Filter className="h-4 w-4 mr-2" />
          {showFilters ? 'Ocultar' : 'Mostrar'}
        </Button>
      </div>

      <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Search */}
        <div>
          <Label htmlFor="search" className="text-sm font-medium mb-2 block">
            Buscar
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Buscar productos..."
            defaultValue={currentSearch}
            onChange={(e) => updateFilters('buscar', e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Categoría</Label>
          <Select
            value={currentCategory}
            onValueChange={(value) => updateFilters('categoria', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las categorías" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las categorías</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Brand Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Marca</Label>
          <Select
            value={currentBrand}
            onValueChange={(value) => updateFilters('marca', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Todas las marcas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las marcas</SelectItem>
              {brands.map((brand, index) => (
                <SelectItem key={index} value={brand.name}>
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
              defaultValue={currentMinPrice}
              onChange={(e) => updateFilters('minPrecio', e.target.value)}
            />
            <Input
              type="number"
              placeholder="Máx"
              defaultValue={currentMaxPrice}
              onChange={(e) => updateFilters('maxPrecio', e.target.value)}
            />
          </div>
        </div>

        {/* Stock Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={currentInStock}
            onCheckedChange={(checked) => updateFilters('enStock', checked as boolean)}
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
  )
}
