/**
 * Utility functions for handling images from backend
 * Handles Cloudinary URLs, relative paths, and fallbacks
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get the full image URL from backend
 * - If it's a Cloudinary URL (https://res.cloudinary.com/...), use it as is
 * - If it's a relative path (/static/...), prepend API_URL
 * - If it's null/empty, return fallback
 */
export function getImageUrl(imageUrl: string | null | undefined, fallback: string = '/placeholder-product.png'): string {
  if (!imageUrl) {
    return fallback;
  }

  // If it's already a full URL (Cloudinary or other CDN)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path, prepend API URL
  if (imageUrl.startsWith('/')) {
    return `${API_URL}${imageUrl}`;
  }

  // Otherwise, assume it's a filename and prepend API URL
  return `${API_URL}/${imageUrl}`;
}

/**
 * Check if image URL is from Cloudinary
 */
export function isCloudinaryUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return url.includes('cloudinary.com');
}

/**
 * Get optimized Cloudinary URL with transformations
 * Only works for Cloudinary URLs
 */
export function getOptimizedImageUrl(
  imageUrl: string | null | undefined,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | 'auto:low' | 'auto:good' | 'auto:best';
    format?: 'auto' | 'webp' | 'jpg' | 'png';
  } = {}
): string {
  const url = getImageUrl(imageUrl);
  
  if (!isCloudinaryUrl(url)) {
    return url;
  }

  // Parse Cloudinary URL and inject transformations
  // Format: https://res.cloudinary.com/cloud_name/image/upload/v123456/path.jpg
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const transformations: string[] = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  if (transformations.length === 0) return url;

  return `${parts[0]}/upload/${transformations.join(',')}/${parts[1]}`;
}

/**
 * Validate if image URL is accessible
 * Returns true if image exists, false otherwise
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get product image or fallback
 */
export function getProductImage(product: { image_url?: string; images?: string[] }): string {
  // Priority: image_url > first image in array > fallback
  if (product.image_url) {
    return getImageUrl(product.image_url);
  }
  
  if (product.images && product.images.length > 0 && product.images[0]) {
    return getImageUrl(product.images[0]);
  }
  
  return '/placeholder.svg';
}
