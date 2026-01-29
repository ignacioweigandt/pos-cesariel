/**
 * useReportFilters Hook
 *
 * Simplified hook for managing report date filters.
 * Supports quick filters and custom date ranges only.
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getTodayRange,
  getCurrentMonthRange,
  getCurrentYearRange,
  getLastNDaysRange,
  isValidDateRange,
  getDaysBetween
} from '@/lib/utils/date';

export type QuickFilterPeriod = 'today' | 'month' | 'year' | 'last30' | 'last7';

interface UseReportFiltersOptions {
  onFilterChange?: (startDate: string, endDate: string, branchId?: number) => void;
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

  // Filter states (simplified - removed reportType and selectedYear)
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const [error, setError] = useState<FilterError>({ type: null, message: '' });
  const [isApplying, setIsApplying] = useState(false);

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
      onFilterChange(startDate, endDate, selectedBranch);
    }

    // Small delay for UX feedback
    setTimeout(() => {
      setIsApplying(false);
    }, 500);
  }, [startDate, endDate, selectedBranch, validateDates, onFilterChange]);

  /**
   * Sets date range and optionally auto-applies
   */
  const setDateRange = useCallback((start: string, end: string, shouldAutoApply = true) => {
    setStartDate(start);
    setEndDate(end);

    // Auto-apply if enabled - directly call with the new values
    if (autoApply && shouldAutoApply && isValidDateRange(start, end)) {
      onFilterChange?.(start, end, selectedBranch);
    }
  }, [autoApply, selectedBranch, onFilterChange]);

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

  const handleBranchChange = useCallback((branchId: number | undefined) => {
    setSelectedBranch(branchId);
  }, []);

  return {
    // State
    startDate,
    endDate,
    selectedBranch,
    error,
    isApplying,
    isValid: error.type === null,

    // Setters
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    setSelectedBranch: handleBranchChange,

    // Actions
    applyFilter,
    validateDates,
    handleQuickFilter,
  };
}
