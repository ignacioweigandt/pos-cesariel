"use client";

import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useDashboardStats, useRealTimeUpdates } from "../hooks";
import { StatsGrid } from "./Stats/StatsGrid";
import { ModuleGrid } from "./ModuleCards/ModuleGrid";
import { QuickActionsPanel } from "./QuickActions/QuickActionsPanel";
import { LowStockAlert } from "./Alerts/LowStockAlert";
import NotificationCenter from "@/app/components/NotificationCenter";

export function DashboardContainer() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { user, token, isAuthenticated, logout } = useAuth();

  const { stats, loading, refresh } = useDashboardStats();

  // WebSocket for real-time updates
  const branchId = user?.branch_id || 1;
  const shouldConnectWebSocket = true;

  useRealTimeUpdates({
    branchId,
    token: token || "",
    enabled: shouldConnectWebSocket,
    onUpdate: refresh,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      router.push("/");
      return;
    }
  }, [router, isAuthenticated, token]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                POS Cesariel
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <NotificationCenter />
              <span className="text-sm text-gray-700">
                {user?.full_name} - {user?.role}
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <ArrowRightOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Bienvenido, {user?.full_name}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Dashboard - {user?.branch?.name || "Todas las sucursales"}
              </p>
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={stats} loading={loading} />

            {/* Quick Actions */}
            <QuickActionsPanel />

            {/* Module Cards */}
            <ModuleGrid />

            {/* Alerts */}
            <LowStockAlert lowStockCount={stats?.low_stock_products || 0} />
          </div>
        </div>
      </div>
    </div>
  );
}
