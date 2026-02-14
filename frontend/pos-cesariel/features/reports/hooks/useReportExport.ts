/** Hook para exportar reportes a CSV con formato profesional */

import { useState } from "react";
import type { 
  SalesReport, 
  TopProduct, 
  BranchData, 
  DailySales,
  DetailedSalesReport,
  TopBrand,
  PaymentMethodData
} from "../types/reports.types";

// Utility to escape CSV fields (handle commas, quotes, newlines)
function escapeCSVField(field: string | number): string {
  const str = String(field);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Format currency for CSV
function formatCurrency(value: number): string {
  return `$${value.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Format date for CSV
function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('es-AR');
}

// Download CSV file
function downloadCSV(content: string, filename: string) {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export function useReportExport() {
  const [exporting, setExporting] = useState(false);

  /**
   * Export Summary Report (Overview)
   */
  const exportSummaryCSV = (data: {
    salesReport: SalesReport | null;
    dailySales: any[];
    topProducts: any[];
    branches?: BranchData[];
    startDate: string;
    endDate: string;
    branchName?: string;
  }) => {
    if (!data.salesReport) return;

    setExporting(true);
    try {
      const rows: string[][] = [
        // Header
        ['REPORTE RESUMEN DE VENTAS'],
        ['POS Cesariel'],
        [''],
        
        // Period info
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ...(data.branchName ? [['Sucursal', data.branchName]] : []),
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        
        // Summary metrics
        ['RESUMEN GENERAL'],
        ['Métrica', 'Valor'],
        ['Total Ventas', formatCurrency(parseFloat(data.salesReport.total_sales.toString()))],
        ['Total Transacciones', data.salesReport.total_transactions.toString()],
        ['Ticket Promedio', formatCurrency(parseFloat(data.salesReport.average_sale.toString()))],
        [''],
        
        // Top products
        ['PRODUCTOS MÁS VENDIDOS'],
        ['Producto', 'Cantidad Vendida', 'Ingresos'],
        ...data.topProducts.map(p => {
          const name = (p as any).product_name || (p as any).name || 'Unknown';
          const quantity = (p as any).quantity_sold || (p as any).quantity || 0;
          const revenue = (p as any).total_revenue || (p as any).revenue || 0;
          return [
            escapeCSVField(name),
            quantity.toString(),
            formatCurrency(parseFloat(revenue.toString()))
          ];
        }),
      ];

      // Add branches section if admin
      if (data.branches && data.branches.length > 0) {
        rows.push(
          [''],
          ['VENTAS POR SUCURSAL'],
          ['Sucursal', 'Total Ventas', 'Cantidad de Órdenes'],
          ...data.branches.map(b => [
            escapeCSVField(b.branch_name),
            formatCurrency(parseFloat(b.total_sales.toString())),
            b.orders_count.toString()
          ])
        );
      }

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `resumen-ventas-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting summary CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export Products Report
   */
  const exportProductsCSV = (data: {
    products: TopProduct[];
    startDate: string;
    endDate: string;
    branchName?: string;
  }) => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ['REPORTE DE PRODUCTOS'],
        ['POS Cesariel'],
        [''],
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ...(data.branchName ? [['Sucursal', data.branchName]] : []),
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        ['DETALLE DE PRODUCTOS VENDIDOS'],
        ['#', 'Producto', 'Cantidad Vendida', 'Ingresos Totales', '% del Total'],
      ];

      const totalRevenue = data.products.reduce((sum, p) => {
        const revenue = (p as any).total_revenue || (p as any).revenue || 0;
        return sum + parseFloat(revenue.toString());
      }, 0);
      
      data.products.forEach((product, index) => {
        const revenue = parseFloat(((product as any).total_revenue || (product as any).revenue || 0).toString());
        const quantity = parseInt(((product as any).quantity_sold || (product as any).quantity || 0).toString());
        const name = (product as any).product_name || (product as any).name || 'Unknown';
        const percentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(2) : '0.00';
        rows.push([
          (index + 1).toString(),
          escapeCSVField(name),
          quantity.toString(),
          formatCurrency(revenue),
          `${percentage}%`
        ]);
      });

      rows.push(
        [''],
        ['TOTALES'],
        ['Total Productos Diferentes', data.products.length.toString()],
        ['Total Unidades Vendidas', data.products.reduce((sum, p) => {
          const quantity = (p as any).quantity_sold || (p as any).quantity || 0;
          return sum + parseInt(quantity.toString());
        }, 0).toString()],
        ['Ingresos Totales', formatCurrency(totalRevenue)]
      );

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `productos-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting products CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export Brands Report
   */
  const exportBrandsCSV = (data: {
    brands: TopBrand[];
    startDate: string;
    endDate: string;
    branchName?: string;
  }) => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ['REPORTE DE MARCAS'],
        ['POS Cesariel'],
        [''],
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ...(data.branchName ? [['Sucursal', data.branchName]] : []),
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        ['DETALLE DE MARCAS'],
        ['#', 'Marca', 'Productos Diferentes', 'Unidades Vendidas', 'Ingresos Totales', '% del Total'],
      ];

      const totalRevenue = data.brands.reduce((sum, b) => sum + parseFloat(b.total_revenue.toString()), 0);
      
      data.brands.forEach((brand, index) => {
        const revenue = parseFloat(brand.total_revenue.toString());
        const percentage = totalRevenue > 0 ? ((revenue / totalRevenue) * 100).toFixed(2) : '0.00';
        rows.push([
          (index + 1).toString(),
          escapeCSVField(brand.brand_name),
          brand.products_count.toString(),
          brand.quantity_sold.toString(),
          formatCurrency(revenue),
          `${percentage}%`
        ]);
      });

      rows.push(
        [''],
        ['TOTALES'],
        ['Total Marcas', data.brands.length.toString()],
        ['Total Unidades Vendidas', data.brands.reduce((sum, b) => sum + b.quantity_sold, 0).toString()],
        ['Ingresos Totales', formatCurrency(totalRevenue)]
      );

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `marcas-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting brands CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export Branches Report
   */
  const exportBranchesCSV = (data: {
    branches: BranchData[];
    startDate: string;
    endDate: string;
  }) => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ['REPORTE DE SUCURSALES'],
        ['POS Cesariel'],
        [''],
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        ['COMPARATIVA DE SUCURSALES'],
        ['#', 'Sucursal', 'Total Ventas', 'Cantidad Órdenes', 'Ticket Promedio', '% del Total'],
      ];

      const totalSales = data.branches.reduce((sum, b) => sum + parseFloat(b.total_sales.toString()), 0);
      
      data.branches
        .map(b => ({ ...b, total_sales: parseFloat(b.total_sales.toString()) }))
        .sort((a, b) => b.total_sales - a.total_sales)
        .forEach((branch, index) => {
          const avgTicket = branch.orders_count > 0 ? branch.total_sales / branch.orders_count : 0;
          const percentage = totalSales > 0 ? ((branch.total_sales / totalSales) * 100).toFixed(2) : '0.00';
          rows.push([
            (index + 1).toString(),
            escapeCSVField(branch.branch_name),
            formatCurrency(branch.total_sales),
            branch.orders_count.toString(),
            formatCurrency(avgTicket),
            `${percentage}%`
          ]);
        });

      rows.push(
        [''],
        ['TOTALES'],
        ['Total Sucursales', data.branches.length.toString()],
        ['Ventas Totales', formatCurrency(totalSales)],
        ['Órdenes Totales', data.branches.reduce((sum, b) => sum + b.orders_count, 0).toString()]
      );

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `sucursales-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting branches CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export Payment Methods Report
   */
  const exportPaymentMethodsCSV = (data: {
    paymentMethods: PaymentMethodData[];
    startDate: string;
    endDate: string;
    branchName?: string;
  }) => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ['REPORTE DE MEDIOS DE PAGO'],
        ['POS Cesariel'],
        [''],
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ...(data.branchName ? [['Sucursal', data.branchName]] : []),
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        ['DETALLE POR MEDIO DE PAGO'],
        ['Medio de Pago', 'Total Ventas', 'Cantidad Transacciones', 'Ticket Promedio', '% del Total'],
      ];

      const totalSales = data.paymentMethods.reduce((sum, pm) => sum + parseFloat(pm.total_sales.toString()), 0);
      
      data.paymentMethods.forEach(pm => {
        const sales = parseFloat(pm.total_sales.toString());
        const avgTicket = pm.transaction_count > 0 ? sales / pm.transaction_count : 0;
        const percentage = totalSales > 0 ? ((sales / totalSales) * 100).toFixed(2) : '0.00';
        rows.push([
          escapeCSVField(pm.payment_method),
          formatCurrency(sales),
          pm.transaction_count.toString(),
          formatCurrency(avgTicket),
          `${percentage}%`
        ]);
      });

      rows.push(
        [''],
        ['TOTALES'],
        ['Total Transacciones', data.paymentMethods.reduce((sum, pm) => sum + pm.transaction_count, 0).toString()],
        ['Ventas Totales', formatCurrency(totalSales)]
      );

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `medios-pago-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting payment methods CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  /**
   * Export Daily Sales Report
   */
  const exportDailySalesCSV = (data: {
    dailySales: DailySales[];
    startDate: string;
    endDate: string;
    branchName?: string;
  }) => {
    setExporting(true);
    try {
      const rows: string[][] = [
        ['REPORTE DE VENTAS DIARIAS'],
        ['POS Cesariel'],
        [''],
        ['Período', `${formatDate(data.startDate)} - ${formatDate(data.endDate)}`],
        ...(data.branchName ? [['Sucursal', data.branchName]] : []),
        ['Generado', new Date().toLocaleString('es-AR')],
        [''],
        ['VENTAS POR DÍA'],
        ['Fecha', 'Total Ventas', 'Cantidad Transacciones', 'Ticket Promedio'],
      ];

      data.dailySales.forEach(day => {
        const sales = parseFloat((day.sales || 0).toString());
        const transactions = parseInt((day.transactions || 0).toString());
        const avgTicket = transactions > 0 ? sales / transactions : 0;
        rows.push([
          formatDate(day.date),
          formatCurrency(sales),
          transactions.toString(),
          formatCurrency(avgTicket)
        ]);
      });

      rows.push(
        [''],
        ['TOTALES'],
        ['Total Ventas', formatCurrency(data.dailySales.reduce((sum, d) => sum + parseFloat((d.sales || 0).toString()), 0))],
        ['Total Transacciones', data.dailySales.reduce((sum, d) => sum + parseInt((d.transactions || 0).toString()), 0).toString()]
      );

      const csvContent = rows.map(row => row.join(',')).join('\n');
      downloadCSV(csvContent, `ventas-diarias-${data.startDate}-${data.endDate}.csv`);
    } catch (error) {
      console.error('Error exporting daily sales CSV:', error);
    } finally {
      setExporting(false);
    }
  };

  return {
    exporting,
    exportSummaryCSV,
    exportProductsCSV,
    exportBrandsCSV,
    exportBranchesCSV,
    exportPaymentMethodsCSV,
    exportDailySalesCSV,
  };
}
