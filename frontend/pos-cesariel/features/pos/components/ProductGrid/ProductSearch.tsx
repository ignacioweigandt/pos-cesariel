"use client";

import { MagnifyingGlassIcon, QrCodeIcon } from "@heroicons/react/24/outline";

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isScanning: boolean;
  currentBuffer: string;
}

/**
 * Product search component with barcode scanner indicator
 *
 * Provides a search input for filtering products by name or SKU,
 * and displays barcode scanner status.
 */
export function ProductSearch({
  searchTerm,
  onSearchChange,
  isScanning,
  currentBuffer,
}: ProductSearchProps) {
  return (
    <div className="flex gap-2 mb-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md leading-5 bg-white text-black placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Buscar productos por nombre o SKU..."
        />
      </div>

      {/* Barcode Scanner Indicator */}
      <div className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white">
        <div className="flex items-center">
          <QrCodeIcon className="h-5 w-5 text-gray-600 mr-2" />
          <div className="text-xs text-gray-600">
            {isScanning ? (
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                Escaneando...
              </div>
            ) : (
              "Escáner activo"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
