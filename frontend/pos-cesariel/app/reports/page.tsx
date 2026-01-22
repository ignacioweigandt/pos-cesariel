"use client";

import { ReportsContainer } from "@/features/reports";
import { useRouteProtection } from "@/shared/hooks/useRouteProtection";

/**
 * Reports Page
 *
 * Protected route: Only accessible by admin and manager roles.
 */
export default function ReportsPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  return <ReportsContainer />;
}
