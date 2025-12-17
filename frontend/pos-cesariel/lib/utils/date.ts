/**
 * Date Utilities
 *
 * Provides robust date handling functions for reports and filters.
 * All functions return dates in YYYY-MM-DD format for API compatibility.
 */

/**
 * Formats a Date object to YYYY-MM-DD string (local timezone)
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Gets today's date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  return formatDateToYYYYMMDD(new Date());
}

/**
 * Gets the start and end dates for "today" filter
 * Returns same date for both to cover the full day
 */
export function getTodayRange(): { start: string; end: string } {
  const today = getTodayDate();
  return { start: today, end: today };
}

/**
 * Gets the first and last day of the current month
 */
export function getCurrentMonthRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

/**
 * Gets the first and last day of the current year
 */
export function getCurrentYearRange(): { start: string; end: string } {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), 0, 1);
  const lastDay = new Date(today.getFullYear(), 11, 31);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

/**
 * Gets the first and last day of a specific month
 * @param year - Year (e.g., 2025)
 * @param month - Month (0-11, where 0 is January)
 */
export function getMonthRange(year: number, month: number): { start: string; end: string } {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

/**
 * Gets the full year range
 * @param year - Year (e.g., 2025)
 */
export function getYearRange(year: number): { start: string; end: string } {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);

  return {
    start: formatDateToYYYYMMDD(firstDay),
    end: formatDateToYYYYMMDD(lastDay)
  };
}

/**
 * Gets date N days ago from today
 * @param days - Number of days to go back
 */
export function getDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatDateToYYYYMMDD(date);
}

/**
 * Gets the last N days range (inclusive)
 * @param days - Number of days (e.g., 30 for last 30 days)
 */
export function getLastNDaysRange(days: number): { start: string; end: string } {
  return {
    start: getDaysAgo(days - 1),
    end: getTodayDate()
  };
}

/**
 * Validates if a date string is in YYYY-MM-DD format
 * @param dateStr - Date string to validate
 */
export function isValidDateFormat(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return !isNaN(date.getTime());
}

/**
 * Validates if start date is before or equal to end date
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  if (!isValidDateFormat(startDate) || !isValidDateFormat(endDate)) {
    return false;
  }

  return new Date(startDate) <= new Date(endDate);
}

/**
 * Gets the number of days between two dates
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 */
export function getDaysBetween(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Formats a date range for display
 * @param startDate - Start date string (YYYY-MM-DD)
 * @param endDate - End date string (YYYY-MM-DD)
 */
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

/**
 * Month names in Spanish
 */
export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
] as const;

/**
 * Gets available years for year selector (current year and previous years)
 * @param yearsBack - Number of years to go back (default: 5)
 */
export function getAvailableYears(yearsBack: number = 5): number[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack }, (_, i) => currentYear - i);
}
