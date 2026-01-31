// API Client - Server-side fetch wrapper with caching

// Production backend URL for Railway deployment
const PRODUCTION_BACKEND_URL = 'https://backend-production-c20a.up.railway.app';

// Dynamic API URL detection
// - Server-side (SSR): Use API_URL env var, fallback to production URL or localhost
// - Client-side: Use NEXT_PUBLIC_API_URL, fallback to production URL or localhost
function getApiBaseUrl(): string {
  // Server-side (Node.js)
  if (typeof window === 'undefined') {
    // Check for explicit API_URL first
    if (process.env.API_URL) {
      return process.env.API_URL;
    }
    // In production (Railway), use the production backend URL
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
      return PRODUCTION_BACKEND_URL;
    }
    // Local Docker development
    return 'http://backend:8000';
  }

  // Client-side (browser)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // Check if we're on production domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
    return PRODUCTION_BACKEND_URL;
  }
  return 'http://localhost:8000';
}

const API_BASE_URL = getApiBaseUrl();

interface FetchOptions extends RequestInit {
  revalidate?: number;
  tags?: string[];
  throwOnError?: boolean; // Control error propagation
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch server-side con manejo de errores:
 * - Network errors → null (no se lanzan, degradación graceful)
 * - HTTP errors → throw solo si throwOnError=true
 */
export async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const {
    revalidate = 3600,
    tags = [],
    throwOnError = false,
    ...fetchOptions
  } = options;

  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      next: {
        revalidate,
        tags,
      },
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
      // Add timeout to prevent hanging requests (30s for Railway cold starts)
      signal: fetchOptions.signal || AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const error = new ApiError(
        `API Error: ${response.status} ${response.statusText}`,
        response.status,
        endpoint
      );

      if (throwOnError) {
        throw error;
      }

      console.error(`[API] ${error.message}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    // Network errors (fetch failed, timeout, DNS issues)
    if (error instanceof TypeError || error.name === 'AbortError') {
      console.warn(
        `[API] Backend unavailable for ${endpoint}\n` +
        `Backend: ${API_BASE_URL}\n` +
        `Reason: ${error instanceof Error ? error.message : 'Network error'}\n` +
        `Note: Using fallback data (graceful degradation)`
      );

      // NEVER throw network errors - graceful degradation
      return null;
    }

    // ApiError already logged above
    if (error instanceof ApiError) {
      return null;
    }

    // Unexpected errors
    console.error(`[API] Unexpected error for ${endpoint}:`, error);
    return null;
  }
}

/** Wrapper con valor por defecto - retorna defaultValue si fetch falla */
export async function apiFetchWithDefault<T>(
  endpoint: string,
  defaultValue: T,
  options: FetchOptions = {}
): Promise<T> {
  const result = await apiFetch<T>(endpoint, options);
  return result ?? defaultValue;
}
