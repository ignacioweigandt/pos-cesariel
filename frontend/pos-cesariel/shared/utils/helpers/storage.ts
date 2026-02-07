/** Wrappers seguros para localStorage y sessionStorage con parseo JSON automático */

// ✅ OPTIMIZATION: Cache localStorage reads (js-cache-storage pattern)
// localStorage.getItem() is synchronous and expensive (~1-5ms per call)
// Cache in memory to avoid repeated I/O operations
const localStorageCache = new Map<string, any>();

/** Obtener y parsear item de localStorage (con cache en memoria) */
export function getLocalStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  // Check cache first
  if (localStorageCache.has(key)) {
    return localStorageCache.get(key) as T | null;
  }

  try {
    const item = localStorage.getItem(key);
    const parsed = item ? JSON.parse(item) : null;
    
    // Cache the result
    localStorageCache.set(key, parsed);
    
    return parsed;
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
    // Update cache to keep it in sync
    localStorageCache.set(key, value);
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
}

/** Eliminar item de localStorage */
export function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(key);
    // Remove from cache
    localStorageCache.delete(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

/** Limpiar todo el localStorage */
export function clearLocalStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.clear();
    // Clear cache
    localStorageCache.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

// ✅ OPTIMIZATION: Invalidate cache on storage events (cross-tab changes)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key) {
      localStorageCache.delete(e.key);
    } else {
      // key is null when localStorage.clear() is called
      localStorageCache.clear();
    }
  });

  // Invalidate cache when tab becomes visible (in case changes happened in other tabs)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      localStorageCache.clear();
    }
  });
}

// ✅ OPTIMIZATION: Cache sessionStorage reads too
const sessionStorageCache = new Map<string, any>();

/** Obtener y parsear item de sessionStorage (con cache en memoria) */
export function getSessionStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;

  // Check cache first
  if (sessionStorageCache.has(key)) {
    return sessionStorageCache.get(key) as T | null;
  }

  try {
    const item = sessionStorage.getItem(key);
    const parsed = item ? JSON.parse(item) : null;
    
    // Cache the result
    sessionStorageCache.set(key, parsed);
    
    return parsed;
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
    // Update cache to keep it in sync
    sessionStorageCache.set(key, value);
  } catch (error) {
    console.error(`Error writing to sessionStorage key "${key}":`, error);
  }
}

/** Eliminar item de sessionStorage */
export function removeSessionStorage(key: string): void{
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(key);
    // Remove from cache
    sessionStorageCache.delete(key);
  } catch (error) {
    console.error(`Error removing sessionStorage key "${key}":`, error);
  }
}

/** Limpiar todo el sessionStorage */
export function clearSessionStorage(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.clear();
    // Clear cache
    sessionStorageCache.clear();
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }
}
