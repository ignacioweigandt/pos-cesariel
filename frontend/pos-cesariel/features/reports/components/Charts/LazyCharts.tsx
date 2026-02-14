/**
 * Lazy-loaded Chart Components
 *
 * OPTIMIZATION (bundle-dynamic-imports): Dynamic import for complete chart components.
 * Recharts (~150KB) is only loaded when the Reports page renders a chart,
 * NOT on the initial bundle.
 *
 * IMPORTANT: We wrap the FULL chart component, not individual recharts primitives.
 * Wrapping primitives (Bar, XAxis, Tooltip) individually breaks recharts because
 * parent components (BarChart, PieChart) scan children synchronously for specific types.
 * Suspense boundaries from next/dynamic make children async, which breaks that scanning.
 *
 * Before: Recharts loads on every page (impacts TTI)
 * After: Recharts loads only when a chart component is rendered
 */

import dynamic from "next/dynamic";

const ChartLoader = () => (
  <div className="w-full h-80 flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
  </div>
);

export const LazyDailySalesChart = dynamic(
  () =>
    import("./DailySalesChart").then((mod) => mod.DailySalesChart),
  { ssr: false, loading: ChartLoader }
);

export const LazyProductsPieChart = dynamic(
  () =>
    import("./ProductsPieChart").then((mod) => mod.ProductsPieChart),
  { ssr: false, loading: ChartLoader }
);

export const LazyBranchSalesChart = dynamic(
  () =>
    import("./BranchSalesChart").then((mod) => mod.BranchSalesChart),
  { ssr: false, loading: ChartLoader }
);

export const LazyBranchesBarChart = dynamic(
  () =>
    import("./BranchesBarChart").then((mod) => mod.BranchesBarChart),
  { ssr: false, loading: ChartLoader }
);
