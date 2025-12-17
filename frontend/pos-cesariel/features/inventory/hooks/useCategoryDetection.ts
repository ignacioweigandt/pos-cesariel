import { useCallback } from 'react';

interface Category {
  id: number;
  name: string;
}

/**
 * Hook para detección inteligente de categorías
 */
export function useCategoryDetection(categories: Category[]) {
  // Mapas optimizados para detección de categorías
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

  const detectCategoryFromFilename = useCallback(
    (filename: string): string | null => {
      const name = filename.toLowerCase();

      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.filename.some((keyword) => name.includes(keyword))) {
          return category;
        }
      }

      return null;
    },
    []
  );

  const detectCategoryFromProduct = useCallback(
    (productName: string): string | null => {
      const name = productName.toLowerCase();

      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.product.some((keyword) => name.includes(keyword))) {
          return category;
        }
      }

      return null;
    },
    []
  );

  const hasSize = useCallback((productName: string): boolean => {
    const name = productName.toLowerCase();
    return SIZE_KEYWORDS.some((keyword) => name.includes(keyword));
  }, []);

  const getCategoryId = useCallback(
    (categoryName: string | null): number | null => {
      if (!categoryName) return null;

      const category = categories.find((cat) =>
        cat.name.toLowerCase().includes(categoryName.toLowerCase())
      );
      return category?.id || null;
    },
    [categories]
  );

  const getCategoryName = useCallback(
    (categoryId: number | null): string => {
      if (!categoryId) return 'Sin categoría';
      const category = categories.find((cat) => cat.id === categoryId);
      return category ? category.name : 'Sin categoría';
    },
    [categories]
  );

  return {
    detectCategoryFromFilename,
    detectCategoryFromProduct,
    hasSize,
    getCategoryId,
    getCategoryName,
  };
}
