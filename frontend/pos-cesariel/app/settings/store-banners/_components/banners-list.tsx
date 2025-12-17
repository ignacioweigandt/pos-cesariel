'use client';

import { BannerCard } from './banner-card';
import { EmptyBannersState } from './empty-banners-state';

interface Banner {
  id: number;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  button_text: string | null;
  is_active: boolean;
  banner_order: number;
  created_at: string;
}

interface BannersListProps {
  banners: Banner[];
  onEdit: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
  onCreateNew: () => void;
}

export function BannersList({
  banners,
  onEdit,
  onToggleActive,
  onDelete,
  onCreateNew
}: BannersListProps) {
  if (banners.length === 0) {
    return <EmptyBannersState onCreateNew={onCreateNew} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {banners.map((banner) => (
        <BannerCard
          key={banner.id}
          banner={banner}
          onEdit={onEdit}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
