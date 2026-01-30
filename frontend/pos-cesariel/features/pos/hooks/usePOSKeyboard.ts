"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UsePOSKeyboardOptions {
  onOpenCart?: () => void;
  showFloatingCart: boolean;
  hasCartItems: boolean;
}

/** Hook de atajos de teclado del POS: F2 (inventario), Enter (abrir carrito) */
export function usePOSKeyboard({
  onOpenCart,
  showFloatingCart,
  hasCartItems,
}: UsePOSKeyboardOptions): void {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        router.push("/inventory");
        return;
      }

      if (
        e.key === "Enter" &&
        !showFloatingCart &&
        hasCartItems &&
        onOpenCart
      ) {
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "SELECT" ||
            activeElement.contentEditable === "true");

        if (!isInputFocused) {
          e.preventDefault();
          onOpenCart();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showFloatingCart, hasCartItems, onOpenCart, router]);
}
