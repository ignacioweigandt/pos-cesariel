/**
 * useReportFilters Hook
 *
 * Custom hook for managing report date filters with validation and auto-apply.
 * Fixes bugs with date handling, timezone issues, and validation.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  formatDateToYYYYMMDD,
  getTodayRange,
  getCurrentMonthRange,
  getCurrentYearRange,
  getMonthRange,
  getYearRange,
  getLastNDaysRange,
  isValidDateRange,
  getDaysBetween
} from '@/lib/utils/date';

export type QuickFilterPeriod = 'today' | 'month' | 'year' | 'last30' | 'last7';
export type ReportType = 'sales' | 'products' | 'branches';

interface UseReportFiltersOptions {
  onFilterChange?: (startDate: string, endDate: string, reportType: ReportType, branchId?: number) => void;
  initialDays?: number; // Default: 30
  autoApply?: boolean; // Default: true
}

interface FilterError {
  type: 'validation' | 'range' | null;
  message: string;
}

export function useReportFilters(options: UseReportFiltersOptions = {}) {
  const {
    onFilterChange,
    initialDays = 30,
    autoApply = true
  } = options;

  // Filter states
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const [error, setError] = useState<FilterError>({ type: null, message: '' });
  const [isApplying, setIsApplying] = useState(false);

  // Ref to always have the latest selectedYear value
  // FIX: This prevents stale closure issues when clicking months after changing year
  const selectedYearRef = useRef<number>(selectedYear);

  useEffect(() => {
    selectedYearRef.current = selectedYear;
  }, [selectedYear]);

  // Initialize with default date range
  useEffect(() => {
    const { start, end } = getLastNDaysRange(initialDays);
    setStartDate(start);
    setEndDate(end);
  }, [initialDays]);

  /**
   * Validates the current date range
   */
  const validateDates = useCallback((): boolean => {
    if (!startDate || !endDate) {
      setError({
        type: 'validation',
        message: 'Debe seleccionar fecha de inicio y fin'
      });
      return false;
    }

    if (!isValidDateRange(startDate, endDate)) {
      setError({
        type: 'range',
        message: 'La fecha de inicio debe ser anterior o igual a la fecha de fin'
      });
      return false;
    }

    // Optional: Check for excessively large ranges
    const days = getDaysBetween(startDate, endDate);
    if (days > 365) {
      setError({
        type: 'range',
        message: 'El rango máximo es de 365 días'
      });
      return false;
    }

    setError({ type: null, message: '' });
    return true;
  }, [startDate, endDate]);

  /**
   * Applies the current filter
   */
  const applyFilter = useCallback(() => {
    if (!validateDates()) {
      return;
    }

    setIsApplying(true);

    // Call the onChange callback
    if (onFilterChange) {
      onFilterChange(startDate, endDate, reportType, selectedBranch);
    }

    // Small delay for UX feedback
    setTimeout(() => {
      setIsApplying(false);
    }, 500);
  }, [startDate, endDate, reportType, selectedBranch, validateDates, onFilterChange]);

  /**
   * Sets date range and optionally auto-applies
   * FIX: Removed setTimeout to avoid stale state issues
   */
  const setDateRange = useCallback((start: string, end: string, shouldAutoApply = true) => {
    setStartDate(start);
    setEndDate(end);

    // Auto-apply if enabled - directly call with the new values
    if (autoApply && shouldAutoApply && isValidDateRange(start, end)) {
      // Call immediately with the new values (not from state)
      onFilterChange?.(start, end, reportType, selectedBranch);
    }
  }, [autoApply, reportType, selectedBranch, onFilterChange]);

  /**
   * Quick filter handlers
   */
  const handleQuickFilter = useCallback((period: QuickFilterPeriod) => {
    let range: { start: string; end: string };

    switch (period) {
      case 'today':
        range = getTodayRange();
        break;
      case 'last7':
        range = getLastNDaysRange(7);
        break;
      case 'last30':
        range = getLastNDaysRange(30);
        break;
      case 'month':
        range = getCurrentMonthRange();
        break;
      case 'year':
        range = getCurrentYearRange();
        break;
      default:
        return;
    }

    setDateRange(range.start, range.end, true);
  }, [setDateRange]);

  /**
   * Month filter handler
   * FIX: Uses ref to get the latest selectedYear value, avoiding stale closure
   */
  const handleMonthFilter = useCallback((month: number) => {
    // Use ref to get the most recent year value
    const range = getMonthRange(selectedYearRef.current, month);
    setDateRange(range.start, range.end, true);
  }, [setDateRange]);

  /**
   * Year filter handler
   */
  const handleYearFilter = useCallback((year: number) => {
    const range = getYearRange(year);
    setDateRange(range.start, range.end, true);
  }, [setDateRange]);

  /**
   * Manual date change handlers
   */
  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
    setError({ type: null, message: '' });
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
    setError({ type: null, message: '' });
  }, []);

  const handleReportTypeChange = useCallback((type: ReportType) => {
    setReportType(type);
  }, []);

  const handleBranchChange = useCallback((branchId: number | undefined) => {
    setSelectedBranch(branchId);
  }, []);

  return {
    // State
    startDate,
    endDate,
    reportType,
    selectedYear,
    selectedBranch,
    error,
    isApplying,
    isValid: error.type === null,

    // Setters
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    setReportType: handleReportTypeChange,
    setSelectedYear,
    setSelectedBranch: handleBranchChange,

    // Actions
    applyFilter,
    validateDates,
    handleQuickFilter,
    handleMonthFilter,
    handleYearFilter,
  };
}
