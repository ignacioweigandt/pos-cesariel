"use client";

/**
 * AdvancedReportsContainer - Modern Reports Dashboard
 * 
 * Main container with tabbed navigation for all report types.
 * Uses shadcn/ui Tabs for modern, accessible navigation.
 * 
 * Features:
 * - 7 report tabs: Summary, Sales, Products, Brands, Branches, Payment Methods, E-commerce
 * - Shared filters: Date range + Branch selector (admin only)
 * - Export functionality
 * - Responsive design
 * - Loading states
 */

import { useState, useEffect, lazy, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  ChartBarIcon,
  ArrowLeftIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  TagIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { branchesApi } from "@/features/users/api/branchesApi";
import { useAuth } from "@/shared/hooks/useAuth";
import { useReportFilters } from "../hooks";
import { DateRangeFilter } from "./Filters/DateRangeFilter";
import { BranchSelector, ExportButton, LoadingSkeleton } from "./shared";
import type { Branch, ReportTab } from "../types/reports.types";

// Lazy load tabs for better performance (only load when user clicks)
const SummaryTab = lazy(() => import("./tabs/SummaryTab").then(m => ({ default: m.SummaryTab })));
const SalesTab = lazy(() => import("./tabs/SalesTab").then(m => ({ default: m.SalesTab })));
const ProductsTab = lazy(() => import("./tabs/ProductsTab").then(m => ({ default: m.ProductsTab })));
const BrandsTab = lazy(() => import("./tabs/BrandsTab").then(m => ({ default: m.BrandsTab })));
const BranchesTab = lazy(() => import("./tabs/BranchesTab").then(m => ({ default: m.BranchesTab })));
const PaymentMethodsTab = lazy(() => import("./tabs/PaymentMethodsTab").then(m => ({ default: m.PaymentMethodsTab })));
const EcommerceTab = lazy(() => import("./tabs/EcommerceTab").then(m => ({ default: m.EcommerceTab })));

export function AdvancedReportsContainer() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [activeTab, setActiveTab] = useState<ReportTab>("summary");
  
  // Use Zustand auth store instead of localStorage directly
  const { user, isAuthenticated } = useAuth();

  // Initialize auth and load branches
  useEffect(() => {
    setMounted(true);

    if (!isAuthenticated) {
      router.push("/");
      return;
    }
    
    loadBranches();
  }, [router, isAuthenticated]);

  const loadBranches = async () => {
    try {
      const response = await branchesApi.getBranches();
      setBranches(response.data || []);
    } catch (error) {
      console.error("Error loading branches:", error);
      setBranches([]);
    }
  };

  // Filters hook (shared across all tabs)
  const filters = useReportFilters({
    initialDays: 30,
    autoApply: true,
  });

  // Export handler (placeholder - will be implemented per tab)
  const handleExport = () => {
    console.log("Export for tab:", activeTab);
    // TODO: Implement per-tab export logic
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Check if user is admin (role can be 'admin' or 'ADMIN')
  const isAdmin = user?.role?.toUpperCase() === "ADMIN";
  
  // Debug: Log user data
  console.log("AdvancedReportsContainer - User:", user);
  console.log("AdvancedReportsContainer - User role:", user?.role);
  console.log("AdvancedReportsContainer - isAdmin:", isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Back button + Title */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Volver al dashboard"
              >
                <ArrowLeftIcon className="h-6 w-6" />
              </button>
              <div className="flex items-center gap-3">
                <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Reportes Avanzados
                  </h1>
                  <p className="text-xs text-gray-500">Analytics completo del negocio</p>
                </div>
              </div>
            </div>

            {/* Right: User info + Export */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 hidden sm:block">
                {user?.full_name} • {user?.role}
              </span>
              <ExportButton
                onClick={handleExport}
                disabled={!filters.isValid}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Shared Filters Section */}
          <DateRangeFilter
            startDate={filters.startDate}
            endDate={filters.endDate}
            selectedBranch={filters.selectedBranch}
            branches={branches}
            error={filters.error}
            isApplying={filters.isApplying}
            isValid={filters.isValid}
            onStartDateChange={filters.setStartDate}
            onEndDateChange={filters.setEndDate}
            onBranchChange={filters.setSelectedBranch}
            onQuickFilter={filters.handleQuickFilter}
            onApplyFilter={filters.applyFilter}
          />

          {/* Tabs Navigation + Content */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ReportTab)} className="space-y-6">
            {/* Tabs List */}
            <div className="bg-white rounded-lg shadow-sm border">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 h-auto p-2 gap-2">
                <TabsTrigger value="summary" className="flex items-center gap-2 py-3">
                  <ChartBarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Resumen</span>
                </TabsTrigger>
                <TabsTrigger value="sales" className="flex items-center gap-2 py-3">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Ventas</span>
                </TabsTrigger>
                <TabsTrigger value="products" className="flex items-center gap-2 py-3">
                  <ShoppingBagIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Productos</span>
                </TabsTrigger>
                <TabsTrigger value="brands" className="flex items-center gap-2 py-3">
                  <TagIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Marcas</span>
                </TabsTrigger>
                <TabsTrigger value="branches" className="flex items-center gap-2 py-3">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Sucursales</span>
                </TabsTrigger>
                <TabsTrigger value="payment-methods" className="flex items-center gap-2 py-3">
                  <CreditCardIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Pagos</span>
                </TabsTrigger>
                <TabsTrigger value="ecommerce" className="flex items-center gap-2 py-3">
                  <ShoppingCartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">E-commerce</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content Areas - Wrapped with Suspense for lazy loading */}
            <TabsContent value="summary" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <SummaryTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  isAdmin={isAdmin}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="sales" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <SalesTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <ProductsTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="brands" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <BrandsTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="branches" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <BranchesTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  isAdmin={isAdmin}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="payment-methods" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <PaymentMethodsTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>

            <TabsContent value="ecommerce" className="space-y-6">
              <Suspense fallback={<LoadingSkeleton />}>
                <EcommerceTab
                  startDate={filters.startDate}
                  endDate={filters.endDate}
                  branchId={filters.selectedBranch}
                  branchName={branches.find(b => b.id === filters.selectedBranch)?.name}
                />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
