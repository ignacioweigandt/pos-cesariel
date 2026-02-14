/** Hook para manejar export de CSV según la pestaña activa */

import { useReportExport } from './useReportExport';
import { 
  useSalesReport, 
  useDailySales, 
  useProductsChart, 
  useBranchesChart,
  useBrandsChart,
  useDetailedSalesReport 
} from './useReportsQuery';
import type { ReportTab } from '../types/reports.types';

interface UseTabExportProps {
  activeTab: ReportTab;
  startDate: string;
  endDate: string;
  branchId?: number;
  branchName?: string;
  isAdmin: boolean;
}

export function useTabExport({
  activeTab,
  startDate,
  endDate,
  branchId,
  branchName,
  isAdmin
}: UseTabExportProps) {
  const exportHook = useReportExport();

  // Fetch all necessary data (React Query will cache these)
  const { data: salesReport } = useSalesReport(startDate, endDate, branchId);
  const { data: dailySales } = useDailySales(startDate, endDate, branchId);
  const { data: productsData } = useProductsChart(startDate, endDate, branchId);
  const { data: branchesData } = useBranchesChart(startDate, endDate, isAdmin);
  const { data: brandsData } = useBrandsChart(startDate, endDate, branchId);
  const { data: detailedReport } = useDetailedSalesReport(startDate, endDate, branchId);

  const handleExport = () => {
    switch (activeTab) {
      case 'summary':
        exportHook.exportSummaryCSV({
          salesReport: salesReport || null,
          dailySales: dailySales || [],
          topProducts: salesReport?.top_products || [],
          branches: isAdmin ? branchesData : undefined,
          startDate,
          endDate,
          branchName,
        });
        break;

      case 'sales':
        exportHook.exportDailySalesCSV({
          dailySales: dailySales || [],
          startDate,
          endDate,
          branchName,
        });
        break;

      case 'products':
        exportHook.exportProductsCSV({
          products: salesReport?.top_products || [],
          startDate,
          endDate,
          branchName,
        });
        break;

      case 'brands':
        exportHook.exportBrandsCSV({
          brands: brandsData || [],
          startDate,
          endDate,
          branchName,
        });
        break;

      case 'branches':
        if (isAdmin && branchesData) {
          exportHook.exportBranchesCSV({
            branches: branchesData,
            startDate,
            endDate,
          });
        }
        break;

      case 'payment-methods':
        if (detailedReport?.sales_by_payment_method) {
          exportHook.exportPaymentMethodsCSV({
            paymentMethods: detailedReport.sales_by_payment_method,
            startDate,
            endDate,
            branchName,
          });
        }
        break;

      case 'ecommerce':
        // TODO: Implement e-commerce specific export
        console.log('E-commerce export not yet implemented');
        break;

      default:
        console.warn('Unknown tab for export:', activeTab);
    }
  };

  return {
    handleExport,
    exporting: exportHook.exporting,
  };
}
