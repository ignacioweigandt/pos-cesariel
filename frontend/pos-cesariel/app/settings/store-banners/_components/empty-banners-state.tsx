'use client';

import { Button } from '@/components/ui/button';
import { CloudArrowUpIcon, PlusIcon } from '@heroicons/react/24/outline';

interface EmptyBannersStateProps {
  onCreateNew: () => void;
}

export function EmptyBannersState({ onCreateNew }: EmptyBannersStateProps) {
  return (
    <div className="col-span-full text-center py-12">
      <div className="text-black mb-4">
        <CloudArrowUpIcon className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-lg font-semibold text-black mb-2">No hay banners</h3>
      <p className="text-black mb-4">Crea tu primer banner para la tienda online</p>
      <Button onClick={onCreateNew}>
        <PlusIcon className="h-4 w-4 mr-2" />
        Crear Banner
      </Button>
    </div>
  );
}
