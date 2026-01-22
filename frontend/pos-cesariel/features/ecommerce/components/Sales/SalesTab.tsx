"use client";

import { useEffect, useState } from "react";
import { Product } from "../../types/ecommerce.types";
import { ecommercePublicApi } from "../../../../lib/api";
import SizeSelectorModal from "@/components/product/SizeSelectorModal";
import SaleSuccessModal from "./SaleSuccessModal";
import Toast from "@/components/feedback/Toast";

interface SalesTabProps {
  onSaleCompleted?: () => void;
}

/**
 * Sales tab component for processing confirmed e-commerce sales
 * These sales are already coordinated via WhatsApp and are marked as DELIVERED
 * Automatically deducts stock from inventory
 * Handles product selection, cart management, and sale processing
 */
export default function SalesTab({ onSaleCompleted }: SalesTabProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  // Size modal states
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableSizes, setAvailableSizes] = useState<
    { size: string; stock: number }[]
  >([]);
  const [sizesLoading, setSizesLoading] = useState(false);

  // Success modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [saleResult, setSaleResult] = useState<any>(null);

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState<{
    type: "success" | "error" | "warning" | "info";
    title: string;
    message?: string;
  }>({ type: "info", title: "" });

  useEffect(() => {
    loadProducts();
  }, []);

  const showToastMessage = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message?: string
  ) => {
    setToastConfig({ type, title, message });
    setShowToast(true);
  };

  const loadProducts = async () => {
    try {
      const response = await ecommercePublicApi.getProducts();
      const productsData = response?.data?.data || response?.data || [];

      if (Array.isArray(productsData)) {
        setProducts(
          productsData.filter((p: any) => p.is_active && p.stock > 0)
        );
      } else {
        console.error("productsData is not an array");
        setProducts([]);
      }
    } catch (error) {
      console.error("Error loading products:", error);
      setProducts([]);
    }
  };

  const loadProductSizes = async (productId: number) => {
    setSizesLoading(true);
    try {
      const response = await ecommercePublicApi.getProductSizes(productId);
      if (response.data && response.data.available_sizes) {
        setAvailableSizes(response.data.available_sizes);
      } else {
        setAvailableSizes([]);
      }
    } catch (error) {
      console.error("Error loading product sizes:", error);
      setAvailableSizes([]);
    } finally {
      setSizesLoading(false);
    }
  };

  const addToCart = async (product: any) => {
    if (product.has_sizes) {
      setSelectedProduct(product);
      await loadProductSizes(product.id);
      setShowSizeModal(true);
      return;
    }
    addProductToCart(product);
  };

  const addProductToCart = (product: any, size?: string) => {
    const itemKey = size ? `${product.id}-${size}` : product.id;
    const existingItem = cart.find((item) => item.key === itemKey);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.key === itemKey
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock || product.stock_quantity
                ),
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          key: itemKey,
          quantity: 1,
          size: size || null,
          displayName: size ? `${product.name} (Talle ${size})` : product.name,
        },
      ]);
    }
  };

  const handleSizeSelection = (size: string) => {
    if (selectedProduct) {
      addProductToCart(selectedProduct, size);
      setSelectedProduct(null);
      setAvailableSizes([]);
    }
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.key !== key));
    } else {
      setCart(
        cart.map((item) => (item.key === key ? { ...item, quantity } : item))
      );
    }
  };

  const removeFromCart = (key: string) => {
    setCart(cart.filter((item) => item.key !== key));
  };

  const getTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const processSale = async () => {
    if (cart.length === 0) {
      showToastMessage(
        "warning",
        "Carrito vacío",
        "Agregue productos al carrito antes de procesar la venta"
      );
      return;
    }

    if (!customerInfo.name.trim()) {
      showToastMessage(
        "warning",
        "Datos incompletos",
        "Ingrese el nombre del cliente"
      );
      return;
    }

    setLoading(true);
    try {
      const saleData = {
        customer_name: customerInfo.name,
        customer_email: customerInfo.email || null,
        customer_phone: customerInfo.phone || null,
        sale_type: "ECOMMERCE",
        payment_method: "EFECTIVO",
        is_confirmed: true, // Venta confirmada desde admin (ya coordinada por WhatsApp)
        items: cart.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          size: item.size || null,
        })),
      };

      const response = await ecommercePublicApi.createSale(saleData);

      setSaleResult({
        saleId: response.data.id || response.data.sale_id,
        saleNumber: response.data.sale_number,
        customerName: customerInfo.name,
        totalAmount: cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        items: cart.map((item) => ({
          name: item.displayName || item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
        })),
      });

      setShowSuccessModal(true);
      setCart([]);
      setCustomerInfo({ name: "", email: "", phone: "" });
      await loadProducts();

      if (onSaleCompleted) {
        onSaleCompleted();
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      setSaleResult({
        saleId: null,
        saleNumber: "ERROR",
        customerName: customerInfo.name,
        totalAmount: 0,
        items: [],
        error: "Error procesando la venta. Por favor, intente nuevamente.",
      });
      setShowSuccessModal(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Ventas E-commerce
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Procese ventas coordinadas por WhatsApp - Se marcan como completadas y descuentan stock automáticamente
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Productos Disponibles
              </h3>

              {/* Search */}
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {product.name}
                      </h4>
                      <span className="text-sm font-bold text-green-600">
                        ${product.price}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-gray-500">
                        Stock: {product.stock || product.stock_quantity}
                      </p>
                      {product.has_sizes && (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          Con talles
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      disabled={(product.stock || product.stock_quantity) === 0}
                      className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      {product.has_sizes
                        ? "Seleccionar Talle"
                        : "Agregar al Carrito"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Carrito de Compras
              </h3>

              {/* Customer Info */}
              <div className="mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del cliente *"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
                <input
                  type="email"
                  placeholder="Email (opcional)"
                  value={customerInfo.email}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
                <input
                  type="tel"
                  placeholder="Teléfono (opcional)"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                />
              </div>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.displayName || item.name}
                      </p>
                      <p className="text-xs text-gray-900">${item.price} c/u</p>
                      {item.size && (
                        <p className="text-xs text-blue-600">
                          Talle: {item.size}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity - 1)
                        }
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        -
                      </button>
                      <span className="text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.key, item.quantity + 1)
                        }
                        className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(item.key)}
                        className="px-2 py-1 text-xs bg-red-200 text-red-700 rounded hover:bg-red-300"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-lg font-medium text-gray-900">
                    Total:
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    ${getTotal().toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={processSale}
                  disabled={loading || cart.length === 0}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                  {loading ? "Procesando..." : "Procesar Venta"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SizeSelectorModal
        isOpen={showSizeModal}
        onClose={() => {
          setShowSizeModal(false);
          setSelectedProduct(null);
          setAvailableSizes([]);
        }}
        onConfirm={handleSizeSelection}
        productName={selectedProduct?.name || ""}
        availableSizes={availableSizes}
        loading={sizesLoading}
      />

      <SaleSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSaleResult(null);
        }}
        saleData={saleResult}
        saleType="ECOMMERCE"
      />

      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        type={toastConfig.type}
        title={toastConfig.title}
        message={toastConfig.message}
      />
    </div>
  );
}
