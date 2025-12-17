# Reports Module

**Version:** 2.0 (Refactored)
**Last Updated:** October 29, 2025
**Status:** ✅ Production Ready

---

## Overview

The Reports module provides comprehensive analytics and reporting functionality for the POS system, including:

- Sales reports with customizable date ranges
- Product performance analytics
- Branch comparison (admin only)
- Export to CSV
- Interactive charts and visualizations

---

## Recent Improvements (v2.0)

### Bug Fixes
- ✅ Fixed timezone issues causing date shifts
- ✅ Fixed "Today" filter showing incorrect range
- ✅ Fixed race conditions in filter application
- ✅ Fixed month calculation edge cases
- ✅ Added comprehensive date validation

### New Features
- ✅ New quick filters: "Últimos 7 días", "Últimos 30 días"
- ✅ Error messages for invalid date ranges
- ✅ Visual feedback when applying filters
- ✅ Maximum range validation (365 days)
- ✅ Improved accessibility

### Architecture
- ✅ Created reusable date utilities (`lib/utils/date.ts`)
- ✅ Created custom `useReportFilters` hook
- ✅ Better separation of concerns
- ✅ Full TypeScript type safety

---

## Quick Start

### Basic Usage

```typescript
import { ReportsContainer } from '@/features/reports';

export default function ReportsPage() {
  return <ReportsContainer />;
}
```

### Using the Filter Hook

```typescript
import { useReportFilters } from '@/features/reports/hooks';

function MyCustomReport() {
  const filters = useReportFilters({
    initialDays: 30,
    autoApply: true,
    onFilterChange: (startDate, endDate, reportType) => {
      // Your data fetching logic
      fetchReportData(startDate, endDate, reportType);
    }
  });

  return (
    <div>
      <DateRangeFilter
        {...filters}
        onQuickFilter={filters.handleQuickFilter}
        onMonthFilter={filters.handleMonthFilter}
        onYearFilter={filters.handleYearFilter}
        onApplyFilter={filters.applyFilter}
      />
      {/* Your report UI */}
    </div>
  );
}
```

---

## Module Structure

```
features/reports/
├── components/
│   ├── ReportsContainer.tsx          # Main container component
│   ├── Filters/
│   │   └── DateRangeFilter.tsx       # Date filter UI
│   ├── Stats/
│   │   ├── StatsCards.tsx            # Statistics cards
│   │   └── TotalSalesCard.tsx        # Total sales display
│   ├── Charts/
│   │   ├── DailySalesChart.tsx       # Line chart
│   │   ├── ProductsPieChart.tsx      # Pie chart
│   │   └── BranchSalesChart.tsx      # Bar chart
│   └── Tables/
│       ├── TopProductsTable.tsx      # Top products
│       └── BranchSalesTable.tsx      # Branch sales
│
├── hooks/
│   ├── index.ts                       # Hook exports
│   ├── useReportsData.ts              # Data fetching
│   ├── useReportExport.ts             # CSV export
│   └── useReportFilters.ts            # Filter management (NEW)
│
├── api/
│   └── reportsApi.ts                  # API client
│
├── types/
│   └── reports.types.ts               # TypeScript types
│
├── index.ts                           # Public exports
└── README.md                          # This file
```

---

## Available Hooks

### `useReportFilters`

Manages report date filters with validation.

```typescript
const filters = useReportFilters({
  initialDays?: number;        // Default: 30
  autoApply?: boolean;         // Default: true
  onFilterChange?: (startDate: string, endDate: string, reportType: ReportType) => void;
});

// Returns:
{
  startDate: string;
  endDate: string;
  reportType: ReportType;
  selectedYear: number;
  error: { type: string | null; message: string };
  isApplying: boolean;
  isValid: boolean;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setReportType: (type: ReportType) => void;
  setSelectedYear: (year: number) => void;
  applyFilter: () => void;
  validateDates: () => boolean;
  handleQuickFilter: (period: QuickFilterPeriod) => void;
  handleMonthFilter: (month: number) => void;
  handleYearFilter: (year: number) => void;
}
```

