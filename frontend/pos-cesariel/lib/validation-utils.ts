/**
 * Utilidades de validación compartidas
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida que un string no esté vacío
 */
export function validateRequired(value: string, fieldName: string = 'Campo'): ValidationResult {
  if (!value || value.trim().length === 0) {
    return {
      valid: false,
      error: `${fieldName} es requerido`
    };
  }
  return { valid: true };
}

/**
 * Valida longitud mínima de un string
 */
export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string = 'Campo'
): ValidationResult {
  if (value.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} debe tener al menos ${minLength} caracteres`
    };
  }
  return { valid: true };
}

/**
 * Valida longitud máxima de un string
 */
export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string = 'Campo'
): ValidationResult {
  if (value.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} no debe superar ${maxLength} caracteres`
    };
  }
  return { valid: true };
}

/**
 * Valida que un número esté dentro de un rango
 */
export function validateRange(
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Valor'
): ValidationResult {
  if (value < min || value > max) {
    return {
      valid: false,
      error: `${fieldName} debe estar entre ${min} y ${max}`
    };
  }
  return { valid: true };
}

/**
 * Valida formato de URL
 */
export function validateUrl(url: string): ValidationResult {
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return {
      valid: false,
      error: 'URL inválida. Debe incluir el protocolo (https://)'
    };
  }
}

/**
 * Valida formato de email
 */
export function validateEmail(email: string): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      valid: false,
      error: 'Formato de email inválido'
    };
  }
  return { valid: true };
}

/**
 * Valida número de teléfono (formato argentino)
 */
export function validatePhone(phone: string): ValidationResult {
  // Acepta formatos: +54..., 54..., 11..., etc.
  const phoneRegex = /^(\+?54)?[\s-]?(\d{2,4})[\s-]?(\d{6,8})$/;
  if (!phoneRegex.test(phone)) {
    return {
      valid: false,
      error: 'Formato de teléfono inválido. Ej: +54 11 1234-5678'
    };
  }
  return { valid: true };
}

/**
 * Valida que un número sea positivo
 */
export function validatePositive(value: number, fieldName: string = 'Valor'): ValidationResult {
  if (value < 0) {
    return {
      valid: false,
      error: `${fieldName} debe ser positivo`
    };
  }
  return { valid: true };
}

/**
 * Valida porcentaje (0-100)
 */
export function validatePercentage(value: number): ValidationResult {
  if (value < 0 || value > 100) {
    return {
      valid: false,
      error: 'El porcentaje debe estar entre 0 y 100'
    };
  }
  return { valid: true };
}

/**
 * Valida múltiples campos y retorna todos los errores
 */
export function validateMultiple(
  validations: Array<() => ValidationResult>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const validation of validations) {
    const result = validation();
    if (!result.valid && result.error) {
      errors.push(result.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitiza un string eliminando caracteres peligrosos
 */
export function sanitizeString(value: string): string {
  return value
    .trim()
    .replace(/[<>]/g, '') // Elimina < y >
    .replace(/javascript:/gi, '') // Elimina javascript:
    .replace(/on\w+=/gi, ''); // Elimina atributos on*=
}

/**
 * Valida código postal argentino
 */
export function validatePostalCode(code: string): ValidationResult {
  // Formato argentino: 4 dígitos o letra + 4 dígitos
  const postalRegex = /^[A-Z]?\d{4}$/i;
  if (!postalRegex.test(code)) {
    return {
      valid: false,
      error: 'Código postal inválido. Formato: 1234 o A1234'
    };
  }
  return { valid: true };
}

/**
 * Valida CUIT/CUIL argentino
 */
export function validateCuit(cuit: string): ValidationResult {
  // Elimina guiones y espacios
  const cleanCuit = cuit.replace(/[-\s]/g, '');

  if (cleanCuit.length !== 11) {
    return {
      valid: false,
      error: 'CUIT/CUIL debe tener 11 dígitos'
    };
  }

  if (!/^\d{11}$/.test(cleanCuit)) {
    return {
      valid: false,
      error: 'CUIT/CUIL debe contener solo números'
    };
  }

  return { valid: true };
}
