import { useState } from "react";
import type { SalesReport } from "../types/reports.types";

export function useReportExport() {
  const [exporting, setExporting] = useState(false);

  const exportToCSV = (
    salesReport: SalesReport | null,
    startDate: string,
    endDate: string
  ) => {
    if (!salesReport) return;

    setExporting(true);

    try {
      const csvContent = [
        ["Reporte de Ventas"],
        ["Período", salesReport.period],
        [""],
        ["Resumen"],
        ["Total Ventas", salesReport.total_sales.toString()],
        ["Total Transacciones", salesReport.total_transactions.toString()],
        ["Venta Promedio", salesReport.average_sale.toString()],
        [""],
        ["Productos Más Vendidos"],
        ["Producto", "Cantidad", "Ingresos"],
        ...salesReport.top_products.map((p) => [
          p.name,
          p.quantity.toString(),
          p.revenue.toString(),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte-ventas-${startDate}-${endDate}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting to CSV:", error);
    } finally {
      setExporting(false);
    }
  };

  return {
    exportToCSV,
    exporting,
  };
}