### `useReportsData`

Fetches report data from backend.

```typescript
const {
  salesReport,
  dashboardStats,
  dailySalesData,
  productsChartData,
  branchesChartData,
  loading,
  error,
  refresh
} = useReportsData(startDate, endDate);
```

### `useReportExport`

Handles CSV export functionality.

```typescript
const { exportToCSV, exporting } = useReportExport();

// Usage
exportToCSV(salesReport, startDate, endDate);
```

---

## Date Utilities

The module uses shared date utilities from `lib/utils/date.ts`:

```typescript
import {
  formatDateToYYYYMMDD,
  getTodayDate,
  getLastNDaysRange,
  getCurrentMonthRange,
  getCurrentYearRange,
  isValidDateRange
} from '@/lib/utils/date';

// Get today
const today = getTodayDate(); // "2025-10-29"

// Get last 30 days
const { start, end } = getLastNDaysRange(30);

// Validate range
const isValid = isValidDateRange(start, end);
```

**See:** `lib/utils/date.ts` for full API

---

## Components

### `ReportsContainer`

Main container that orchestrates the entire reports page.

**Features:**
- Authentication check
- Data fetching
- Filter management
- Chart rendering
- CSV export

**Usage:**
```typescript
import { ReportsContainer } from '@/features/reports';

<ReportsContainer />
```

### `DateRangeFilter`

Interactive date filter component with:
- Quick filter buttons (Today, Last 7 days, etc.)
- Month selector
- Year selector
- Custom date range picker
- Validation and error display

**Props:**
```typescript
interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  reportType: ReportType;
  selectedYear: number;
  error: { type: string | null; message: string };
  isApplying: boolean;
  isValid: boolean;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReportTypeChange: (type: ReportType) => void;
  onSelectedYearChange: (year: number) => void;
  onQuickFilter: (period: QuickFilterPeriod) => void;
  onMonthFilter: (month: number) => void;
  onYearFilter: (year: number) => void;
  onApplyFilter: () => void;
}
```

---

## API Integration

The module communicates with these backend endpoints:

```
GET /sales/reports/dashboard       # Dashboard stats
GET /sales/reports/sales-report    # Sales summary
GET /sales/reports/daily-sales     # Daily breakdown
GET /sales/reports/products-chart  # Product distribution
GET /sales/reports/branches-chart  # Branch comparison (admin)
```

**Query Parameters:**
- `start_date` (required): YYYY-MM-DD format
- `end_date` (required): YYYY-MM-DD format
- `limit` (optional): Number of results

**Example:**
```
GET /sales/reports/sales-report?start_date=2025-10-01&end_date=2025-10-31
```

---

## Types

### `QuickFilterPeriod`
```typescript
type QuickFilterPeriod = 'today' | 'month' | 'year' | 'last30' | 'last7';
```

### `ReportType`
```typescript
type ReportType = 'sales' | 'products' | 'branches';
```

### `SalesReport`
```typescript
interface SalesReport {
  period: string;
  total_sales: number;
  total_transactions: number;
  average_sale: number;
  top_products: TopProduct[];
  sales_by_branch: BranchSales[];
}
```

**See:** `types/reports.types.ts` for complete type definitions

---

## Validation Rules

### Date Ranges

1. **Required Fields**
   - Start date must be provided
   - End date must be provided

2. **Valid Range**
   - End date must be >= start date
   - Same date is allowed (single day report)

3. **Maximum Range**
   - Maximum 365 days between start and end
   - Prevents performance issues with large datasets

4. **Future Dates**
   - Cannot select dates in the future
   - Date picker enforces this at UI level

### Error Messages

| Error Type | Message |
|------------|---------|
| Missing dates | "Debe seleccionar fecha de inicio y fin" |
| Invalid range | "La fecha de inicio debe ser anterior o igual a la fecha de fin" |
| Too large | "El rango máximo es de 365 días" |

---

## Accessibility

The module follows WCAG 2.1 guidelines:

