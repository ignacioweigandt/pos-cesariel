/**
 * Client-side API fetching utilities
 *
 * These functions work in Client Components (with "use client")
 * and fetch data from the browser, not the server.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data: T;
}

/**
 * Client-side fetch for categories
 * Works in Client Components
 */
export async function fetchCategoriesClient(): Promise<Array<{ id: number; name: string }>> {
  try {
    const response = await fetch(`${API_URL}/ecommerce/categories`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch categories:', response.status);
      return [];
    }

    const data: ApiResponse<Array<{ id: number; name: string; is_active: boolean }>> = await response.json();

    if (!data || !data.data) {
      return [];
    }

    // Filter active categories and sort by name
    return data.data
      .filter(cat => cat.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

/**
 * Client-side fetch for brands
 * Works in Client Components
 */
export async function fetchBrandsClient(): Promise<Array<{ name: string }>> {
  try {
    const response = await fetch(`${API_URL}/ecommerce/brands`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch brands:', response.status);
      return [];
    }

    const data: ApiResponse<Array<{ name: string }>> = await response.json();

    if (!data || !data.data) {
      return [];
    }

    // Return brands sorted alphabetically
    return data.data.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
}
