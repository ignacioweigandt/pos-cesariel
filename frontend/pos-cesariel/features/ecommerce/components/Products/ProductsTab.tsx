"use client";

import {
  EyeIcon,
  PencilIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { Product } from "../../types/ecommerce.types";
import { useProductFilters } from "../../hooks/useProductFilters";
import { ProductFilters } from "./ProductFilters";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductsTabProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  onToggleOnline: (id: number) => void;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onManageImages: (product: Product) => void;
}

/**
 * Products tab component for managing e-commerce products
 * Displays product list with actions for editing, viewing, and managing images
 */
export default function ProductsTab({
  products,
  categories,
  brands,
  onToggleOnline,
  onEdit,
  onView,
  onManageImages,
}: ProductsTabProps) {
  const safeProducts = Array.isArray(products) ? products : [];

  // Hook para filtrar productos
  const { filters, setFilters, filteredProducts } = useProductFilters(safeProducts);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Productos Online</h2>
          <p className="mt-1 text-sm text-gray-600">
            Gestiona qué productos están disponibles en tu tienda online
          </p>
        </div>
      </div>

      {/* Filtros */}
      <ProductFilters
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
        brands={brands}
      />

      {/* Products Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Producto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio POS
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado Online
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No se encontraron productos</p>
                    <p className="text-sm mt-1">
                      Intenta ajustar los filtros de búsqueda
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {product.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.description}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${Number(product.ecommerce_price || product.price).toFixed(2)}
                  {product.ecommerce_price && (
                    <div className="text-xs text-gray-500">
                      POS: ${Number(product.price).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {product.stock || product.stock_quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => onToggleOnline(product.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.show_in_ecommerce
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.show_in_ecommerce ? "Online" : "Offline"}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onManageImages(product)}
                    className="text-purple-600 hover:text-purple-900 mr-3"
                    title="Gestionar imágenes"
                  >
                    <PhotoIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onEdit(product)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Editar producto"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onView(product)}
                    className="text-green-600 hover:text-green-900"
                    title="Ver detalles"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Contador de resultados */}
      <div className="text-sm text-gray-600 text-right">
        Mostrando {filteredProducts.length} de {safeProducts.length} productos
      </div>
    </div>
  );
}