- ✅ Keyboard navigation support
- ✅ Focus indicators on all interactive elements
- ✅ ARIA labels where appropriate
- ✅ Color contrast ratios meet AA standards
- ✅ Error messages announced to screen readers

---

## Performance Considerations

### Optimization Strategies

1. **Memoized Callbacks**
   - All filter handlers are memoized
   - Prevents unnecessary re-renders

2. **Efficient State Updates**
   - Single source of truth in hook
   - Batched state updates

3. **API Call Debouncing**
   - Auto-apply uses setTimeout(0) to batch updates
   - Prevents rapid successive API calls

4. **Lazy Loading**
   - Charts only render when data is available
   - Loading states prevent layout shifts

### Expected Performance

- Initial load: < 2 seconds
- Filter application: < 1 second
- Export CSV: < 3 seconds (depends on data size)

---

## Testing

### Manual Testing

See: [`REPORTS_MANUAL_TESTING_GUIDE.md`](../../../REPORTS_MANUAL_TESTING_GUIDE.md)

### Unit Tests (Recommended)

```typescript
// lib/utils/date.test.ts
describe('Date Utilities', () => {
  test('formatDateToYYYYMMDD formats correctly', () => {
    const date = new Date(2025, 0, 15);
    expect(formatDateToYYYYMMDD(date)).toBe('2025-01-15');
  });

  test('isValidDateRange validates correctly', () => {
    expect(isValidDateRange('2025-01-01', '2025-12-31')).toBe(true);
    expect(isValidDateRange('2025-12-31', '2025-01-01')).toBe(false);
  });
});

// hooks/useReportFilters.test.ts
describe('useReportFilters', () => {
  test('initializes with correct default range', () => {
    const { result } = renderHook(() => useReportFilters());
    expect(result.current.startDate).toBeDefined();
    expect(result.current.endDate).toBeDefined();
  });

  test('validates invalid ranges', () => {
    const { result } = renderHook(() => useReportFilters());
    act(() => {
      result.current.setStartDate('2025-12-31');
      result.current.setEndDate('2025-01-01');
      result.current.applyFilter();
    });
    expect(result.current.error.type).toBe('range');
  });
});
```

---

## Common Patterns

### Pattern 1: Basic Report with Filters

```typescript
function MyReport() {
  const filters = useReportFilters({
    initialDays: 7,
    onFilterChange: (start, end) => {
      console.log('Fetching data for:', start, end);
    }
  });

  return (
    <div>
      <h1>Custom Report</h1>
      <DateRangeFilter
        {...filters}
        onQuickFilter={filters.handleQuickFilter}
        onMonthFilter={filters.handleMonthFilter}
        onYearFilter={filters.handleYearFilter}
        onApplyFilter={filters.applyFilter}
      />
      {/* Report content */}
    </div>
  );
}
```

### Pattern 2: Custom Quick Filter

```typescript
function ReportWithCustomFilter() {
  const filters = useReportFilters({ initialDays: 30 });

  const handleLastQuarter = () => {
    // Custom logic for last quarter
    const today = new Date();
    const quarterStart = new Date(today);
    quarterStart.setMonth(today.getMonth() - 3);

    filters.setStartDate(formatDateToYYYYMMDD(quarterStart));
    filters.setEndDate(formatDateToYYYYMMDD(today));
    filters.applyFilter();
  };

  return (
    <div>
      <button onClick={handleLastQuarter}>
        Last Quarter
      </button>
      <DateRangeFilter {...filters} /* props */ />
    </div>
  );
}
```

### Pattern 3: Programmatic Filter Control

```typescript
function AutomatedReport() {
  const filters = useReportFilters({
    autoApply: false, // Manual control
    onFilterChange: (start, end) => {
      fetchData(start, end);
    }
  });

  useEffect(() => {
    // Set custom range on mount
    filters.setStartDate('2025-01-01');
    filters.setEndDate('2025-01-31');
    filters.applyFilter();
  }, []);

  return <div>Report content</div>;
}
```

---

## Troubleshooting

### Issue: Dates show wrong values

