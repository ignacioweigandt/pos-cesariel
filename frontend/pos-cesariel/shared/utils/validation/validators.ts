/**
 * Validation utilities
 *
 * Provides common validation functions for forms and data
 */

/**
 * Validate email format
 * @param email - Email address to validate
 * @returns True if valid email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Alternative name for validateEmail for backward compatibility
 */
export const isValidEmail = validateEmail;

/**
 * Validate Argentine phone number format
 * Accepts formats: +54 11 1234-5678, 011 1234-5678, 11 1234-5678
 * @param phone - Phone number to validate
 * @returns True if valid phone format
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+54\s?)?(\d{2,4})\s?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ' ').trim());
}

/**
 * Alternative name for validatePhone for backward compatibility
 */
export const isValidPhone = validatePhone;

/**
 * Validate password strength
 * Requires: minimum 8 characters, at least one letter and one number
 * @param password - Password to validate
 * @returns True if password meets requirements
 */
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/**
 * Validate required field (not empty)
 * @param value - Value to validate
 * @returns True if value is not empty
 */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/**
 * Validate minimum length for strings
 * @param value - String to validate
 * @param minLength - Minimum length required
 * @returns True if string meets minimum length
 */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/**
 * Validate maximum length for strings
 * @param value - String to validate
 * @param maxLength - Maximum length allowed
 * @returns True if string is within maximum length
 */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/**
 * Validate number is within range
 * @param value - Number to validate
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns True if number is within range
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if valid URL format
 */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate Argentine CUIT/CUIL format
 * @param cuit - CUIT/CUIL to validate
 * @returns True if valid format (XX-XXXXXXXX-X)
 */
export function validateCUIT(cuit: string): boolean {
  const cuitRegex = /^\d{2}-?\d{8}-?\d{1}$/;
  return cuitRegex.test(cuit);
}

/**
 * Validate credit card number using Luhn algorithm
 * @param cardNumber - Credit card number to validate
 * @returns True if valid card number
 */
export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  if (!/^\d+$/.test(cleaned)) return false;

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * Validate postal code (Argentine format)
 * @param postalCode - Postal code to validate
 * @returns True if valid format (XXXX or AXXXX)
 */
export function validatePostalCode(postalCode: string): boolean {
  const postalRegex = /^[A-Z]?\d{4}$/;
  return postalRegex.test(postalCode.toUpperCase());
}
