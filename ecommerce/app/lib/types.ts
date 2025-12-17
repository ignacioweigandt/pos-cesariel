export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  category: string
  brand: string
  sizes: string[]
  colors: string[]
  featured: boolean
  inStock: boolean
  rating: number
  reviews: number
  has_sizes?: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  subcategories?: Category[]
}

export interface Brand {
  id: string
  name: string
  slug: string
}

export interface Banner {
  id: string
  title: string
  subtitle: string
  image: string
  link: string
  active: boolean
}
