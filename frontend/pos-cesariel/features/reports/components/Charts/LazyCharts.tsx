/**
 * Lazy-loaded Chart Components
 * 
 * ✅ OPTIMIZATION: Dynamic import for recharts (~150KB bundle)
 * Charts are only loaded when Reports page is accessed, not on initial bundle.
 * 
 * Before: Recharts loads on every page (impacts TTI)
 * After: Recharts loads only when needed (150KB saved from initial bundle)
 */

import dynamic from 'next/dynamic';
import { Skeleton } from '@/shared/components/ui/skeleton';

// Loading fallback for charts
const ChartLoader = () => (
  <div className="w-full h-[300px] flex items-center justify-center">
    <Skeleton className="w-full h-full" />
  </div>
);

// Dynamically import chart components (no SSR needed for charts)
export const DynamicBarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false, loading: ChartLoader }
);

export const DynamicBar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);

export const DynamicPieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false, loading: ChartLoader }
);

export const DynamicPie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);

export const DynamicLineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false, loading: ChartLoader }
);

export const DynamicLine = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);

export const DynamicAreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false, loading: ChartLoader }
);

export const DynamicArea = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);

export const DynamicCell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);

export const DynamicXAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);

export const DynamicYAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);

export const DynamicCartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);

export const DynamicTooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);

export const DynamicLegend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

export const DynamicResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
