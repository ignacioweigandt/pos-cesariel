'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PencilIcon, EyeIcon, EyeSlashIcon, TrashIcon } from '@heroicons/react/24/outline';

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

interface BannerCardProps {
  banner: Banner;
  onEdit: (banner: Banner) => void;
  onToggleActive: (banner: Banner) => void;
  onDelete: (banner: Banner) => void;
}

export function BannerCard({ banner, onEdit, onToggleActive, onDelete }: BannerCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <Image
          src={banner.image_url}
          alt={banner.title}
          width={400}
          height={200}
          className="w-full h-48 object-cover"
        />

        {/* Estado activo/inactivo */}
        <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium ${
          banner.is_active
            ? 'bg-green-100 text-green-800'
            : 'bg-gray-100 text-black'
        }`}>
          {banner.is_active ? 'Activo' : 'Inactivo'}
        </div>

        {/* Orden */}
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          #{banner.banner_order}
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-black">{banner.title}</h3>

        {banner.subtitle && (
          <p className="text-black text-sm mb-3">{banner.subtitle}</p>
        )}

        {banner.link_url && (
          <p className="text-blue-600 text-xs mb-3 truncate">
            🔗 {banner.link_url}
          </p>
        )}

        {/* Acciones */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(banner)}
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onToggleActive(banner)}
            >
              {banner.is_active ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(banner)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>

          {banner.button_text && (
            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
              {banner.button_text}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
