/**
 * Users Feature Module - Public API
 *
 * Barrel export file for the users feature module
 */

// Main container - PRIMARY EXPORT
export { UsersContainer } from "./components/UsersContainer";

// Types
export * from "./types/users.types";

// Hooks (for external use if needed)
export { useUsers } from "./hooks/useUsers";
export { useBranches } from "./hooks/useBranches";
