"use client"

import type React from "react"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Search, ShoppingCart, Menu, X, ChevronDown } from "lucide-react"
import { useEcommerce } from "@/src/shared/providers/ecommerce-provider"
import { categories, brands } from "@/app/lib/data"
import { ecommerceApi } from "@/app/lib/api"
import { Button } from "@/src/shared/components/ui/button"
import { Input } from "@/src/shared/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/shared/components/ui/dropdown-menu"

interface StoreConfig {
  store_name: string;
  store_description: string;
  store_logo: string | null;
  contact_email: string;
  contact_phone: string;
  address: string;
  currency: string;
  tax_percentage: number;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null)
  const [isLoadingConfig, setIsLoadingConfig] = useState(true)
  const { cartState } = useEcommerce()

  // Cargar configuración de la tienda
  useEffect(() => {
    const loadStoreConfig = async () => {
      try {
        setIsLoadingConfig(true)
        const response = await ecommerceApi.getConfig()
        setStoreConfig(response.data.data)
      } catch (error) {
        console.error('Error cargando configuración de tienda:', error)
        // Usar configuración por defecto en caso de error
        setStoreConfig({
          store_name: "POS Cesariel",
          store_description: "Tu tienda online",
          store_logo: null,
          contact_email: "info@poscesariel.com",
          contact_phone: "+54 9 11 1234-5678",
          address: "Buenos Aires, Argentina",
          currency: "ARS",
          tax_percentage: 0
        })
      } finally {
        setIsLoadingConfig(false)
      }
    }

    loadStoreConfig()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/productos?buscar=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {isLoadingConfig ? (
              <div className="h-8 w-32 bg-gray-200 animate-pulse rounded"></div>
            ) : (
              <>
                {storeConfig?.store_logo ? (
                  <Image
                    src={storeConfig.store_logo}
                    alt={storeConfig.store_name}
                    width={40}
                    height={40}
                    className="h-10 w-10 object-contain"
                  />
                ) : null}
                <span className="text-2xl font-bold text-gray-800">
                  {storeConfig?.store_name || "Mi Tienda"}
                </span>
              </>
            )}
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Cart and Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/carrito" className="relative">
              <ShoppingCart className="h-6 w-6 text-gray-600" />
              {cartState.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartState.items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-8 pb-4">
          <Link href="/" className="text-gray-600 hover:text-gray-800">
            Inicio
          </Link>

          {/* Categories Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-gray-800">
              Categorías <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {categories.map((category) => (
                <div key={category.id}>
                  <DropdownMenuItem asChild>
                    <Link href={`/productos?categoria=${category.slug}`} className="font-medium">
                      {category.name}
                    </Link>
                  </DropdownMenuItem>
                  {category.subcategories && (
                    <>
                      {category.subcategories.map((sub) => (
                        <DropdownMenuItem key={sub.id} asChild>
                          <Link href={`/productos?categoria=${sub.slug}`} className="pl-4 text-sm">
                            {sub.name}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </>
                  )}
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Brands Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center text-gray-600 hover:text-gray-800">
              Marcas <ChevronDown className="ml-1 h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {brands.map((brand) => (
                <DropdownMenuItem key={brand.id} asChild>
                  <Link href={`/productos?marca=${brand.slug}`}>{brand.name}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/productos" className="text-gray-600 hover:text-gray-800">
            Todos los Productos
          </Link>

          <Link href="/contacto" className="text-gray-600 hover:text-gray-800">
            Contacto
          </Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            <nav className="space-y-2">
              <Link href="/" className="block py-2 text-gray-600">
                Inicio
              </Link>
              <Link href="/productos" className="block py-2 text-gray-600">
                Todos los Productos
              </Link>
              
              <Link href="/contacto" className="block py-2 text-gray-600">
                Contacto
              </Link>

              <div className="py-2">
                <div className="font-medium text-gray-800 mb-2">Categorías</div>
                {categories.map((category) => (
                  <div key={category.id} className="ml-4">
                    <Link href={`/productos?categoria=${category.slug}`} className="block py-1 text-gray-600">
                      {category.name}
                    </Link>
                    {category.subcategories && (
                      <div className="ml-4">
                        {category.subcategories.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/productos?categoria=${sub.slug}`}
                            className="block py-1 text-sm text-gray-500"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="py-2">
                <div className="font-medium text-gray-800 mb-2">Marcas</div>
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/productos?marca=${brand.slug}`}
                    className="block py-1 ml-4 text-gray-600"
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
