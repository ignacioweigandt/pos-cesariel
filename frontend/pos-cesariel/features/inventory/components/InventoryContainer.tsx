'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeftIcon,
  CubeIcon,
  BuildingStorefrontIcon,
  DocumentArrowUpIcon,
  TagIcon,
  PlusIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useBarcodeScanner } from '@/lib/useBarcodeScanner';
import { apiClient } from '@/shared/api/client';
import { useAuth } from '@/shared/hooks/useAuth';

// Components
import { InventoryStatsCards } from './Stats/InventoryStatsCards';
import { ProductFilters } from './ProductList/ProductFilters';
import { ProductList } from './ProductList/ProductList';
import { ProductFormModal } from './ProductForms/ProductFormModal';
import { CategoryFormModal } from './ProductForms/CategoryFormModal';
import { BrandFormModal } from './ProductForms/BrandFormModal';
import { StockAdjustmentModal } from './Modals/StockAdjustmentModal';
import { DeleteConfirmationModal } from './Modals/DeleteConfirmationModal';
import { BulkPriceUpdateModal } from './Modals/BulkPriceUpdateModal';
import ImportModal from './Import/ImportModal';
import SizeStockModal from './StockManagement/SizeStockModal';

// Hooks
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { useProductFilters } from '../hooks/useProductFilters';
import { useMultiBranchStock } from '../hooks/useMultiBranchStock';

// Utils
import { calculateInventoryStats } from '../utils/stockCalculations';

// Types
import type { Product, Category } from '../types/inventory.types';

/**
 * InventoryContainer Component
 *
 * Main container for inventory management that orchestrates:
 * - Product and category CRUD operations
 * - Stock management (single and multi-branch)
 * - Product filtering and search
 * - Import functionality
 * - Size/variant management
 */
