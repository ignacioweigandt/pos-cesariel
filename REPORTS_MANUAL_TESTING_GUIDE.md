# Manual Testing Guide - Reports Module

**Version:** 1.0
**Date:** October 29, 2025
**Estimated Time:** 20 minutes

---

## Prerequisites

1. Backend running on `http://localhost:8000`
2. Frontend POS running on `http://localhost:3000`
3. Test data in database (run `init_data.py` if needed)
4. User credentials: `admin` / `admin123`

---

## Test Scenarios

### 1. Quick Filters - Basic Functionality

#### Test 1.1: "Hoy" Filter
**Steps:**
1. Navigate to Reports page (`/reports`)
2. Click "Hoy" quick filter button
3. Verify dates in custom date inputs update to today's date
4. Verify data loads (charts and stats update)

**Expected:**
- ✅ Start Date = Today's date
- ✅ End Date = Today's date
- ✅ Data loads automatically
- ✅ Green "Aplicando filtros..." banner appears briefly
- ✅ Charts show today's data

**Pass/Fail:** ☐

---

#### Test 1.2: "Últimos 7 días" Filter (NEW)
**Steps:**
1. Click "Últimos 7 días" button
2. Check date range

**Expected:**
- ✅ Start Date = 7 days ago
- ✅ End Date = Today
- ✅ Data loads automatically
- ✅ Charts show 7 days of data

**Pass/Fail:** ☐

---

#### Test 1.3: "Últimos 30 días" Filter (NEW)
**Steps:**
1. Click "Últimos 30 días" button
2. Check date range

**Expected:**
- ✅ Start Date = 30 days ago
- ✅ End Date = Today
- ✅ Data loads automatically (this is the default on page load)

**Pass/Fail:** ☐

---

#### Test 1.4: "Este Mes" Filter
**Steps:**
1. Click "Este Mes" button
2. Check date range

**Expected:**
- ✅ Start Date = First day of current month (e.g., 2025-10-01)
- ✅ End Date = Last day of current month (e.g., 2025-10-31)
- ✅ Data loads automatically

**Pass/Fail:** ☐

---

#### Test 1.5: "Este Año" Filter
**Steps:**
1. Click "Este Año" button
2. Check date range

**Expected:**
- ✅ Start Date = 2025-01-01
- ✅ End Date = 2025-12-31
- ✅ Data loads automatically

**Pass/Fail:** ☐

---

### 2. Month Selector

#### Test 2.1: Select Specific Month (Current Year)
**Steps:**
1. Verify year selector shows current year (2025)
2. Click "Enero" button
3. Check date range

**Expected:**
- ✅ Start Date = 2025-01-01
- ✅ End Date = 2025-01-31
- ✅ Data loads automatically

**Pass/Fail:** ☐

---

#### Test 2.2: Select Different Year, Then Month
**Steps:**
1. Change year selector to 2024
2. Click "Diciembre" button
3. Check date range

**Expected:**
- ✅ Start Date = 2024-12-01
- ✅ End Date = 2024-12-31
- ✅ Data loads automatically

**Pass/Fail:** ☐

---

#### Test 2.3: February Edge Case
**Steps:**
1. Set year to 2024 (leap year)
2. Click "Febrero"
3. Check end date

**Expected:**
- ✅ End Date = 2024-02-29 (leap year has 29 days)

**Pass/Fail:** ☐

**Steps:**
1. Set year to 2025 (non-leap year)
2. Click "Febrero"
3. Check end date

**Expected:**
- ✅ End Date = 2025-02-28 (normal year has 28 days)

**Pass/Fail:** ☐

---

### 3. Year Selector

#### Test 3.1: Full Year Filter
**Steps:**
1. Click "2025" year button (green)
2. Check date range

**Expected:**
- ✅ Start Date = 2025-01-01
- ✅ End Date = 2025-12-31
- ✅ Data loads automatically

**Pass/Fail:** ☐

---

#### Test 3.2: Previous Year
**Steps:**
1. Click "2024" year button
2. Check date range

**Expected:**
- ✅ Start Date = 2024-01-01
- ✅ End Date = 2024-12-31

**Pass/Fail:** ☐

---

### 4. Custom Date Range

