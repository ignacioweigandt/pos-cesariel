"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ComputerDesktopIcon,
  CurrencyDollarIcon,
  RectangleStackIcon,
  ShoppingBagIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

// API imports
import {
  ecommerceAdvancedApi,
  ecommercePublicApi,
  productsApi,
  salesApi,
} from "@/lib/api";

// Component imports - Internal to feature
import DashboardTab from "./Dashboard/DashboardTab";
import ProductsTab from "./Products/ProductsTab";
import { ProductEditModal } from "./Products/ProductEditModal";
import { ProductViewModal } from "./Products/ProductViewModal";
import SalesTab from "./Sales/SalesTab";
import { SalesHistoryTab } from "./Sales/SalesHistoryTab";
import { WhatsAppSalesTab } from "./WhatsApp/WhatsAppSalesTab";
import { ContentTab } from "./Content/ContentTab";

// Component imports - Internal to ecommerce feature
import BannerManager from "./Content/BannerManager";
import LogoManager from "./Content/LogoManager";
import ProductImageManager from "./Products/ProductImageManager";
import SocialMediaManager from "./Content/SocialMediaManager";
import WhatsAppConfigModal from "./WhatsApp/WhatsAppConfigModal";
import WhatsAppSalesManager from "./WhatsApp/WhatsAppSalesManager";

// Types
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  stock?: number;
  image_url?: string;
  is_active: boolean;
  show_in_ecommerce: boolean;
  ecommerce_price?: number;
  has_sizes?: boolean;
  category?: {
    id: number;
    name: string;
  };
}

interface StoreConfig {
  store_name: string;
  store_description?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  is_active: boolean;
  tax_percentage: number;
  currency: string;
}

/**
 * EcommerceContainer Component
 *
 * Main orchestrator for the E-commerce administration interface.
 * This container manages:
 * - Tab navigation and state
 * - Product management and display
 * - Sales tracking and history
 * - WhatsApp integration
 * - Content management (banners, logos, social media)
 * - Modal states for various operations
 *
 * The container coordinates between multiple feature modules and provides
 * a unified interface for e-commerce administration.
 */
