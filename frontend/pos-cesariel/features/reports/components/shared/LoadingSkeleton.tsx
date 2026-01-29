/**
 * LoadingSkeleton Component
 * 
 * Skeleton loaders for different content types while data is loading.
 * Uses shadcn/ui Skeleton component.
 */

import { Skeleton } from "@/shared/components/ui/skeleton";
import { Card } from "@/shared/components/ui/card";

interface LoadingSkeletonProps {
  type: "table" | "chart" | "cards" | "stats";
  count?: number;
}

export function LoadingSkeleton({ type, count = 1 }: LoadingSkeletonProps) {
  switch (type) {
    case "cards":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-3 w-16" />
            </Card>
          ))}
        </div>
      );

    case "chart":
      return (
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-full" style={{ width: `${Math.random() * 40 + 60}%` }} />
              </div>
            ))}
          </div>
        </Card>
      );

    case "table":
      return (
        <Card className="p-6">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="space-y-3">
            {/* Table header */}
            <div className="flex gap-4 pb-2 border-b">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 flex-1" />
              ))}
            </div>
            {/* Table rows */}
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} className="flex gap-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 flex-1" />
                ))}
              </div>
            ))}
          </div>
        </Card>
      );

    case "stats":
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-3 w-20 mb-2" />
              <Skeleton className="h-7 w-28" />
            </Card>
          ))}
        </div>
      );

    default:
      return null;
  }
}