#### Test 4.1: Valid Custom Range
**Steps:**
1. Set Start Date: 2025-01-01
2. Set End Date: 2025-03-31
3. Click "Aplicar Filtros" button

**Expected:**
- ✅ No error message appears
- ✅ Data loads
- ✅ Button shows loading state briefly

**Pass/Fail:** ☐

---

#### Test 4.2: Same Start/End Date
**Steps:**
1. Set Start Date: 2025-01-15
2. Set End Date: 2025-01-15
3. Click "Aplicar Filtros"

**Expected:**
- ✅ No error (same date is valid)
- ✅ Data loads for single day

**Pass/Fail:** ☐

---

### 5. Validation Tests (NEW)

#### Test 5.1: Invalid Range - End Before Start
**Steps:**
1. Set Start Date: 2025-12-31
2. Set End Date: 2025-01-01
3. Click "Aplicar Filtros"

**Expected:**
- ✅ Red error banner appears
- ✅ Error message: "La fecha de inicio debe ser anterior o igual a la fecha de fin"
- ✅ Date inputs have red border
- ✅ "Aplicar Filtros" button is disabled
- ✅ Data does NOT reload

**Pass/Fail:** ☐

---

#### Test 5.2: Range Too Large (>365 days)
**Steps:**
1. Set Start Date: 2023-01-01
2. Set End Date: 2025-12-31
3. Click "Aplicar Filtros"

**Expected:**
- ✅ Red error banner appears
- ✅ Error message: "El rango máximo es de 365 días"
- ✅ Date inputs have red border
- ✅ Button disabled

**Pass/Fail:** ☐

---

#### Test 5.3: Empty Dates
**Steps:**
1. Clear Start Date (manually delete)
2. Click "Aplicar Filtros"

**Expected:**
- ✅ Error message: "Debe seleccionar fecha de inicio y fin"
- ✅ Button disabled

**Pass/Fail:** ☐

---

### 6. Visual Feedback Tests (NEW)

#### Test 6.1: Loading State
**Steps:**
1. Click any quick filter
2. Observe the "Aplicar Filtros" button and page state

**Expected:**
- ✅ Green "Aplicando filtros..." banner appears
- ✅ Banner disappears after ~500ms
- ✅ Loading spinner appears in data section
- ✅ Loading message: "Cargando datos del reporte..."

**Pass/Fail:** ☐

---

#### Test 6.2: Error Clearing
**Steps:**
1. Create an invalid range (end before start)
2. Observe error message
3. Fix the range (swap dates)
4. Observe error disappears

**Expected:**
- ✅ Error message disappears when dates are fixed
- ✅ Red border on inputs disappears
- ✅ Button becomes enabled

**Pass/Fail:** ☐

---

### 7. Report Type Selector

#### Test 7.1: Change Report Type
**Steps:**
1. Select "Productos" from report type dropdown
2. Select "Sucursales" from report type dropdown
3. Select "Ventas" from report type dropdown

**Expected:**
- ✅ Dropdown changes correctly
- ✅ No errors (note: currently this doesn't change the data, it's tracked for future use)

**Pass/Fail:** ☐

---

### 8. Export Functionality

#### Test 8.1: Export CSV
**Steps:**
1. Set a valid date range
2. Wait for data to load
3. Click "Exportar CSV" button

**Expected:**
- ✅ Button shows loading state: "Exportando..."
- ✅ CSV file downloads
- ✅ Button returns to normal state

**Pass/Fail:** ☐

---

#### Test 8.2: Export Without Data
**Steps:**
1. On page load (before any data)
2. Try clicking "Exportar CSV"

**Expected:**
- ✅ Button should be disabled (grayed out)

**Pass/Fail:** ☐

---

### 9. Integration Tests

#### Test 9.1: Multiple Filter Changes
**Steps:**
1. Click "Hoy"
2. Wait for data
3. Click "Este Mes"
4. Wait for data
5. Click "Últimos 30 días"
6. Wait for data

**Expected:**
- ✅ Each filter change loads new data
- ✅ No stale data from previous filter
- ✅ Charts update correctly each time

**Pass/Fail:** ☐

---