export function EcommerceContainer() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(true);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [storeConfig, setStoreConfig] = useState<StoreConfig | null>(null);
  const [stats, setStats] = useState({
    total_online_products: 0,
    total_online_sales: 0,
    conversion_rate: 0,
  });

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showProductView, setShowProductView] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Advanced feature modal states
  const [showImageManager, setShowImageManager] = useState(false);
  const [showBannerManager, setShowBannerManager] = useState(false);
  const [showLogoManager, setShowLogoManager] = useState(false);
  const [showWhatsAppSales, setShowWhatsAppSales] = useState(false);
  const [showWhatsAppConfig, setShowWhatsAppConfig] = useState(false);
  const [showSocialMediaManager, setShowSocialMediaManager] = useState(false);

  // Authentication and WebSocket states
  const [authToken, setAuthToken] = useState<string>("");
  const [userBranchId, setUserBranchId] = useState<number>(1);

  // Sales refresh trigger
  const [salesRefreshTrigger, setSalesRefreshTrigger] = useState<number>(0);

  // Refresh sales history callback
  const refreshSalesHistory = () => {
    setSalesRefreshTrigger((prev) => prev + 1);
  };

  // Initial mount and authentication
  useEffect(() => {
    setMounted(true);

    // Check authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/");
      return;
    }

    setAuthToken(token);

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setUserBranchId(parsedUser.branch_id || 1);
    }

    // Load initial data
    loadData();
  }, [router]);

  // Auto-refresh dashboard data every 30 seconds when on dashboard tab
  useEffect(() => {
    if (activeTab === "dashboard" && mounted) {
      // Initial load
      fetchStoreConfig();
      fetchStats();

      // Set up polling interval
      const interval = setInterval(() => {
        console.log("Auto-refreshing dashboard data...");
        fetchStoreConfig();
        fetchStats();
      }, 30000); // 30 seconds

      // Cleanup interval on unmount or tab change
      return () => clearInterval(interval);
    }
  }, [activeTab, mounted]);

  // Load all data
  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchProducts(), fetchStoreConfig(), fetchStats()]);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await productsApi.getProducts();
      console.log("fetchProducts response:", response);
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching products:", error);
      console.error("Error details:", error.response);
      setProducts([]);
    }
  };

  // Fetch store configuration
  const fetchStoreConfig = async () => {
    try {
      const response = await ecommercePublicApi.getStoreConfig();
      console.log("fetchStoreConfig response:", response);

      // Extract data from nested structure
      const configData = response.data?.data || response.data;

      setStoreConfig({
        store_name: configData.store_name || "Mi Tienda Online",
        store_description: configData.store_description || "Descripción de la tienda",
        contact_email: configData.contact_email || "tienda@email.com",
        contact_phone: configData.contact_phone || "+1234567890",
        address: configData.address || "Dirección de la tienda",
        is_active: configData.is_active !== undefined ? configData.is_active : true,
        tax_percentage: configData.tax_percentage || 0,
        currency: configData.currency || "ARS",
      });
    } catch (error) {
      console.error("Error fetching store config:", error);
      // Use default values on error
      setStoreConfig({
        store_name: "Mi Tienda Online",
        store_description: "Descripción de la tienda",
        contact_email: "tienda@email.com",
        contact_phone: "+1234567890",
        address: "Dirección de la tienda",
        is_active: true,
        tax_percentage: 0,
        currency: "ARS",
      });
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await ecommerceAdvancedApi.getDashboardStats();
      console.log("fetchStats response:", response);

      // Extract data from nested structure
      const statsData = response.data?.data || response.data;

      setStats({
        total_online_products: statsData.total_online_products || 0,
        total_online_sales: statsData.total_online_sales || 0,
        conversion_rate: statsData.conversion_rate || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Fallback to calculating from products
      setStats({
        total_online_products: products.filter((p) => p.show_in_ecommerce).length,
        total_online_sales: 0,
        conversion_rate: 0,
      });
    }
  };

  // Toggle product online visibility
  const toggleProductOnline = async (productId: number) => {
    try {
      const product = products.find((p) => p.id === productId);

      await productsApi.updateProduct(productId, {
        show_in_ecommerce: !product?.show_in_ecommerce,
      });

      await fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
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

  // Tab configuration
  const tabs = [
    { id: "dashboard", name: "Dashboard", icon: ChartBarIcon },
    { id: "products", name: "Productos Online", icon: ShoppingBagIcon },
    { id: "sales", name: "Ventas", icon: CurrencyDollarIcon },
    { id: "sales-history", name: "Historial de Ventas", icon: UserGroupIcon },
    {
      id: "whatsapp-sales",
      name: "Ventas WhatsApp",
      icon: ChatBubbleLeftRightIcon,
    },
    { id: "content", name: "Contenido", icon: RectangleStackIcon },
  ];

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
              <ComputerDesktopIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                E-commerce
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

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "dashboard" && (
                <DashboardTab stats={stats} storeConfig={storeConfig} />
              )}

              {activeTab === "products" && (
                <ProductsTab
                  products={products}
                  onToggleOnline={toggleProductOnline}
                  onEdit={(product) => {
                    setSelectedProduct(product);
                    setShowProductModal(true);
                  }}
                  onView={(product) => {
                    setSelectedProduct(product);
                    setShowProductView(true);
                  }}
                  onManageImages={(product) => {
                    setSelectedProduct(product);
                    setShowImageManager(true);
                  }}
                />
              )}

              {activeTab === "sales" && (
                <SalesTab onSaleCompleted={refreshSalesHistory} />
              )}

              {activeTab === "sales-history" && (
                <SalesHistoryTab refreshTrigger={salesRefreshTrigger} />
              )}

              {activeTab === "whatsapp-sales" && (
                <WhatsAppSalesTab
                  refreshTrigger={salesRefreshTrigger}
                  onShowWhatsAppConfig={() => setShowWhatsAppConfig(true)}
                />
              )}

              {activeTab === "content" && (
                <ContentTab
                  onManageBanners={() => setShowBannerManager(true)}
                  onManageLogo={() => setShowLogoManager(true)}
                  onManageSocialMedia={() => setShowSocialMediaManager(true)}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Advanced E-commerce Modals */}
      <ProductImageManager
        isOpen={showImageManager}
        onClose={() => setShowImageManager(false)}
        product={selectedProduct}
        onImagesUpdated={() => {
          // Refresh products list
          fetchProducts();
        }}
      />

      <BannerManager
        isOpen={showBannerManager}
        onClose={() => setShowBannerManager(false)}
        onBannersUpdated={() => {
          // Could refresh banner data here
          console.log("Banners updated");
        }}
      />

      <LogoManager
        isOpen={showLogoManager}
        onClose={() => setShowLogoManager(false)}
        onConfigUpdated={() => {
          console.log("Store config updated");
        }}
      />

      <SocialMediaManager
        isOpen={showSocialMediaManager}
        onClose={() => setShowSocialMediaManager(false)}
      />

      <WhatsAppSalesManager
        isOpen={showWhatsAppSales}
        onClose={() => setShowWhatsAppSales(false)}
        branchId={userBranchId}
        token={authToken}
      />

      <WhatsAppConfigModal
        isOpen={showWhatsAppConfig}
        onClose={() => setShowWhatsAppConfig(false)}
        onConfigUpdated={() => {
          console.log("WhatsApp config updated");
        }}
      />

      {/* Product Edit Modal */}
      {showProductModal && selectedProduct && (
        <ProductEditModal
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
          product={selectedProduct}
          onSave={async (updatedProduct) => {
            try {
              await productsApi.updateProduct(
                selectedProduct.id,
                updatedProduct
              );
              await fetchProducts();
              setShowProductModal(false);
            } catch (error) {
              console.error("Error updating product:", error);
            }
          }}
        />
      )}

      {/* Product View Modal */}
      {showProductView && selectedProduct && (
        <ProductViewModal
          isOpen={showProductView}
          onClose={() => setShowProductView(false)}
          product={selectedProduct}
        />
      )}
    </div>
  );
}
