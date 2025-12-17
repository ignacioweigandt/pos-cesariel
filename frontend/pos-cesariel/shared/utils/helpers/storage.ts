/**
 * Storage utilities
 *
 * Provides safe wrappers for localStorage and sessionStorage
 */

/**
 * Get item from localStorage with JSON parsing
 * @param key - Storage key
 * @returns Parsed value or null
 */
export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in localStorage with JSON stringification
 * @param key - Storage key
 * @param value - Value to store
 */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/**
 * Remove item from localStorage
 * @param key - Storage key
 */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/**
 * Clear all items from localStorage
 */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Get item from sessionStorage with JSON parsing
 * @param key - Storage key
 * @returns Parsed value or null
 */
export function getSessionStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading sessionStorage key "${key}":`, error);
    return null;
  }
}

/**
 * Set item in sessionStorage with JSON stringification
 * @param key - Storage key
 * @param value - Value to store
 */
export function setSessionStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to sessionStorage key "${key}":`, error);
  }
}

/**
 * Remove item from sessionStorage
 * @param key - Storage key
 */
export function removeSessionStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

/**
 * Clear all items from sessionStorage
 */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}
