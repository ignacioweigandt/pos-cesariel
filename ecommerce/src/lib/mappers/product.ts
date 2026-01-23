// Mappers: API types to Frontend models
import type { ApiProduct, ApiPublicProduct, Product } from '@/types';

export function mapApiProductToFrontend(apiProduct: ApiProduct): Product {
  // Determinar categoría basada en category_id
  let category = 'otros';

  if (apiProduct.category?.name) {
    const categoryName = apiProduct.category.name.toLowerCase();
    if (categoryName.includes('ropa') || categoryName.includes('indumentaria')) {
      category = 'ropa';
    } else if (categoryName.includes('calzado') || categoryName.includes('zapato')) {
      category = 'calzado';
    } else if (categoryName.includes('accesorio')) {
      category = 'accesorios';
    }
  }

  // Obtener marca del objeto brand (nuevo sistema) o null
  const brand = apiProduct.brand || null;

  // Generar talles basados en categoría y si tiene talles
  let sizes: string[] = ['Único'];
  if (apiProduct.has_sizes) {
    if (category === 'calzado') {
      sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else if (category === 'ropa') {
      sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  }

  // Generar imágenes
  // Si hay imágenes en la relación, usarlas
  // Si no, usar image_url si existe
  // Si no hay ninguna, dejar vacío para que ProductCard cargue desde la API
  const images = apiProduct.images && apiProduct.images.length > 0
    ? apiProduct.images.map(img => img.image_url)
    : apiProduct.image_url
      ? [apiProduct.image_url]
      : [];

  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description || 'Sin descripción disponible',
    price: apiProduct.ecommerce_price || apiProduct.price,
    originalPrice: apiProduct.ecommerce_price && apiProduct.ecommerce_price < apiProduct.price
      ? apiProduct.price
      : undefined,
    images: images.slice(0, 3), // Máximo 3 imágenes
    category,
    brand,
    sizes,
    colors: ['Negro', 'Blanco'], // Por defecto, se puede expandir más tarde
    featured: false,
    inStock: (apiProduct.stock_quantity || apiProduct.stock || 0) > 0,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    has_sizes: apiProduct.has_sizes
  };
}

// Mapper for public product endpoint (/ecommerce/products)
// Note: This endpoint does NOT include category object or images array
// Only category_id and image_url (string) are provided
export function mapApiPublicProductToFrontend(apiProduct: ApiPublicProduct): Product {
  // Determinar categoría basada en el nombre del producto
  // (el backend no incluye el objeto category en /ecommerce/products)
  let category = 'otros';

  const nameLower = apiProduct.name.toLowerCase();
  const descLower = (apiProduct.description || '').toLowerCase();

  // Detectar categoría del nombre/descripción
  if (nameLower.includes('zapatilla') || nameLower.includes('zapato') ||
      nameLower.includes('calzado') || descLower.includes('calzado')) {
    category = 'calzado';
  } else if (nameLower.includes('remera') || nameLower.includes('camiseta') ||
             nameLower.includes('pantalon') || nameLower.includes('short') ||
             nameLower.includes('buzo') || nameLower.includes('campera') ||
             descLower.includes('ropa') || descLower.includes('indumentaria')) {
    category = 'ropa';
  } else if (nameLower.includes('gorra') || nameLower.includes('mochila') ||
             nameLower.includes('medias') || nameLower.includes('accesorio')) {
    category = 'accesorios';
  }

  // Obtener marca del objeto brand (nuevo sistema) o null
  const brand = apiProduct.brand || null;

  // Generar talles basados en categoría y si tiene talles
  let sizes: string[] = ['Único'];
  if (apiProduct.has_sizes) {
    if (category === 'calzado') {
      sizes = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else if (category === 'ropa') {
      sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
  }

  // Generar array de imágenes
  // El backend solo devuelve image_url (string), no un array de imágenes
  // Si no hay image_url, dejamos el array vacío para que ProductCard
  // haga la llamada a /ecommerce/products/{id}/images y obtenga las imágenes de ProductImage
  const images = apiProduct.image_url
    ? [apiProduct.image_url]
    : [];

  return {
    id: apiProduct.id.toString(),
    name: apiProduct.name,
    description: apiProduct.description || 'Sin descripción disponible',
    price: apiProduct.price,
    originalPrice: undefined,
    images: images.slice(0, 3),
    category,
    brand,
    sizes,
    colors: ['Negro', 'Blanco'],
    featured: apiProduct.featured,
    inStock: apiProduct.stock > 0,
    rating: 4.5,
    reviews: Math.floor(Math.random() * 100) + 10,
    has_sizes: apiProduct.has_sizes
  };
}
