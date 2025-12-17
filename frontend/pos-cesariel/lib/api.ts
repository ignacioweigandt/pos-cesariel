/**
 * Legacy API exports for backward compatibility
 *
 * This file has been refactored into feature-specific API modules.
 * All exports are maintained for backward compatibility.
 *
 * @deprecated Import from feature-specific API files instead:
 * - import { authApi } from '@/shared/api/authApi'
 * - import { productsApi } from '@/features/inventory/api/productsApi'
 * - import { categoriesApi } from '@/features/inventory/api/categoriesApi'
 * - import { salesApi } from '@/features/pos/api/salesApi'
 * - import { usersApi } from '@/features/users/api/usersApi'
 * - import { branchesApi } from '@/features/users/api/branchesApi'
 * - import { ecommerceAdvancedApi } from '@/features/ecommerce/api/ecommerceAdvancedApi'
 * - import { ecommercePublicApi } from '@/features/ecommerce/api/ecommercePublicApi'
 * - import { reportsApi } from '@/features/reports/api/reportsApi'
 * - import { dashboardApi } from '@/features/dashboard/api/dashboardApi'
 * - import { configApi } from '@/shared/api/configApi'
 */

// Re-export API clients
export { api, publicApi, apiClient, publicApiClient } from '@/shared/api/client';

// Re-export Auth API
export { authApi } from '@/shared/api/authApi';

// Re-export Inventory APIs
export { productsApi } from '@/features/inventory/api/productsApi';
export { categoriesApi } from '@/features/inventory/api/categoriesApi';

// Re-export POS APIs
export { salesApi } from '@/features/pos/api/salesApi';

// Re-export User Management APIs
export { usersApi } from '@/features/users/api/usersApi';
export { branchesApi } from '@/features/users/api/branchesApi';

// Re-export E-commerce APIs
export { ecommerceAdvancedApi } from '@/features/ecommerce/api/ecommerceAdvancedApi';
export { ecommercePublicApi } from '@/features/ecommerce/api/ecommercePublicApi';

// Re-export Reports & Dashboard APIs
export { reportsApi } from '@/features/reports/api/reportsApi';
export { dashboardApi } from '@/features/dashboard/api/dashboardApi';

// Re-export Configuration API
export { configApi } from '@/shared/api/configApi';
