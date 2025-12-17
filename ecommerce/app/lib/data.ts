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
