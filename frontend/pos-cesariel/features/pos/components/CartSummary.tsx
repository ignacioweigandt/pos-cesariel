"use client";

import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import type { CartItem } from "../types/pos.types";
import { formatCurrency } from "../utils/cartCalculations";

interface CartSummaryProps {
  cartItems: CartItem[];
  total: number;
  onOpenCart: () => void;
}

/**
 * Cart summary component for sidebar display
 *
 * Shows a compact preview of cart items with total and checkout button.
 * Displays in the right sidebar of the POS interface.
 */
export function CartSummary({
  cartItems,
  total,
  onOpenCart,
}: CartSummaryProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-black">Resumen del Carrito</h2>
        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
          {cartItems.length} items
        </span>
      </div>

      {/* Cart Items Preview */}
      <div className="space-y-2 max-h-48 overflow-y-auto mb-4">
        {cartItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ShoppingCartIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p className="text-black">Carrito vacío</p>
            <p className="text-xs text-gray-400 mt-1">
              Haga clic en un producto para agregarlo
            </p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border-b border-gray-100 pb-2"
            >
              <div className="flex-1">
                <h4 className="text-sm font-medium text-black">
                  {item.product.name}
                  {item.size && (
                    <span className="text-xs text-gray-500 ml-1">
                      (Talle: {item.size})
                    </span>
                  )}
                </h4>
                <p className="text-xs text-gray-600">
                  {item.quantity} x {formatCurrency(Number(item.price))}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-black">
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Total */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-lg font-bold">
            <span className="text-black">Total:</span>
            <span className="text-black">{formatCurrency(total)}</span>
          </div>
        </div>
      )}

      {/* Action Button */}
      {cartItems.length > 0 && (
        <div className="mt-6">
          <button
            onClick={onOpenCart}
            className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            <ShoppingCartIcon className="h-5 w-5 mr-2" />
            Abrir Carrito (Enter)
          </button>

          <p className="text-xs text-center text-gray-500 mt-2">
            También puede presionar Enter para abrir el carrito
          </p>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-black mb-2">Instrucciones:</h3>
        <ul className="text-xs text-gray-700 space-y-1">
          <li>• Haga clic en un producto para agregarlo al carrito</li>
          <li>• Use un escáner láser - se detecta automáticamente</li>
          <li>
            • Presione{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">
              Enter
            </kbd>{" "}
            para abrir el carrito flotante
          </li>
          <li>• Use las flechas del teclado para navegar en el carrito</li>
          <li>
            • Presione{" "}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">ESC</kbd>{" "}
            para cerrar el carrito
          </li>
          <li>
            • Presione{" "}
            <kbd className="px-1 py-0.5 bg-blue-200 rounded text-xs">F2</kbd>{" "}
            para ir a Inventario
          </li>
        </ul>
      </div>
    </div>
  );
}
