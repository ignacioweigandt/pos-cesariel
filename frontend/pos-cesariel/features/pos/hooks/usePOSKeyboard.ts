"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UsePOSKeyboardOptions {
  onOpenCart?: () => void;
  showFloatingCart: boolean;
  hasCartItems: boolean;
}

/**
 * Hook for handling POS keyboard shortcuts
 *
 * Provides keyboard navigation for common POS operations:
 * - F2: Navigate to inventory
 * - Enter: Open cart (if cart has items and is not already open)
 *
 * @param options - Keyboard shortcut configuration
 */
export function usePOSKeyboard({
  onOpenCart,
  showFloatingCart,
  hasCartItems,
}: UsePOSKeyboardOptions): void {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 to navigate to inventory
      if (e.key === "F2") {
        e.preventDefault();
        router.push("/inventory");
        return;
      }

      // Enter to open cart
      if (
        e.key === "Enter" &&
        !showFloatingCart &&
        hasCartItems &&
        onOpenCart
      ) {
        // Check if user is typing in an input field
        const activeElement = document.activeElement;
        const isInputFocused =
          activeElement &&
          (activeElement.tagName === "INPUT" ||
            activeElement.tagName === "TEXTAREA" ||
            activeElement.tagName === "SELECT" ||
            activeElement.contentEditable === "true");

        // Only open cart if not typing in a field
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
