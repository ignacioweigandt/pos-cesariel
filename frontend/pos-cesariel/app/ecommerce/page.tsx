"use client";

import { EcommerceContainer } from "@/features/ecommerce";
import { useRouteProtection } from "@/shared/hooks/useRouteProtection";

/**
 * E-commerce Administration Page
 *
 * This page serves as the entry point for the e-commerce administration interface.
 * All functionality is encapsulated in the EcommerceContainer component following
 * the feature-based architecture pattern.
 *
 * Protected route: Only accessible by admin, manager, and ecommerce roles.
 */
export default function EcommercePage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  return <EcommerceContainer />;
}