export function InventoryContainer() {
  const router = useRouter();

  // Get user from Zustand store
  const { user, isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  // Data hooks
  const {
    products,
    loading: productsLoading,
    loadProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
  } = useProducts();

  const {
    categories,
    loadCategories,
    createCategory,
    updateCategory,
  } = useCategories();

  const {
    brands,
    loadBrands,
    createBrand,
    updateBrand,
    deleteBrand,
  } = useBrands();

  const { filteredProducts, filters, setFilters } = useProductFilters(products);

  const {
    multiBranchProducts,
    loadMultiBranchStock,
  } = useMultiBranchStock();

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSizeStockModal, setShowSizeStockModal] = useState(false);
  const [showMultiBranchView, setShowMultiBranchView] = useState(false);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);

  // Selected items for modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [deleteProductItem, setDeleteProductItem] = useState<Product | null>(null);
  const [sizeStockProduct, setSizeStockProduct] = useState<Product | null>(null);

  // Other states
  const [isDeleting, setIsDeleting] = useState(false);
  const [scannerEnabled, setScannerEnabled] = useState(true);

  // Barcode scanner
  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      try {
        const response = await apiClient.get(
          `/products/barcode/${barcode}`
        );

        const product = response.data;
        setFilters({ ...filters, searchTerm: product.name });
        alert(`📦 Producto encontrado: ${product.name}`);
      } catch (error: any) {
        console.error('Error searching product by barcode:', error);
        if (error.response?.status === 404) {
          alert(`❌ No se encontró producto con código: ${barcode}`);
        } else {
          alert('Error de conexión al buscar el producto');
        }
      }
    },
    [filters, setFilters]
  );

  const { isScanning, currentBuffer } = useBarcodeScanner({
    onBarcodeDetected: handleBarcodeDetected,
    enabled: scannerEnabled,
  });

  // Check authentication first
  useEffect(() => {
    if (authChecked) return;

    // Check if user is in localStorage
    const token = localStorage.getItem('token');
    if (!token && !user) {
      router.push('/');
      return;
    }

    setAuthChecked(true);
  }, [user, router, authChecked]);

  // Initial load
  useEffect(() => {
    if (!authChecked) return;

    setMounted(true);

    const loadData = async () => {
      try {
        await Promise.all([loadProducts(), loadCategories(), loadBrands()]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [authChecked, loadProducts, loadCategories, loadBrands]);

  // Load multi-branch data when view is toggled
  useEffect(() => {
    if (showMultiBranchView) {
      loadMultiBranchStock();
    }
  }, [showMultiBranchView, loadMultiBranchStock]);

  // Modal handlers
  const openNewProductModal = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const openEditCategoryModal = (category: Category) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const openNewBrandModal = () => {
    setEditingBrand(null);
    setShowBrandModal(true);
  };

  const openEditBrandModal = (brand: any) => {
    setEditingBrand(brand);
    setShowBrandModal(true);
  };

  const openStockModal = (product: Product) => {
    setStockProduct(product);
    setShowStockModal(true);
  };

  const openDeleteModal = (product: Product) => {
    setDeleteProductItem(product);
    setShowDeleteModal(true);
  };

  const openSizeStockModal = (product: Product) => {
    setSizeStockProduct(product);
    setShowSizeStockModal(true);
  };

  // Save handlers
  const handleProductSave = async (productData: any) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await createProduct(productData);
    }
  };

  const handleCategorySave = async (categoryData: any) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, categoryData);
    } else {
      await createCategory(categoryData);
    }
  };

  const handleBrandSave = async (brandData: any) => {
    if (editingBrand) {
      await updateBrand(editingBrand.id, brandData);
    } else {
      await createBrand(brandData);
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    try {
      // Use apiClient directly since useCategories doesn't expose delete
      await apiClient.delete(`/categories/${categoryId}`);
      // Reload categories after successful deletion
      await loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const handleBrandDelete = async (brandId: number) => {
    try {
      // Use deleteBrand from useBrands hook
      await deleteBrand(brandId);
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  };

  const handleStockSave = async (stockData: { new_stock: number; notes: string }) => {
    if (stockProduct) {
      await adjustStock(stockProduct.id, stockData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductItem) return;

    setIsDeleting(true);
    try {
      await deleteProduct(deleteProductItem.id);
      setShowDeleteModal(false);
      setDeleteProductItem(null);
    } catch (error) {
      console.error('Error deleting product:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleImportSuccess = () => {
    loadProducts();
  };

  const handleSizeStockSuccess = () => {
    loadProducts();
  };

  const handleBulkPriceSuccess = () => {
    loadProducts();
  };

  // Calculate stats
  const stats = calculateInventoryStats(products, categories.length, brands.length);

  // Helper function to check if user is seller
  const isSeller = user?.role?.toUpperCase() === 'SELLER';

  // Debug log
  useEffect(() => {
    if (user) {
      console.log('📌 [InventoryContainer] User role:', user.role, '| Is Seller:', isSeller);
    }
  }, [user, isSeller]);

  if (!mounted || !authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <CubeIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Inventario
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {user?.full_name} - {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gestión de productos, categorías y stock
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-blue-600">
                    Presione{' '}
                    <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">
                      F2
                    </kbd>{' '}
                    para ir al POS ·
                    <kbd className="px-1 py-0.5 bg-green-200 rounded text-xs ml-1">
                      F3
                    </kbd>{' '}
                    para escáner
                  </p>
                  <p className="text-xs text-green-600">
                    {scannerEnabled ? (
                      <>
                        📱 Escáner activo - Escanee códigos de barras para
                        buscar productos
                      </>
                    ) : (
                      <>
                        📱 Escáner desactivado - Presione F3 o haga clic en el
                        botón &quot;Escáner&quot;
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowMultiBranchView(!showMultiBranchView)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <BuildingStorefrontIcon className="h-4 w-4 mr-2" />
                  {showMultiBranchView
                    ? 'Vista Normal'
                    : 'Vista Multi-Sucursal'}
                </button>

                {/* Actualizar Precios - Deshabilitado para SELLER */}
                <button
                  onClick={(e) => {
                    if (isSeller) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setShowBulkPriceModal(true);
                  }}
                  disabled={isSeller}
                  title={isSeller ? 'No tienes permisos para actualizar precios' : 'Actualizar precios de productos'}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    isSeller
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                  Actualizar Precios
                </button>

                {/* Importar - Deshabilitado para SELLER */}
                <button
                  onClick={(e) => {
                    if (isSeller) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    setShowImportModal(true);
                  }}
                  disabled={isSeller}
                  title={isSeller ? 'No tienes permisos para importar productos' : 'Importar productos desde archivo'}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    isSeller
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <DocumentArrowUpIcon className="h-4 w-4 mr-2" />
                  Importar
                </button>

                {/* Nueva Categoría - Deshabilitado para SELLER */}
                <button
                  onClick={(e) => {
                    if (isSeller) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    openNewCategoryModal();
                  }}
                  disabled={isSeller}
                  title={isSeller ? 'No tienes permisos para crear categorías' : 'Crear nueva categoría'}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium ${
                    isSeller
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                      : 'text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <TagIcon className="h-4 w-4 mr-2" />
                  Nueva Categoría
                </button>

                {/* Nuevo Producto - Deshabilitado para SELLER */}
                <button
                  onClick={(e) => {
                    if (isSeller) {
                      e.preventDefault();
                      e.stopPropagation();
                      return;
                    }
                    openNewProductModal();
                  }}
                  disabled={isSeller}
                  title={isSeller ? 'No tienes permisos para crear productos' : 'Crear nuevo producto'}
                  className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
                    isSeller
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
                      : 'text-white bg-indigo-600 hover:bg-indigo-700 cursor-pointer'
                  }`}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nuevo Producto
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <InventoryStatsCards stats={stats} />

            {/* Filters */}
            <ProductFilters
              filters={filters}
              onFiltersChange={setFilters}
              categories={categories}
              brands={brands}
              scannerEnabled={scannerEnabled}
              onScannerToggle={() => setScannerEnabled(!scannerEnabled)}
              isScanning={isScanning}
              currentBuffer={currentBuffer}
            />

            {/* Product List */}
            <ProductList
              products={filteredProducts}
              multiBranchProducts={multiBranchProducts}
              showMultiBranchView={showMultiBranchView}
              loading={productsLoading}
              onEdit={openEditProductModal}
              onDelete={openDeleteModal}
              onAdjustStock={openStockModal}
              onManageSizes={openSizeStockModal}
              userRole={user?.role}
              isSeller={isSeller}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProductFormModal
        isOpen={showProductModal}
        product={editingProduct}
        categories={categories}
        brands={brands}
        onClose={() => {
          setShowProductModal(false);
          setEditingProduct(null);
        }}
        onSave={handleProductSave}
        onNewBrand={openNewBrandModal}
      />

      <CategoryFormModal
        isOpen={showCategoryModal}
        category={editingCategory}
        categories={categories}
        onClose={() => {
          setShowCategoryModal(false);
          setEditingCategory(null);
        }}
        onSave={handleCategorySave}
        onDelete={handleCategoryDelete}
      />

      <BrandFormModal
        isOpen={showBrandModal}
        brand={editingBrand}
        brands={brands}
        onClose={() => {
          setShowBrandModal(false);
          setEditingBrand(null);
        }}
        onSave={handleBrandSave}
        onDelete={handleBrandDelete}
      />

      <StockAdjustmentModal
        isOpen={showStockModal}
        product={stockProduct}
        onClose={() => {
          setShowStockModal(false);
          setStockProduct(null);
        }}
        onSave={handleStockSave}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        product={deleteProductItem}
        onClose={() => {
          setShowDeleteModal(false);
          setDeleteProductItem(null);
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />

      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />

      <SizeStockModal
        isOpen={showSizeStockModal}
        onClose={() => {
          setShowSizeStockModal(false);
          setSizeStockProduct(null);
        }}
        product={sizeStockProduct}
        onUpdateSuccess={handleSizeStockSuccess}
      />

      <BulkPriceUpdateModal
        isOpen={showBulkPriceModal}
        onClose={() => setShowBulkPriceModal(false)}
        brands={brands}
        onSuccess={handleBulkPriceSuccess}
      />
    </div>
  );
}
