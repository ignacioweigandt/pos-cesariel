/** Wrappers seguros para localStorage y sessionStorage con parseo JSON automático */

/** Obtener y parsear item de localStorage */
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

/** Guardar item en localStorage con stringify automático */
export function setLocalStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/** Eliminar item de localStorage */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/** Limpiar todo el localStorage */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/** Obtener y parsear item de sessionStorage */
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

/** Guardar item en sessionStorage con stringify automático */
export function setSessionStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to sessionStorage key "${key}":`, error);
  }
}

/** Eliminar item de sessionStorage */
export function removeSessionStorage(key: string): void{
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

/** Limpiar todo el sessionStorage */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}
