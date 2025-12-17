/**
 * E-commerce Components Barrel Export
 *
 * Public API - Only the main container is exported.
 * All other components are internal to the feature module.
 */

// Main Container - PUBLIC API
export { EcommerceContainer } from './EcommerceContainer';

// NOTE: Individual components are NOT exported here.
// They are private to the ecommerce feature and managed internally by EcommerceContainer.
// This enforces proper encapsulation and prevents direct imports of internal components.
