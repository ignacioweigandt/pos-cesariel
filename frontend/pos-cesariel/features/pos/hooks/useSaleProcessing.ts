"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import type {
  CartItem,
  PaymentData,
  SaleConfirmationData,
  SaleData,
} from "../types/pos.types";

interface UseSaleProcessingReturn {
  processing: boolean;
  processSale: (
    paymentData: PaymentData,
    cartItems: CartItem[],
    branchId: number,
    token: string | null
  ) => Promise<SaleConfirmationData | null>;
}

/**
 * Hook for processing sales and submitting to backend
 *
 * Handles sale submission, payment processing, and error handling
 *
 * @returns Sale processing state and function
 */
export function useSaleProcessing(): UseSaleProcessingReturn {
  const [processing, setProcessing] = useState(false);

  /**
   * Process sale and submit to backend
   */
  const processSale = async (
    paymentData: PaymentData,
    cartItems: CartItem[],
    branchId: number,
    token: string | null
  ): Promise<SaleConfirmationData | null> => {
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return null;
    }

    if (!token) {
      toast.error("No hay token de autenticación");
      return null;
    }

    setProcessing(true);

    try {
      // Construct sale data
      const saleData: SaleData = {
        sale_type: "POS",
        payment_method: paymentData.payment_method,
        order_status: "PENDING",
        branch_id: branchId,
        items: cartItems.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          unit_price: Number(item.price),
          ...(item.size && { size: item.size }),
        })),
      };

      console.log("Submitting sale data:", saleData);

      // Send sale to backend
      const response = await fetch("http://localhost:8000/sales/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(saleData),
      });

      if (response.ok) {
        const saleResult = await response.json();

        // Prepare confirmation data
        const confirmationData: SaleConfirmationData = {
          id: saleResult.id,
          paymentMethod: paymentData.payment_method,
          cardType: paymentData.card_type,
          installments: paymentData.installments,
          total: paymentData.total,
          items: cartItems.map((item) => ({
            name: item.product.name,
            quantity: item.quantity,
            price: item.price,
          })),
        };

        toast.success(`Venta #${saleResult.id} completada exitosamente!`, {
          duration: 3000,
          style: {
            background: "#10B981",
            color: "white",
          },
        });

        return confirmationData;
      } else {
        let error;
        try {
          error = await response.json();
        } catch (parseError) {
          error = {
            detail: `HTTP ${response.status}: ${response.statusText}`,
          };
        }

        console.error("Sale creation error:", error);
        toast.error(
          `Error al procesar la venta: ${error.detail || "Error desconocido"}`
        );
        return null;
      }
    } catch (error) {
      console.error("Error processing sale:", error);
      toast.error("Error de conexión al procesar la venta");
      return null;
    } finally {
      setProcessing(false);
    }
  };

  return {
    processing,
    processSale,
  };
}
