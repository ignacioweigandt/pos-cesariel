// Banners API - Server-side data fetching
import { apiFetch } from './client';
import type { ApiPublicBanner, ApiResponse, Banner } from '@/types';
import { mapApiPublicBannerToFrontend } from '../mappers';

/** Fetch banners activos - retorna [] si backend offline (degradación graceful) */
export async function getBanners(): Promise<Banner[]> {
  const response = await apiFetch<ApiResponse<ApiPublicBanner[]>>(
    '/ecommerce/banners',
    {
      revalidate: 60, // Revalidate every minute for fresh banner updates
      tags: ['banners'],
    }
  );

  // Backend unavailable or error occurred
  if (!response) {
    console.info('[Banners] ℹ️  Using fallback mode - No banners will be displayed (showing FallbackHero instead)');
    return [];
  }

  // No banners configured
  if (!response.data || response.data.length === 0) {
    return [];
  }

  // Return active banners sorted by order
  return response.data
    .filter(banner => banner.active)
    .sort((a, b) => a.order - b.order)
    .map(mapApiPublicBannerToFrontend);
}
