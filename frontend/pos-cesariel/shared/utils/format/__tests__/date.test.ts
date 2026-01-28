/**
 * Tests for date formatting utilities
 */

import {
  formatDate,
  formatDateOnly,
  formatTimeOnly,
  formatDateTime,
  formatRelativeTime,
  parseDate,
} from '../date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format ISO string with time', () => {
      const result = formatDate('2024-11-13T14:57:00');
      expect(result).toBe('13/11/2024, 14:57');
    });

    it('should format ISO string with milliseconds', () => {
      const result = formatDate('2024-11-13T14:57:00.123456');
      expect(result).toBe('13/11/2024, 14:57');
    });

    it('should format Date object', () => {
      const date = new Date('2024-11-13T14:57:00');
      const result = formatDate(date);
      // Will match the pattern DD/MM/YYYY, HH:mm
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}/);
    });

    it('should handle midnight', () => {
      const result = formatDate('2024-01-01T00:00:00');
      expect(result).toBe('01/01/2024, 00:00');
    });

    it('should handle end of day', () => {
      const result = formatDate('2024-12-31T23:59:00');
      expect(result).toBe('31/12/2024, 23:59');
    });

    it('should pad single digits with zero', () => {
      const result = formatDate('2024-05-03T09:05:00');
      expect(result).toBe('03/05/2024, 09:05');
    });
  });

  describe('formatDateOnly', () => {
    it('should format date without time', () => {
      const result = formatDateOnly('2024-11-13T14:57:00');
      // es-AR locale formats as DD/MM/YYYY
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should format Date object', () => {
      const date = new Date('2024-11-13');
      const result = formatDateOnly(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle leap year', () => {
      const result = formatDateOnly('2024-02-29T00:00:00');
      expect(result).toContain('29');
      expect(result).toContain('02');
      expect(result).toContain('2024');
    });
  });

  describe('formatTimeOnly', () => {
    it('should format time from ISO string', () => {
      const result = formatTimeOnly('2024-11-13T14:57:00');
      expect(result).toBe('14:57');
    });

    it('should format time from Date object', () => {
      const date = new Date('2024-11-13T14:57:00');
      const result = formatTimeOnly(date);
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle midnight', () => {
      const result = formatTimeOnly('2024-01-01T00:00:00');
      expect(result).toBe('00:00');
    });

    it('should handle end of day', () => {
      const result = formatTimeOnly('2024-12-31T23:59:00');
      expect(result).toBe('23:59');
    });

    it('should pad single digit hours and minutes', () => {
      const result = formatTimeOnly('2024-01-01T09:05:00');
      expect(result).toBe('09:05');
    });
  });

  describe('formatDateTime', () => {
    it('should format date and time with seconds', () => {
      const result = formatDateTime('2024-11-13T14:57:30');
      expect(result).toBe('13/11/2024, 14:57:30');
    });

    it('should format Date object with seconds', () => {
      const date = new Date('2024-11-13T14:57:30');
      const result = formatDateTime(date);
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/);
    });

    it('should handle zero seconds', () => {
      const result = formatDateTime('2024-11-13T14:57:00');
      expect(result).toBe('13/11/2024, 14:57:00');
    });

    it('should handle 59 seconds', () => {
      const result = formatDateTime('2024-11-13T14:57:59');
      expect(result).toBe('13/11/2024, 14:57:59');
    });
  });

  describe('formatRelativeTime', () => {
    beforeEach(() => {
      // Mock current time for consistent tests
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-11-13T14:00:00'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should format seconds ago', () => {
      const date = new Date('2024-11-13T13:59:45'); // 15 seconds ago
      const result = formatRelativeTime(date);
      expect(result).toContain('15');
      expect(result).toMatch(/segundo/i);
    });

    it('should format minutes ago', () => {
      const date = new Date('2024-11-13T13:55:00'); // 5 minutes ago
      const result = formatRelativeTime(date);
      expect(result).toContain('5');
      expect(result).toMatch(/minuto/i);
    });

    it('should format hours ago', () => {
      const date = new Date('2024-11-13T12:00:00'); // 2 hours ago
      const result = formatRelativeTime(date);
      expect(result).toContain('2');
      expect(result).toMatch(/hora/i);
    });

    it('should format days ago', () => {
      const date = new Date('2024-11-10T14:00:00'); // 3 days ago
      const result = formatRelativeTime(date);
      expect(result).toContain('3');
      expect(result).toMatch(/día/i);
    });

    it('should handle future dates', () => {
      const date = new Date('2024-11-13T15:00:00'); // 1 hour in future
      const result = formatRelativeTime(date);
      // Should be "in 1 hour" or similar
      expect(result).toMatch(/hora|hour/i);
    });

    it('should format months ago', () => {
      const date = new Date('2024-10-13T14:00:00'); // ~1 month ago
      const result = formatRelativeTime(date);
      expect(result).toMatch(/mes|month/i);
    });

    it('should format years ago', () => {
      const date = new Date('2023-11-13T14:00:00'); // 1 year ago
      const result = formatRelativeTime(date);
      expect(result).toMatch(/año|year/i);
    });
  });

  describe('parseDate', () => {
    it('should parse valid ISO string', () => {
      const result = parseDate('2024-11-13T14:57:00');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
      expect(result?.getMonth()).toBe(10); // November (0-indexed)
      expect(result?.getDate()).toBe(13);
    });

    it('should parse date-only string', () => {
      const result = parseDate('2024-11-13');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2024);
    });

    it('should return null for invalid string', () => {
      expect(parseDate('invalid-date')).toBeNull();
      expect(parseDate('')).toBeNull();
      expect(parseDate('not a date')).toBeNull();
    });

    it('should parse various valid formats', () => {
      expect(parseDate('2024-11-13')).toBeInstanceOf(Date);
      expect(parseDate('2024-11-13T14:57:00')).toBeInstanceOf(Date);
      expect(parseDate('2024-11-13T14:57:00.123Z')).toBeInstanceOf(Date);
    });

    it('should handle leap year dates', () => {
      const result = parseDate('2024-02-29T00:00:00');
      expect(result).toBeInstanceOf(Date);
      // Date parsing may be affected by timezone, just check it's valid
      expect(result).not.toBeNull();
    });

    it('should handle invalid dates gracefully', () => {
      // JavaScript Date allows overflow (2023-02-29 becomes 2023-03-01)
      // parseDate doesn't validate, just checks if Date constructor succeeds
      const result = parseDate('2023-02-29');
      // Will be a valid Date object (overflows to March 1)
      expect(result).toBeInstanceOf(Date);
    });
  });
});
