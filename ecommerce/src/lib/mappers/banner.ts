// Banner mapper
import type { ApiBanner, ApiPublicBanner, Banner } from '@/types';

export function mapApiBannerToFrontend(apiBanner: ApiBanner): Banner {
  return {
    id: apiBanner.id.toString(),
    title: apiBanner.title,
    subtitle: apiBanner.subtitle || '',
    image: apiBanner.image_url,
    link: apiBanner.link_url || '#',
    active: apiBanner.is_active,
  };
}

// Mapper for public banner endpoint (/ecommerce/banners)
export function mapApiPublicBannerToFrontend(apiBanner: ApiPublicBanner): Banner {
  return {
    id: apiBanner.id, // Already a string
    title: apiBanner.title,
    subtitle: apiBanner.subtitle || '',
    image: apiBanner.image, // Different field name
    link: apiBanner.link || '#', // Different field name
    active: apiBanner.active, // Different field name
  };
}