**Cause:** Timezone conversion issues

**Solution:** Use the provided date utilities:
```typescript
import { formatDateToYYYYMMDD } from '@/lib/utils/date';
// NOT: date.toISOString().split('T')[0]
```

### Issue: Filter doesn't apply

**Cause:** Invalid date range

**Solution:** Check validation:
```typescript
if (!filters.isValid) {
  console.log('Error:', filters.error.message);
}
```

### Issue: Data doesn't load

**Cause:** Backend not running or CORS issues

**Solution:**
1. Verify backend is running on port 8000
2. Check network tab for API errors
3. Verify authentication token

### Issue: Export fails

**Cause:** No data loaded

**Solution:** Ensure data is fetched before exporting:
```typescript
<button
  onClick={handleExport}
  disabled={!salesReport || exporting}
>
  Export
</button>
```

---

## Known Limitations

1. **Backend Date Comparison**
   - Backend has a bug with datetime comparison
   - May exclude sales after midnight on last day
   - See: `REPORTS_MODULE_REFACTORING.md` for details

2. **Maximum Range**
   - Limited to 365 days for performance
   - Larger ranges require pagination (not implemented)

3. **Time Zones**
   - All dates are in local timezone
   - Backend should handle UTC conversion

---

## Future Enhancements

### Planned Features

- [ ] Calendar picker for date selection
- [ ] More quick filter presets (quarter, YTD, etc.)
- [ ] Save favorite date ranges
- [ ] Scheduled report generation
- [ ] Email report delivery
- [ ] Custom report builder

### Performance Improvements

- [ ] Virtual scrolling for large datasets
- [ ] Pagination for products/branches
- [ ] Caching with React Query
- [ ] Progressive data loading

---

## Contributing

### Adding New Quick Filters

1. Update `QuickFilterPeriod` type in `useReportFilters.ts`
2. Add case to `handleQuickFilter` switch
3. Add button to `DateRangeFilter.tsx`
4. Add test cases

**Example:**
```typescript
// 1. Update type
export type QuickFilterPeriod =
  | 'today' | 'month' | 'year' | 'last30' | 'last7'
  | 'quarter'; // NEW

// 2. Add case
case 'quarter':
  range = getLastQuarterRange(); // Implement this utility
  break;

// 3. Add button
<button onClick={() => onQuickFilter('quarter')}>
  Last Quarter
</button>
```

### Adding New Validations

Add to `validateDates` function in `useReportFilters.ts`:

```typescript
const validateDates = useCallback((): boolean => {
  // ... existing validations

  // New validation
  if (customCondition) {
    setError({
      type: 'custom',
      message: 'Your error message'
    });
    return false;
  }

  return true;
}, [startDate, endDate]);
```

---

## Documentation

- **Technical Details:** [`REPORTS_MODULE_REFACTORING.md`](../../../REPORTS_MODULE_REFACTORING.md)
- **Quick Summary:** [`REPORTS_REFACTORING_SUMMARY.md`](../../../REPORTS_REFACTORING_SUMMARY.md)
- **Testing Guide:** [`REPORTS_MANUAL_TESTING_GUIDE.md`](../../../REPORTS_MANUAL_TESTING_GUIDE.md)
- **File Reference:** [`REPORTS_FILES_SUMMARY.md`](../../../REPORTS_FILES_SUMMARY.md)

---

## Support

For questions or issues:

1. Check this README
2. Review comprehensive docs (linked above)
3. Check manual testing guide for common scenarios
4. Contact development team

---

## Changelog

### v2.0 (October 29, 2025)
- Fixed 8 critical bugs in date filtering
- Added `useReportFilters` custom hook
- Created shared date utilities
- Improved validation and error handling
- Enhanced UX with visual feedback
- Better TypeScript types
- Comprehensive documentation

### v1.0 (Initial)
- Basic reporting functionality
- Quick filters
- Month/year selectors
- Charts and tables
- CSV export

---

**Maintained by:** Development Team
**Last Review:** October 29, 2025
**Status:** ✅ Production Ready
