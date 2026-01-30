/** Utilidades de formateo de números */

/** Formatear número con separadores de miles (ej: "1.234.567") */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-AR').format(value);
}

/** Formatear número como porcentaje (value en rango 0-1, ej: 0.4567 -> "45,67%") */
export function formatPercentage(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/** Redondear número a cantidad específica de decimales */
export function roundToDecimals(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/** Calcular porcentaje de un valor relativo al total (retorna 0-100) */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/** Aplicar descuento porcentual a un monto */
export function applyDiscount(amount: number, discountPercentage: number): number {
  return amount * (1 - discountPercentage / 100);
}

/** Calcular monto de impuesto para un monto base (ej: taxRate=21 para IVA 21%) */
export function calculateTax(amount: number, taxRate: number): number {
  return amount * (taxRate / 100);
}

/** Formatear número con notación compacta (ej: 1.5K, 2.3M) */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-AR', {
    notation: 'compact',
    compactDisplay: 'short'
  }).format(value);
}

/** Validar si un string es un número válido */
export function isValidNumber(value: string): boolean {
  return !isNaN(Number(value)) && isFinite(Number(value));
}
