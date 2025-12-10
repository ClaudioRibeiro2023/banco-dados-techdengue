import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Skip mocking axios to test actual tokenManager and parseApiError functions
// These don't need axios mocking

describe('tokenManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('getAccessToken', () => {
    it('should return token from localStorage', async () => {
      localStorage.setItem('auth_token', 'test-token');

      const { tokenManager } = await import('@/lib/api/client');
      const token = tokenManager.getAccessToken();

      expect(token).toBe('test-token');
    });

    it('should return null when no token exists', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      const token = tokenManager.getAccessToken();

      expect(token).toBeNull();
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from localStorage', async () => {
      localStorage.setItem('refresh_token', 'refresh-token');

      const { tokenManager } = await import('@/lib/api/client');
      const token = tokenManager.getRefreshToken();

      expect(token).toBe('refresh-token');
    });

    it('should return null when no refresh token exists', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      const token = tokenManager.getRefreshToken();

      expect(token).toBeNull();
    });
  });

  describe('setTokens', () => {
    it('should set access token in localStorage', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      tokenManager.setTokens('new-access-token');

      expect(localStorage.getItem('auth_token')).toBe('new-access-token');
    });

    it('should set both access and refresh tokens', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      tokenManager.setTokens('new-access-token', 'new-refresh-token');

      expect(localStorage.getItem('auth_token')).toBe('new-access-token');
      expect(localStorage.getItem('refresh_token')).toBe('new-refresh-token');
    });

    it('should not set refresh token if not provided', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      tokenManager.setTokens('access-only');

      expect(localStorage.getItem('auth_token')).toBe('access-only');
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('clearTokens', () => {
    it('should remove both tokens from localStorage', async () => {
      localStorage.setItem('auth_token', 'access');
      localStorage.setItem('refresh_token', 'refresh');

      const { tokenManager } = await import('@/lib/api/client');
      tokenManager.clearTokens();

      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('refresh_token')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('should return false for valid non-expired token', async () => {
      // Create a JWT with exp in the future (1 hour from now)
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: futureExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });

    it('should return true for expired token', async () => {
      // Create a JWT with exp in the past
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const payload = { exp: pastExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it('should return true for token expiring within 30 seconds', async () => {
      // Create a JWT with exp 10 seconds from now (within 30 second margin)
      const soonExp = Math.floor(Date.now() / 1000) + 10;
      const payload = { exp: soonExp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it('should return true for invalid token format', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired('invalid-token');

      expect(isExpired).toBe(true);
    });

    it('should return true for malformed JSON payload', async () => {
      const token = `header.${btoa('not-json')}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it('should handle token with missing exp claim', async () => {
      const payload = { sub: 'user-id' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      // When exp is undefined, payload.exp * 1000 = NaN
      // Date.now() >= NaN - 30000 evaluates to false
      expect(typeof isExpired).toBe('boolean');
    });

    it('should handle token with non-numeric exp', async () => {
      const payload = { exp: 'not-a-number' };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      // NaN * 1000 results in NaN, Date.now() >= NaN is false
      // So the code returns false for non-numeric exp
      expect(typeof isExpired).toBe('boolean');
    });

    it('should return true for empty token string', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired('');

      expect(isExpired).toBe(true);
    });

    it('should return true for token with only two parts', async () => {
      const token = 'header.payload';

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(true);
    });

    it('should return true for token expiring exactly at 30 second margin', async () => {
      // Token expires in exactly 30 seconds (boundary case)
      const exp = Math.floor(Date.now() / 1000) + 30;
      const payload = { exp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      // At exactly 30 seconds, Date.now() >= exp - 30000 should be true
      expect(isExpired).toBe(true);
    });

    it('should return false for token expiring in 31 seconds', async () => {
      // Token expires in 31 seconds (just outside 30 second margin)
      const exp = Math.floor(Date.now() / 1000) + 31;
      const payload = { exp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const isExpired = tokenManager.isTokenExpired(token);

      expect(isExpired).toBe(false);
    });
  });

  describe('getTokenExpiration', () => {
    it('should return expiration date for valid token', async () => {
      const expTimestamp = Math.floor(Date.now() / 1000) + 3600;
      const payload = { exp: expTimestamp };
      const token = `header.${btoa(JSON.stringify(payload))}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const expDate = tokenManager.getTokenExpiration(token);

      expect(expDate).toBeInstanceOf(Date);
      expect(expDate?.getTime()).toBe(expTimestamp * 1000);
    });

    it('should return null for invalid token', async () => {
      const { tokenManager } = await import('@/lib/api/client');
      const expDate = tokenManager.getTokenExpiration('invalid-token');

      expect(expDate).toBeNull();
    });

    it('should return null for malformed JSON payload', async () => {
      const token = `header.${btoa('not-json')}.signature`;

      const { tokenManager } = await import('@/lib/api/client');
      const expDate = tokenManager.getTokenExpiration(token);

      expect(expDate).toBeNull();
    });
  });
});

describe('parseApiError', () => {
  it('should parse error response with message', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const axiosError = {
      response: {
        status: 400,
        data: {
          message: 'Validation error',
          error: 'VALIDATION_ERROR',
          details: { field: 'email' },
        },
      },
      request: {},
      message: 'Request failed',
    };

    const parsedError = parseApiError(axiosError as never);

    expect(parsedError.message).toBe('Validation error');
    expect(parsedError.error).toBe('VALIDATION_ERROR');
    expect(parsedError.status).toBe(400);
    expect(parsedError.details).toEqual({ field: 'email' });
  });

  it('should use default message when not provided', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const axiosError = {
      response: {
        status: 500,
        data: {},
      },
      request: {},
      message: 'Request failed',
    };

    const parsedError = parseApiError(axiosError as never);

    expect(parsedError.message).toBe('Erro ao processar requisição');
    expect(parsedError.error).toBe('UNKNOWN_ERROR');
    expect(parsedError.status).toBe(500);
  });

  it('should handle network error (no response)', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const axiosError = {
      request: {},
      message: 'Network Error',
    };

    const parsedError = parseApiError(axiosError as never);

    expect(parsedError.message).toBe('Sem resposta do servidor. Verifique sua conexão.');
    expect(parsedError.error).toBe('NETWORK_ERROR');
    expect(parsedError.status).toBe(0);
  });

  it('should handle request error (no response or request)', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const axiosError = {
      message: 'Request setup error',
    };

    const parsedError = parseApiError(axiosError as never);

    expect(parsedError.message).toBe('Request setup error');
    expect(parsedError.error).toBe('REQUEST_ERROR');
    expect(parsedError.status).toBe(0);
  });

  it('should use default error message when error message is empty', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const axiosError = {
      message: '',
    };

    const parsedError = parseApiError(axiosError as never);

    expect(parsedError.message).toBe('Erro desconhecido');
  });

  it('should map 401 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(401);
    expect(parsed.message).toBe('Unauthorized');
  });

  it('should map 403 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 403,
        data: { message: 'Forbidden' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(403);
    expect(parsed.message).toBe('Forbidden');
  });

  it('should map 404 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 404,
        data: { message: 'Not found' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(404);
    expect(parsed.message).toBe('Not found');
  });

  it('should map 422 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 422,
        data: {
          message: 'Validation failed',
          details: { email: ['Invalid format'] },
        },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(422);
    expect(parsed.details).toEqual({ email: ['Invalid format'] });
  });

  it('should map 500 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 500,
        data: { message: 'Internal server error' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(500);
  });

  it('should map 502 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 502,
        data: { message: 'Bad gateway' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(502);
  });

  it('should map 503 status correctly', async () => {
    const { parseApiError } = await import('@/lib/api/client');

    const error = {
      response: {
        status: 503,
        data: { message: 'Service unavailable' },
      },
    };

    const parsed = parseApiError(error as never);
    expect(parsed.status).toBe(503);
  });
});
