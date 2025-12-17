"use client";

import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import type { CartItem, Product, ProductSize } from "../types/pos.types";

interface UseCartReturn {
  cartItems: CartItem[];
  addToCart: (product: Product, size?: string, quantity?: number) => void;
  addToCartWithSize: (
    product: Product,
    size: string,
    availableSizes: ProductSize[]
  ) => void;
  removeFromCart: (cartItemId: number) => void;
  updateQuantity: (
    cartItemId: number,
    newQuantity: number,
    availableSizes?: ProductSize[]
  ) => Promise<void>;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
}

/**
 * Hook for managing shopping cart state and operations
 *
 * Provides cart management functionality including adding/removing items,
 * updating quantities, and calculating totals with tax.
 *
 * @returns Cart state and operations
 */
export function useCart(): UseCartReturn {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  /**
   * Add product to cart (for products without sizes)
   */
  const addToCart = useCallback(
    (product: Product, size?: string, quantity: number = 1) => {
      if (product.stock_quantity <= 0) {
        toast.error("Producto sin stock");
        return;
      }

      const existingItem = cartItems.find(
        (item) =>
          item.product.id === product.id &&
          (!size || item.size === size)
      );

      if (existingItem) {
        if (existingItem.quantity >= product.stock_quantity) {
          toast.error("No hay suficiente stock");
          return;
        }

        setCartItems(
          cartItems.map((item) =>
            item.product.id === product.id &&
            (!size || item.size === size)
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        );
      } else {
        setCartItems([
          ...cartItems,
          {
            id: Date.now(),
            product,
            quantity,
            price: Number(product.price),
            size,
          },
        ]);
      }

      const sizeText = size ? ` talle ${size}` : "";
      toast.success(`${product.name}${sizeText} agregado al carrito`);
    },
    [cartItems]
  );

  /**
   * Add product with size to cart (with size stock validation)
   */
  const addToCartWithSize = useCallback(
    (product: Product, size: string, availableSizes: ProductSize[]) => {
      const existingItem = cartItems.find(
        (item) => item.product.id === product.id && item.size === size
      );

      const sizeStock = availableSizes.find((s) => s.size === size);
      if (!sizeStock) {
        toast.error(`Talle ${size} no disponible`);
        return;
      }

      if (existingItem) {
        if (existingItem.quantity >= sizeStock.stock_quantity) {
          toast.error(`No hay suficiente stock para talle ${size}`);
          return;
        }

        setCartItems(
          cartItems.map((item) =>
            item.product.id === product.id && item.size === size
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCartItems([
          ...cartItems,
          {
            id: Date.now(),
            product,
            quantity: 1,
            price: Number(product.price),
            size,
          },
        ]);
      }

      toast.success(`${product.name} talle ${size} agregado al carrito`);
    },
    [cartItems]
  );

  /**
   * Remove item from cart
   */
  const removeFromCart = useCallback(
    (cartItemId: number) => {
      setCartItems(cartItems.filter((item) => item.id !== cartItemId));
    },
    [cartItems]
  );

  /**
   * Update item quantity in cart with stock validation
   */
  const updateQuantity = useCallback(
    async (
      cartItemId: number,
      newQuantity: number,
      availableSizes?: ProductSize[]
    ) => {
      if (newQuantity <= 0) {
        removeFromCart(cartItemId);
        return;
      }

      const cartItem = cartItems.find((item) => item.id === cartItemId);
      if (!cartItem) return;

      // For products with sizes, check size-specific stock
      if (cartItem.product.has_sizes && cartItem.size && availableSizes) {
        const sizeStock = availableSizes.find((s) => s.size === cartItem.size);

        if (!sizeStock || newQuantity > sizeStock.stock_quantity) {
          toast.error(`No hay suficiente stock para talle ${cartItem.size}`);
          return;
        }
      } else {
        // For products without sizes, check general stock
        if (newQuantity > cartItem.product.stock_quantity) {
          toast.error("No hay suficiente stock");
          return;
        }
      }

      setCartItems(
        cartItems.map((item) =>
          item.id === cartItemId ? { ...item, quantity: newQuantity } : item
        )
      );
    },
    [cartItems, removeFromCart]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(() => {
    setCartItems([]);
    toast.success("Carrito vaciado");
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const tax = 0; // Tax calculation can be added here if needed
  const total = subtotal + tax;
  const itemCount = cartItems.length;

  return {
    cartItems,
    addToCart,
    addToCartWithSize,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    tax,
    total,
    itemCount,
  };
}
