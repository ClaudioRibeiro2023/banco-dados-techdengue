import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from 'vitest';
import { server } from '@/mocks/server';
import { http, HttpResponse } from 'msw';

// API Base URL for tests - must match MSW handlers
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sistematechdengue.com/api/v1';

describe('API Integration Tests', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'bypass' });
  });

  afterEach(() => {
    server.resetHandlers();
  });

  afterAll(() => {
    server.close();
  });

  describe('Authentication API', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'teste@techdengue.com',
          password: 'senha123',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('refresh_token');
      expect(data).toHaveProperty('user');
    });

    it('should reject login with invalid credentials', async () => {
      server.use(
        http.post(`${API_BASE}/auth/login`, () => {
          return HttpResponse.json(
            { message: 'Invalid credentials' },
            { status: 401 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'wrong@email.com',
          password: 'wrongpassword',
        }),
      });

      expect(response.status).toBe(401);
    });

    it('should return user data from /auth/me', async () => {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('id');
      expect(data).toHaveProperty('email');
      expect(data).toHaveProperty('nome');
    });

    it('should reject unauthenticated requests to /auth/me', async () => {
      server.use(
        http.get(`${API_BASE}/auth/me`, () => {
          return HttpResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/auth/me`);
      expect(response.status).toBe(401);
    });

    it('should refresh tokens successfully', async () => {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refresh_token: 'valid-refresh-token',
        }),
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('access_token');
      expect(data).toHaveProperty('refresh_token');
    });

    it('should logout successfully', async () => {
      const response = await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
    });

    it('should request password reset', async () => {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'user@techdengue.com',
        }),
      });

      expect(response.ok).toBe(true);
    });

    it('should reset password with valid token', async () => {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'valid-reset-token',
          password: 'newPassword123',
        }),
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Dashboard API', () => {
    it('should fetch KPIs data', async () => {
      const response = await fetch(`${API_BASE}/dashboard/kpis`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      // Mock returns objects with value, trend, previousValue
      expect(data).toHaveProperty('hectaresMapeados');
      expect(data.hectaresMapeados).toHaveProperty('value');
    });

    it('should handle KPIs error gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/dashboard/kpis`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(500);
    });

    it('should fetch KPIs with date filters', async () => {
      const params = new URLSearchParams({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      const response = await fetch(`${API_BASE}/dashboard/kpis?${params}`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
    });

    it('should fetch KPIs with municipality filter', async () => {
      const params = new URLSearchParams({
        municipioId: '1',
      });

      const response = await fetch(`${API_BASE}/dashboard/kpis?${params}`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
    });
  });

  describe('Banco TechDengue API', () => {
    it('should fetch criadouros list', async () => {
      const response = await fetch(`${API_BASE}/banco-techdengue`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should fetch criadouros with pagination', async () => {
      const params = new URLSearchParams({
        page: '1',
        limit: '20',
      });

      const response = await fetch(`${API_BASE}/banco-techdengue?${params}`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
    });

    it('should fetch criadouros with type filter', async () => {
      const params = new URLSearchParams({
        tipo: 'Pneu',
      });

      const response = await fetch(`${API_BASE}/banco-techdengue?${params}`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
    });

    it('should fetch criadouros GeoJSON', async () => {
      const response = await fetch(`${API_BASE}/banco-techdengue/geojson`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('type', 'FeatureCollection');
      expect(data).toHaveProperty('features');
    });

    it('should return 404 for non-existent criadouro', async () => {
      server.use(
        http.get(`${API_BASE}/banco-techdengue/99999`, () => {
          return HttpResponse.json(
            { message: 'Not found' },
            { status: 404 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/banco-techdengue/99999`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Atividades API', () => {
    it('should fetch atividades list', async () => {
      const response = await fetch(`${API_BASE}/atividades`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should fetch atividades with status filter', async () => {
      const params = new URLSearchParams({
        status: 'concluida',
      });

      const response = await fetch(`${API_BASE}/atividades?${params}`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('data');
    });

    it('should fetch atividade resumo', async () => {
      const response = await fetch(`${API_BASE}/atividades/resumo`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('total');
      expect(data).toHaveProperty('concluidas');
    });

    it('should fetch performance pilotos', async () => {
      const response = await fetch(`${API_BASE}/atividades/performance-pilotos`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Dados Gerenciais API', () => {
    it('should fetch municipios list', async () => {
      const response = await fetch(`${API_BASE}/dados-gerenciais/municipios`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data[0]).toHaveProperty('id');
      expect(data[0]).toHaveProperty('nome');
    });

    it('should fetch contratos list', async () => {
      const response = await fetch(`${API_BASE}/dados-gerenciais/contratos`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should fetch estados list', async () => {
      const response = await fetch(`${API_BASE}/dados-geograficos/estados`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Weather API', () => {
    it('should fetch current weather', async () => {
      const response = await fetch(`${API_BASE}/weather/current?lat=-25.4284&lon=-49.2733`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data).toHaveProperty('temperature');
      expect(data).toHaveProperty('humidity');
      expect(data).toHaveProperty('wind_speed');
    });

    it('should handle invalid coordinates', async () => {
      server.use(
        http.get(`${API_BASE}/weather/current`, () => {
          return HttpResponse.json(
            { message: 'Invalid coordinates' },
            { status: 400 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/weather/current?lat=invalid&lon=invalid`, {
        headers: {
          Authorization: 'Bearer mock-access-token',
        },
      });

      expect(response.status).toBe(400);
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, () => {
          return HttpResponse.error();
        })
      );

      try {
        await fetch(`${API_BASE}/dashboard/kpis`);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle 500 errors', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, () => {
          return HttpResponse.json(
            { message: 'Internal Server Error' },
            { status: 500 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/dashboard/kpis`);
      expect(response.status).toBe(500);
    });

    it('should handle 403 forbidden errors', async () => {
      server.use(
        http.get(`${API_BASE}/admin/users`, () => {
          return HttpResponse.json(
            { message: 'Forbidden' },
            { status: 403 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/admin/users`);
      expect(response.status).toBe(403);
    });

    it('should handle rate limiting (429)', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, () => {
          return HttpResponse.json(
            { message: 'Too many requests' },
            { status: 429 }
          );
        })
      );

      const response = await fetch(`${API_BASE}/dashboard/kpis`);
      expect(response.status).toBe(429);
    });

    it('should handle malformed responses', async () => {
      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, () => {
          return new HttpResponse('invalid json', {
            headers: { 'Content-Type': 'application/json' },
          });
        })
      );

      const response = await fetch(`${API_BASE}/dashboard/kpis`);
      expect(response.ok).toBe(true);

      try {
        await response.json();
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('Request Headers', () => {
    it('should send authorization header', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.get(`${API_BASE}/dashboard/kpis`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({
            hectaresMapeados: 1000,
            criadourosIdentificados: 500,
            taxaDevolutivas: 85,
            atividadesAndamento: 10,
          });
        })
      );

      await fetch(`${API_BASE}/dashboard/kpis`, {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      expect(capturedHeaders).not.toBeNull();
      expect(capturedHeaders!.get('Authorization')).toBe('Bearer test-token');
    });

    it('should send content-type for POST requests', async () => {
      let capturedHeaders: Headers | null = null;

      server.use(
        http.post(`${API_BASE}/auth/login`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({
            accessToken: 'token',
            refreshToken: 'refresh',
            user: { id: '1' },
          });
        })
      );

      await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: 'test@test.com', password: 'test' }),
      });

      expect(capturedHeaders).not.toBeNull();
      expect(capturedHeaders!.get('Content-Type')).toBe('application/json');
    });
  });
});
