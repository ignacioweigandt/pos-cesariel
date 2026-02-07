// React Compiler handles all optimization - no hooks needed for pure functions

interface Category {
  id: number;
  name: string;
}

/** Hook para autodetección de categorías y talles desde nombre de archivo/producto */
export function useCategoryDetection(categories: Category[]) {
  const CATEGORY_KEYWORDS = {
    Indumentaria: {
      filename: ['ropa', 'indumentaria', 'vestimenta'],
      product: [
        'remera',
        'camiseta',
        'camisa',
        'pantalon',
        'jean',
        'short',
        'vestido',
        'falda',
        'blusa',
        'campera',
        'chaqueta',
        'abrigo',
        'buzo',
        'hoodie',
        'sweater',
      ],
    },
    Calzado: {
      filename: ['calzado', 'zapatos', 'zapatillas'],
      product: [
        'zapatillas',
        'zapatos',
        'botas',
        'sandalias',
        'ojotas',
        'mocasines',
        'deportivos',
        'running',
      ],
    },
    Accesorios: {
      filename: ['accesorios', 'complementos'],
      product: [
        'collar',
        'pulsera',
        'anillo',
        'cartera',
        'bolso',
        'mochila',
        'gorro',
        'sombrero',
        'bufanda',
      ],
    },
  };

  const SIZE_KEYWORDS = [
    'remera',
    'camiseta',
    'camisa',
    'pantalon',
    'jean',
    'short',
    'vestido',
    'falda',
    'blusa',
    'campera',
    'chaqueta',
    'abrigo',
    'buzo',
    'hoodie',
    'sweater',
    'zapatillas',
    'zapatos',
    'botas',
    'sandalias',
    'deportivos',
    'running',
  ];

  // React Compiler handles optimization
  const detectCategoryFromFilename = (filename: string): string | null => {
    const name = filename.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.filename.some((keyword) => name.includes(keyword))) {
        return category;
      }
    }

    return null;
  };

  // React Compiler handles optimization
  const detectCategoryFromProduct = (productName: string): string | null => {
    const name = productName.toLowerCase();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      if (keywords.product.some((keyword) => name.includes(keyword))) {
        return category;
      }
    }

    return null;
  };

  // React Compiler handles optimization
  const hasSize = (productName: string): boolean => {
    const name = productName.toLowerCase();
    return SIZE_KEYWORDS.some((keyword) => name.includes(keyword));
  };

  // React Compiler handles optimization
  const getCategoryId = (categoryName: string | null): number | null => {
    if (!categoryName) return null;

    const category = categories.find((cat) =>
      cat.name.toLowerCase().includes(categoryName.toLowerCase())
    );
    return category?.id || null;
  };

  // React Compiler handles optimization
  const getCategoryName = (categoryId: number | null): string => {
    if (!categoryId) return 'Sin categoría';
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Sin categoría';
  };

  return {
    detectCategoryFromFilename,
    detectCategoryFromProduct,
    hasSize,
    getCategoryId,
    getCategoryName,
  };
}
