/**
 * API Client Tests
 *
 * Tests for error handling and graceful degradation
 */

import { apiFetch, apiFetchWithDefault, ApiError } from '../client';

// Mock fetch globally
global.fetch = jest.fn();

describe('apiFetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('successful responses', () => {
    it('should return data on successful fetch', async () => {
      const mockData = { id: 1, name: 'Test Product' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiFetch('/products');

      expect(result).toEqual(mockData);
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:8000/products',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should apply Next.js caching options', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await apiFetch('/products', {
        revalidate: 300,
        tags: ['products'],
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 300,
            tags: ['products'],
          },
        })
      );
    });
  });

  describe('network errors', () => {
    it('should return null on fetch failure (backend down)', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('fetch failed')
      );

      const result = await apiFetch('/products');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[API] Network error'),
        expect.objectContaining({
          message: 'fetch failed',
          backend: 'http://localhost:8000',
        })
      );
    });

    it('should return null on timeout', async () => {
      const timeoutError = new Error('AbortError');
      timeoutError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(timeoutError);

      const result = await apiFetch('/products');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });

    it('should NOT throw on network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new TypeError('fetch failed')
      );

      // Should NOT throw
      await expect(apiFetch('/products')).resolves.toBeNull();
    });
  });

  describe('HTTP errors', () => {
    it('should return null on 404', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      const result = await apiFetch('/products/999');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[API] API Error: 404 Not Found')
      );
    });

    it('should return null on 500', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = await apiFetch('/products');

      expect(result).toBeNull();
    });

    it('should throw on HTTP errors when throwOnError is true', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(
        apiFetch('/products/999', { throwOnError: true })
      ).rejects.toThrow(ApiError);
    });
  });

  describe('unexpected errors', () => {
    it('should return null on unexpected errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Unexpected error')
      );

      const result = await apiFetch('/products');

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[API] Unexpected error'),
        expect.any(Error)
      );
    });
  });
});

describe('apiFetchWithDefault', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return data on success', async () => {
    const mockData = [{ id: 1, name: 'Product' }];
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiFetchWithDefault('/products', []);

    expect(result).toEqual(mockData);
  });

  it('should return default value on failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    const defaultValue = [{ id: 0, name: 'Default' }];
    const result = await apiFetchWithDefault('/products', defaultValue);

    expect(result).toEqual(defaultValue);
  });

  it('should never return null', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    const result = await apiFetchWithDefault('/products', []);

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('ApiError', () => {
  it('should create error with message', () => {
    const error = new ApiError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('Test error');
  });

  it('should create error with status and endpoint', () => {
    const error = new ApiError('Not found', 404, '/products/999');

    expect(error.status).toBe(404);
    expect(error.endpoint).toBe('/products/999');
  });

  it('should be catchable in try-catch', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    try {
      await apiFetch('/products', { throwOnError: true });
      fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      if (error instanceof ApiError) {
        expect(error.status).toBe(500);
      }
    }
  });
});

describe('graceful degradation scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should handle backend completely down', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new TypeError('fetch failed')
    );

    const banners = await apiFetch<any[]>('/banners');
    const products = await apiFetch<any[]>('/products');
    const categories = await apiFetch<any[]>('/categories');

    expect(banners).toBeNull();
    expect(products).toBeNull();
    expect(categories).toBeNull();
  });

  it('should handle partial failures gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }],
      })
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 2 }],
      });

    const [products, categories, banners] = await Promise.all([
      apiFetch<any[]>('/products'),
      apiFetch<any[]>('/categories'),
      apiFetch<any[]>('/banners'),
    ]);

    expect(products).toEqual([{ id: 1 }]); // Success
    expect(categories).toBeNull(); // Failed
    expect(banners).toEqual([{ id: 2 }]); // Success
  });

  it('should not break Promise.all on errors', async () => {
    (global.fetch as jest.Mock)
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockRejectedValueOnce(new TypeError('fetch failed'))
      .mockRejectedValueOnce(new TypeError('fetch failed'));

    const results = await Promise.all([
      apiFetch('/products'),
      apiFetch('/categories'),
      apiFetch('/banners'),
    ]);

    expect(results).toEqual([null, null, null]);
  });
});