#### Test 9.2: Custom Range After Quick Filter
**Steps:**
1. Click "Este Mes"
2. Wait for data
3. Manually set custom dates: 2025-01-01 to 2025-01-15
4. Click "Aplicar Filtros"

**Expected:**
- ✅ Custom dates override quick filter
- ✅ Data loads for custom range

**Pass/Fail:** ☐

---

### 10. Edge Cases

#### Test 10.1: Future Dates (Should Be Prevented)
**Steps:**
1. Try to select a future date in the date picker

**Expected:**
- ✅ Date picker should not allow selecting future dates
- ✅ Max date should be today

**Pass/Fail:** ☐

---

#### Test 10.2: Very Old Dates
**Steps:**
1. Set Start Date: 2020-01-01
2. Set End Date: 2020-12-31
3. Click "Aplicar Filtros"

**Expected:**
- ✅ No error (valid range, within 365 days)
- ✅ Data loads (may be empty if no historical data)

**Pass/Fail:** ☐

---

#### Test 10.3: Rapid Filter Clicking
**Steps:**
1. Quickly click multiple quick filters in succession
   - "Hoy" → "Este Mes" → "Este Año" → "Últimos 7 días"

**Expected:**
- ✅ No race conditions
- ✅ Final filter (Últimos 7 días) is applied
- ✅ Data corresponds to final filter
- ✅ No multiple simultaneous API calls

**Pass/Fail:** ☐

---

## Bug Verification Checklist

Verify that these specific bugs are fixed:

### Bug 1: Timezone Issues ✅
- [ ] Selecting "Enero" shows 2025-01-01, not 2024-12-31 or 2025-01-02
- [ ] All months show correct first/last day

### Bug 2: "Today" Filter ✅
- [ ] "Hoy" shows today's full data, not just midnight sales

### Bug 3: Race Conditions ✅
- [ ] No flickering when clicking quick filters
- [ ] Data always matches the selected filter

### Bug 4: Validation ✅
- [ ] Invalid ranges show error messages
- [ ] Button disabled when range is invalid

### Bug 5: Visual Feedback ✅
- [ ] Error messages appear for invalid input
- [ ] Success feedback when applying filters
- [ ] Loading states clearly visible

---

## Performance Checks

### Test P1: Initial Load Time
**Steps:**
1. Navigate to `/reports`
2. Measure time to data display

**Expected:**
- ✅ Page loads within 2 seconds
- ✅ Default filter (last 30 days) applies automatically

**Pass/Fail:** ☐

---

### Test P2: Filter Application Speed
**Steps:**
1. Click a quick filter
2. Measure time to data update

**Expected:**
- ✅ Data updates within 1 second (network dependent)
- ✅ No noticeable lag

**Pass/Fail:** ☐

---

## Browser Compatibility

Test in multiple browsers:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**Issues found:** _________________

---

## Mobile Responsiveness

### Test M1: Mobile View
**Steps:**
1. Open Reports page on mobile or resize browser to mobile width
2. Test all filters

**Expected:**
- ✅ Filter buttons stack properly
- ✅ Date inputs are usable
- ✅ Month grid is responsive
- ✅ Charts resize appropriately

**Pass/Fail:** ☐

---

## Summary

**Total Tests:** 30+
**Tests Passed:** _____ / _____
**Tests Failed:** _____ / _____
**Critical Issues:** _____
**Minor Issues:** _____

**Overall Status:** ☐ PASS ☐ FAIL

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

**Tester:** _________________
**Date:** _________________
**Time Spent:** _________________

---

## Common Issues & Solutions

### Issue: Data doesn't load
**Solution:** Check backend is running on port 8000

### Issue: Dates look wrong
**Solution:** Check browser timezone settings

### Issue: Error messages don't disappear
**Solution:** Refresh page, this may indicate a bug

### Issue: Export doesn't work
**Solution:** Ensure data is loaded before exporting

---

## Regression Testing

Verify existing functionality still works:

- [ ] Stats cards display correctly
- [ ] Daily sales chart renders
- [ ] Products pie chart shows data
- [ ] Branch sales chart visible (admin only)
- [ ] Top products table works
- [ ] All navigation works

**Regression Issues:** _________________

---

**Testing Complete!** ✅

If all tests pass, the refactoring is successful and ready for production.
