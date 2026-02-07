/** Hook para gestión de filtros de reportes con validación y filtros rápidos */

import { useState, useEffect } from 'react';
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
  initialDays?: number;
  autoApply?: boolean;
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

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<number | undefined>(undefined);
  const [error, setError] = useState<FilterError>({ type: null, message: '' });
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    const { start, end } = getLastNDaysRange(initialDays);
    setStartDate(start);
    setEndDate(end);
  }, [initialDays]);

  // React Compiler handles optimization
  const validateDates = (): boolean => {
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
  };

  // React Compiler handles optimization
  const applyFilter = () => {
    if (!validateDates()) {
      return;
    }

    setIsApplying(true);

    if (onFilterChange) {
      onFilterChange(startDate, endDate, selectedBranch);
    }

    setTimeout(() => {
      setIsApplying(false);
    }, 500);
  };

  // React Compiler handles optimization
  const setDateRange = (start: string, end: string, shouldAutoApply = true) => {
    setStartDate(start);
    setEndDate(end);

    if (autoApply && shouldAutoApply && isValidDateRange(start, end)) {
      onFilterChange?.(start, end, selectedBranch);
    }
  };

  // React Compiler handles optimization
  const handleQuickFilter = (period: QuickFilterPeriod) => {
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
  };

  // React Compiler handles optimization
  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    setError({ type: null, message: '' });
  };

  // React Compiler handles optimization
  const handleEndDateChange = (date: string) => {
    setEndDate(date);
    setError({ type: null, message: '' });
  };

  // React Compiler handles optimization
  const handleBranchChange = (branchId: number | undefined) => {
    setSelectedBranch(branchId);
  };

  return {
    startDate,
    endDate,
    selectedBranch,
    error,
    isApplying,
    isValid: error.type === null,
    setStartDate: handleStartDateChange,
    setEndDate: handleEndDateChange,
    setSelectedBranch: handleBranchChange,
    applyFilter,
    validateDates,
    handleQuickFilter,
  };
}
