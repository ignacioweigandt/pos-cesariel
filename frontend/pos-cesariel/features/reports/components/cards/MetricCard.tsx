/**
 * MetricCard Component
 * 
 * Displays a single metric with:
 * - Title
 * - Value (formatted)
 * - Optional trend indicator (up/down/neutral)
 * - Optional icon
 * - Loading state
 */

import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "@heroicons/react/24/solid";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number; // Percentage change
  trend?: "up" | "down" | "neutral";
  icon?: React.ComponentType<{ className?: string }>;
  loading?: boolean;
  prefix?: string; // e.g., "$"
  suffix?: string; // e.g., "%"
  subtitle?: string; // Optional subtitle below value
}

export function MetricCard({
  title,
  value,
  change,
  trend = "neutral",
  icon: Icon,
  loading = false,
  prefix = "",
  suffix = "",
  subtitle,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-3 w-16" />
      </Card>
    );
  }

  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-gray-600 bg-gray-50",
  };

  const trendIcons = {
    up: ArrowUpIcon,
    down: ArrowDownIcon,
    neutral: MinusIcon,
  };

  const TrendIcon = trendIcons[trend];

  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">
              {prefix}
              {typeof value === "number" ? value.toLocaleString("es-AR") : value}
              {suffix}
            </h3>
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}
              >
                <TrendIcon className="h-3 w-3" />
                {Math.abs(change).toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs período anterior</span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="rounded-full bg-indigo-50 p-3">
            <Icon className="h-6 w-6 text-indigo-600" />
          </div>
        )}
      </div>
    </Card>
  );
}
