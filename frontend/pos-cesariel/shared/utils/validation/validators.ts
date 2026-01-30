/** Validadores comunes para formularios y datos */

/** Validar formato de email */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const isValidEmail = validateEmail;

/** Validar teléfono argentino (formatos: +54 11 1234-5678, 011 1234-5678, 11 1234-5678) */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^(\+54\s?)?(\d{2,4})\s?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ' ').trim());
}

export const isValidPhone = validatePhone;

/** Validar fortaleza de contraseña (mínimo 8 caracteres, al menos 1 letra y 1 número) */
export function validatePassword(password: string): boolean {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
}

/** Validar campo requerido (no vacío) */
export function validateRequired(value: any): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (typeof value === 'number') return !isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

/** Validar longitud mínima de string */
export function validateMinLength(value: string, minLength: number): boolean {
  return value.length >= minLength;
}

/** Validar longitud máxima de string */
export function validateMaxLength(value: string, maxLength: number): boolean {
  return value.length <= maxLength;
}

/** Validar número dentro de rango (inclusivo) */
export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/** Validar formato de URL */
export function validateURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/** Validar CUIT/CUIL argentino (formato: XX-XXXXXXXX-X) */
export function validateCUIT(cuit: string): boolean {
  const cuitRegex = /^\d{2}-?\d{8}-?\d{1}$/;
  return cuitRegex.test(cuit);
}

/** Validar número de tarjeta de crédito (algoritmo de Luhn) */
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

/** Validar código postal argentino (formato: XXXX o AXXXX) */
export function validatePostalCode(postalCode: string): boolean {
  const postalRegex = /^[A-Z]?\d{4}$/;
  return postalRegex.test(postalCode.toUpperCase());
}
