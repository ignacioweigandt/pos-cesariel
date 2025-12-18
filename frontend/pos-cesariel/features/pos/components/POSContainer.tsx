"use client";

import { canAccessModule, useAuth } from "@/lib/auth";
import { configApi } from "@/lib/api";
import { apiClient } from "@/shared/api/client";
import { usePOSWebSocket } from "@/lib/websocket";
import {
  ArrowLeftIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import FloatingCart from "./Cart/FloatingCart";
import SaleConfirmation from "./Modals/SaleConfirmation";
import SizeSelectorModal from "@/components/product/SizeSelectorModal";
import { CartSummary } from "./CartSummary";
import { ProductGrid } from "./ProductGrid/ProductGrid";
import { ProductSearch } from "./ProductGrid/ProductSearch";
import { useCart } from "../hooks/useCart";
import { useBarcodeScanner } from "../hooks/useBarcodeScanner";
import { usePOSKeyboard } from "../hooks/usePOSKeyboard";
import { useProductSearch } from "../hooks/useProductSearch";
import { useSaleProcessing } from "../hooks/useSaleProcessing";
import type {
  InventoryChangeMessage,
  PaymentConfig,
  Product,
  ProductSize,
} from "../types/pos.types";

/**
 * Main POS Container Component
 *
 * Orchestrates the entire Point of Sale interface including:
 * - Product search and selection
 * - Shopping cart management
 * - Barcode scanning
 * - Size selection for products with variants
 * - Sale processing and payment
 * - Real-time inventory updates via WebSocket
 */
export function POSContainer() {
  const router = useRouter();
  const { user, token, isAuthenticated } = useAuth();

  // Component state
  const [mounted, setMounted] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [showSaleConfirmation, setShowSaleConfirmation] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableSizes, setAvailableSizes] = useState<ProductSize[]>([]);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [lastSaleData, setLastSaleData] = useState<any>(null);
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentConfig[]>([]);

  // Custom hooks
  const {
    cartItems,
    addToCart,
    addToCartWithSize,
    removeFromCart,
    updateQuantity,
    clearCart,
    total,
  } = useCart();

  const {
    products,
    loading,
    searchTerm,
    setSearchTerm,
    filteredProducts,
    refetchProducts,
  } = useProductSearch(token);

  const { processing, processSale: processSaleHook } = useSaleProcessing();

  // WebSocket for real-time inventory updates
  const branchId = user?.branch_id || 1;
  const shouldConnectWebSocket = false; // Temporarily disabled
  const { lastMessage } = usePOSWebSocket(
    branchId,
    token || "",
    shouldConnectWebSocket
  );

  // Barcode scanner handler
  const handleBarcodeDetected = useCallback(
    async (barcode: string) => {
      try {
        const response = await apiClient.get(
          `/products/barcode/${barcode}`
        );

        const product = response.data;
        handleProductSelect(product);
        toast.success(`Producto encontrado: ${product.name}`);
      } catch (error: any) {
        console.error("Error searching product by barcode:", error);
        if (error.response?.status === 404) {
          toast.error(`No se encontró producto con código: ${barcode}`);
        } else {
          toast.error("Error de conexión al buscar el producto");
        }
      }
    },
    [token]
  );

  // Activate barcode scanner
  const { isScanning, currentBuffer } = useBarcodeScanner({
    onBarcodeDetected: handleBarcodeDetected,
    enabled: true,
  });

  // Keyboard shortcuts
  usePOSKeyboard({
    onOpenCart: () => setShowFloatingCart(true),
    showFloatingCart,
    hasCartItems: cartItems.length > 0,
  });

  // Initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Authentication and permission check
  useEffect(() => {
    if (!mounted) return;

    if (!isAuthenticated || !token) {
      router.push("/");
      return;
    }

    if (!canAccessModule(user, "pos")) {
      console.log("POS Page: Access denied - insufficient permissions");
      router.push("/dashboard");
      return;
    }

    fetchPaymentConfigs();
  }, [router, isAuthenticated, token, mounted, user]);

  // Handle real-time inventory updates via WebSocket
  useEffect(() => {
    if (!lastMessage) return;

    const message = lastMessage as InventoryChangeMessage;
    if (message.type === "inventory_change") {
      // Update products list with new stock
      refetchProducts();

      // Update cart items if affected
      const affectedCartItem = cartItems.find(
        (item) => item.product.id === message.product_id
      );
      if (affectedCartItem) {
        toast.info(
          `Stock actualizado para ${affectedCartItem.product.name}: ${message.new_stock}`
        );
      }
    }
  }, [lastMessage, cartItems, refetchProducts]);

  /**
   * Fetch payment configurations from backend
   * Combines standard payment configs with custom installments
   */
  const fetchPaymentConfigs = async () => {
    try {
      // Fetch both standard configs and custom installments in parallel
      const [standardResponse, customInstallmentsResponse] = await Promise.all([
        configApi.getPaymentConfigs(),
        configApi.getCustomInstallments()
      ]);

      const standardConfigs = standardResponse.data || [];
      const customInstallments = customInstallmentsResponse.data || [];

      // Convert custom installments to payment config format
      const customConfigs = customInstallments
        .filter((ci: any) => ci.is_active) // Only include active installments
        .map((ci: any) => ({
          id: `custom_${ci.id}`, // Prefix to avoid ID conflicts
          payment_type: 'tarjeta',
          card_type: ci.card_type,
          installments: ci.installments,
          surcharge_percentage: ci.surcharge_percentage,
          is_active: ci.is_active,
          description: ci.description
        }));

      // Combine and deduplicate: custom installments override standard ones with same card_type + installments
      const configMap = new Map();

      // Add standard configs first
      standardConfigs.forEach((config: any) => {
        const key = `${config.card_type}_${config.installments}`;
        configMap.set(key, config);
      });

      // Override with custom configs (they have priority)
      customConfigs.forEach((config: any) => {
        const key = `${config.card_type}_${config.installments}`;
        configMap.set(key, config);
      });

      // Convert map back to array
      const allConfigs = Array.from(configMap.values());

      setPaymentConfigs(allConfigs);
    } catch (error) {
      console.error("Error fetching payment configs:", error);
      toast.error("Error cargando configuración de pagos");
      // Set empty array on error to prevent crashes
      setPaymentConfigs([]);
    }
  };

  /**
   * Handle product selection (add to cart or show size selector)
   */
  const handleProductSelect = async (product: Product) => {
    if (product.stock_quantity <= 0) {
      toast.error("Producto sin stock");
      return;
    }

    // If product has sizes, show size selection modal
    if (product.has_sizes) {
      await openSizeModal(product);
      return;
    }

    // Otherwise, add directly to cart
    addToCart(product);
  };

  /**
   * Open size selection modal and fetch available sizes
   */
  const openSizeModal = async (product: Product) => {
    setSelectedProduct(product);
    setLoadingSizes(true);
    setShowSizeModal(true);

    try {
      const response = await apiClient.get(
        `/products/${product.id}/available-sizes`
      );

      const data = response.data;
      setAvailableSizes(data.available_sizes || []);
    } catch (error) {
      console.error("Error fetching available sizes:", error);
      toast.error("Error cargando talles disponibles");
      setAvailableSizes([]);
    } finally {
      setLoadingSizes(false);
    }
  };

  /**
   * Handle size selection and add to cart
   */
  const handleSizeSelect = (size: string) => {
    if (selectedProduct) {
      addToCartWithSize(selectedProduct, size, availableSizes);
      setShowSizeModal(false);
      setSelectedProduct(null);
    }
  };

  /**
   * Handle sale processing
   */
  const handleProcessSale = async (paymentData: any) => {
    const result = await processSaleHook(
      paymentData,
      cartItems,
      user?.branch_id || 1,
      token
    );

    if (result) {
      setLastSaleData(result);
      setShowSaleConfirmation(true);
      setShowFloatingCart(false);
      clearCart();
      await refetchProducts(); // Refresh to update stock
    }
  };

  // Loading state
  if (!mounted) {
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
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-gray-500"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <ShoppingCartIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-black">
                POS - Punto de Venta
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-black">
                {user?.full_name} - {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="h-full flex flex-col lg:flex-row gap-6">
            {/* Left Panel - Product Search */}
            <div className="lg:w-3/5 space-y-4">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-medium text-black mb-4">
                  Productos
                </h2>

                <ProductSearch
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  isScanning={isScanning}
                  currentBuffer={currentBuffer}
                />

                <ProductGrid
                  products={filteredProducts}
                  loading={loading}
                  onProductSelect={handleProductSelect}
                />
              </div>
            </div>

            {/* Right Panel - Cart Summary */}
            <div className="lg:w-2/5 space-y-4">
              <CartSummary
                cartItems={cartItems}
                total={total}
                onOpenCart={() => setShowFloatingCart(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Cart Modal */}
      <FloatingCart
        isOpen={showFloatingCart}
        onClose={() => setShowFloatingCart(false)}
        cart={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        onProcessSale={handleProcessSale}
        paymentConfigs={paymentConfigs}
        processing={processing}
      />

      {/* Sale Confirmation Modal */}
      <SaleConfirmation
        isOpen={showSaleConfirmation}
        onClose={() => setShowSaleConfirmation(false)}
        saleData={lastSaleData}
      />

      {/* Size Selection Modal */}
      {showSizeModal && selectedProduct && (
        <SizeSelectorModal
          isOpen={showSizeModal}
          onClose={() => {
            setShowSizeModal(false);
            setSelectedProduct(null);
          }}
          onConfirm={handleSizeSelect}
          productName={selectedProduct.name}
          availableSizes={availableSizes.map((s) => ({
            size: s.size,
            stock: s.stock_quantity,
          }))}
          loading={loadingSizes}
        />
      )}
    </div>
  );
}
