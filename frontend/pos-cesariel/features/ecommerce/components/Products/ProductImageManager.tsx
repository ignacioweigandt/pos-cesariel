'use client';

import { useState, useEffect, useRef } from 'react';
import { ecommerceAdvancedApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  XMarkIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  image_order: number;
  alt_text?: string;
  is_main: boolean;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: number;
  name: string;
  description?: string;
}

interface ProductImageManagerProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onImagesUpdated?: () => void;
}

export default function ProductImageManager({
  isOpen,
  onClose,
  product,
  onImagesUpdated
}: ProductImageManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && product) {
      loadProductImages();
    }
  }, [isOpen, product]);

  const loadProductImages = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const response = await ecommerceAdvancedApi.getProductImages(product.id);
      setImages(response.data);
    } catch (error) {
      console.error('Error loading product images:', error);
      toast.error('Error cargando imágenes del producto');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !product) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Formato de archivo no válido. Usar: JPG, PNG, GIF, WebP');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    // Check image limit
    if (images.length >= 3) {
      toast.error('Máximo 3 imágenes por producto');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('alt_text', `${product.name} - Imagen ${images.length + 1}`);
      formData.append('is_main', images.length === 0 ? 'true' : 'false');

      const response = await ecommerceAdvancedApi.addProductImage(product.id, formData);
      
      toast.success('Imagen agregada exitosamente');
      loadProductImages();
      onImagesUpdated?.();
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.detail || 'Error subiendo imagen';
      toast.error(errorMessage);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    try {
      await ecommerceAdvancedApi.updateProductImage(imageId, { is_main: true });
      toast.success('Imagen principal actualizada');
      loadProductImages();
      onImagesUpdated?.();
    } catch (error) {
      console.error('Error setting main image:', error);
      toast.error('Error actualizando imagen principal');
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Está seguro de que desea eliminar esta imagen?')) {
      return;
    }

    try {
      await ecommerceAdvancedApi.deleteProductImage(imageId);
      toast.success('Imagen eliminada exitosamente');
      loadProductImages();
      onImagesUpdated?.();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Error eliminando imagen');
    }
  };

  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
  };

  const handleClose = () => {
    setImages([]);
    setPreviewImage(null);
    onClose();
  };

  if (!isOpen || !product) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Gestión de Imágenes
              </h3>
              <p className="text-sm text-gray-600">
                {product.name} - Máximo 3 imágenes
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* Images Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Existing Images */}
              {images.map((image) => (
                <div
                  key={image.id}
                  className="relative border-2 border-gray-200 rounded-lg overflow-hidden group hover:border-indigo-300 transition-colors"
                >
                  <div className="aspect-square relative">
                    <img
                      src={`http://localhost:8000/${image.image_url}`}
                      alt={image.alt_text || 'Product image'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    
                    {/* Main Image Indicator */}
                    {image.is_main && (
                      <div className="absolute top-2 left-2">
                        <StarIconSolid className="h-6 w-6 text-yellow-400" />
                      </div>
                    )}

                    {/* Action Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                        <button
                          onClick={() => handleImagePreview(`http://localhost:8000/${image.image_url}`)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-indigo-600"
                          title="Ver imagen"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        
                        {!image.is_main && (
                          <button
                            onClick={() => handleSetMainImage(image.id)}
                            className="p-2 bg-white rounded-full text-gray-700 hover:text-yellow-600"
                            title="Establecer como principal"
                          >
                            <StarIcon className="h-4 w-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteImage(image.id)}
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600"
                          title="Eliminar imagen"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Image Info */}
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Orden: {image.image_order}
                      </span>
                      {image.is_main && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Principal
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Upload Slot */}
              {images.length < 3 && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center hover:border-indigo-400 transition-colors cursor-pointer">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full h-full flex flex-col items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                        <span className="text-sm">Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <PhotoIcon className="h-12 w-12 mb-2" />
                        <span className="text-sm font-medium">Agregar Imagen</span>
                        <span className="text-xs text-gray-500 mt-1 px-2 text-center">
                          Clic para seleccionar<br />
                          JPG, PNG, GIF, WebP<br />
                          Máximo 5MB
                        </span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && images.length === 0 && (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No hay imágenes
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Comience agregando imágenes al producto
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              Instrucciones:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Máximo 3 imágenes por producto</li>
              <li>• Formatos soportados: JPG, PNG, GIF, WebP</li>
              <li>• Tamaño máximo: 5MB por imagen</li>
              <li>• La primera imagen se establece automáticamente como principal</li>
              <li>• Use la estrella para cambiar la imagen principal</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60">
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
            >
              <XMarkIcon className="h-8 w-8" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}