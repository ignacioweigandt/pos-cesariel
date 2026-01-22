"use client";

import { UsersContainer } from "@/features/users";
import { useRouteProtection } from "@/shared/hooks/useRouteProtection";

/**
 * Users and Branches Administration Page
 *
 * Main page for managing users, branches, and roles
 *
 * Protected route: Only accessible by admin and manager roles.
 */
export default function UsersPage() {
  // Protección de ruta - redirige automáticamente si el usuario no tiene permisos
  useRouteProtection();

  return <UsersContainer />;
}
