/** Utilidades de fechas para reportes y filtros (siempre retorna YYYY-MM-DD para API) */

export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDate(): string {
  return formatDateToYYYYMMDD(new Date());
}

export function getTodayRange(): { start: string; end: string } {
  const today = getTodayDate();
  return { start: today, end: today };
}

export function getCurrentMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

export function getCurrentYearRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1);
  const lastDay = new Date(today.getFullYear(), 11, 31);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

export function getYearRange(year: number): { start: string; end: string } {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateToYYYYMMDD(date);
}

export function getLastNDaysRange(days: number): { start: string; end: string } {
  return {
    start: getDaysAgo(days - 1),
    end: getTodayDate()
  };
}

export function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return false;
  }

  return new Date(startDate) <= new Date(endDate);
}

export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatDateRangeDisplay(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  if (startDate === endDate) {
    return start.toLocaleDateString('es-ES', options);
  }

  return `${start.toLocaleDateString('es-ES', options)} - ${end.toLocaleDateString('es-ES', options)}`;
}

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

export function getAvailableYears(yearsBack: number = 5): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack }, (_, i) => currentYear - i);
}
