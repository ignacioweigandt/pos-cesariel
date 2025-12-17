'use client';

import Image from 'next/image';
import { Label } from '@/components/ui/label';

interface BannerPreviewProps {
  imageUrl: string;
}

export function BannerPreview({ imageUrl }: BannerPreviewProps) {
  return (
    <div className="space-y-2">
      <Label className="text-black">Vista Previa</Label>
      <div className="relative">
        <Image
          src={imageUrl}
          alt="Preview"
          width={600}
          height={200}
          className="w-full h-48 object-cover rounded border"
        />
      </div>
    </div>
  );
}
