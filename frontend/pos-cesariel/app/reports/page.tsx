"use client";

import { AdvancedReportsContainer } from "@/features/reports";
import { useRouteProtection } from "@/shared/hooks/useRouteProtection";

/**
 * Reports Page - Advanced Analytics Dashboard
 *
 * Protected route: Only accessible by admin and manager roles.
 * 
 * New version with:
 * - 7 tabbed report views
 * - Modern shadcn/ui design
 * - Shared filters and navigation
 */
export default function ReportsPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  return <AdvancedReportsContainer />;
}
