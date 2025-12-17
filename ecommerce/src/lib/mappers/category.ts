// Category mapper
import type { ApiCategory, Category } from '@/types';

export function mapApiCategoryToFrontend(apiCategory: ApiCategory): Category {
  return {
    id: apiCategory.id.toString(),
    name: apiCategory.name,
    slug: apiCategory.name.toLowerCase().replace(/\s+/g, '-'),
    subcategories: [],
  };
}
