import { http, HttpResponse, delay } from 'msw';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.sistematechdengue.com/api/v1';

// Mock user data
const mockUser = {
  id: '1',
  nome: 'Usuário Teste',
  email: 'teste@techdengue.com',
  perfil: 'admin',
  municipio_id: '123',
  contrato_id: '456',
  avatar_url: null,
  email_verified_at: '2024-01-01T00:00:00Z',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-12-01T00:00:00Z',
};

// Mock tokens
const mockTokens = {
  access_token: 'mock-access-token-jwt',
  refresh_token: 'mock-refresh-token',
  token_type: 'Bearer',
  expires_in: 3600,
};

// Mock KPIs data
const mockKPIs = {
  hectaresMapeados: { value: 1234.5, trend: 12.5, previousValue: 1097.3 },
  criadourosIdentificados: { value: 456, trend: -5.2, previousValue: 481 },
  taxaDevolutivas: { value: 78.5, trend: 3.1, previousValue: 76.2 },
  atividadesAndamento: { value: 23, trend: 8.0, previousValue: 21 },
};

// Mock criadouros data
const mockCriadouros = [
  { id: '1', tipo: 'Pneu', latitude: -23.5505, longitude: -46.6333, status: 'pendente', data: '2024-12-01' },
  { id: '2', tipo: 'Caixa d\'água', latitude: -23.5510, longitude: -46.6340, status: 'concluido', data: '2024-12-02' },
  { id: '3', tipo: 'Calha', latitude: -23.5520, longitude: -46.6350, status: 'pendente', data: '2024-12-03' },
];

// Mock atividades data
const mockAtividades = [
  {
    id: '1',
    titulo: 'Mapeamento Zona Norte',
    piloto: 'João Silva',
    data: '2024-12-07',
    turno: 'manhã',
    status: 'concluida',
    hectares: 45.5,
  },
  {
    id: '2',
    titulo: 'Mapeamento Centro',
    piloto: 'Maria Santos',
    data: '2024-12-08',
    turno: 'tarde',
    status: 'em_andamento',
    hectares: 32.0,
  },
];

export const handlers = [
  // Auth handlers
  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    await delay(500);
    const body = await request.json() as { email: string; password: string };

    if (body.email === 'teste@techdengue.com' && body.password === 'senha123') {
      return HttpResponse.json({
        user: mockUser,
        ...mockTokens,
      });
    }

    return HttpResponse.json(
      { message: 'Credenciais inválidas', code: 'INVALID_CREDENTIALS' },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE}/auth/register`, async () => {
    await delay(500);
    return HttpResponse.json({
      user: mockUser,
      ...mockTokens,
    });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Logout realizado com sucesso' });
  }),

  http.get(`${API_BASE}/auth/me`, async () => {
    await delay(300);
    return HttpResponse.json(mockUser);
  }),

  http.post(`${API_BASE}/auth/refresh`, async () => {
    await delay(300);
    return HttpResponse.json({
      access_token: 'new-mock-access-token',
      refresh_token: 'new-mock-refresh-token',
    });
  }),

  http.post(`${API_BASE}/auth/forgot-password`, async () => {
    await delay(500);
    return HttpResponse.json({
      message: 'E-mail de recuperação enviado com sucesso',
    });
  }),

  http.post(`${API_BASE}/auth/reset-password`, async () => {
    await delay(500);
    return HttpResponse.json({
      message: 'Senha redefinida com sucesso',
    });
  }),

  // Dashboard KPIs
  http.get(`${API_BASE}/dashboard/kpis`, async () => {
    await delay(400);
    return HttpResponse.json(mockKPIs);
  }),

  http.get(`${API_BASE}/dashboard/hectares-mapeados`, async () => {
    await delay(300);
    return HttpResponse.json(mockKPIs.hectaresMapeados);
  }),

  // Criadouros/POIs
  http.get(`${API_BASE}/banco-techdengue`, async () => {
    await delay(500);
    return HttpResponse.json({
      data: mockCriadouros,
      total: mockCriadouros.length,
    });
  }),

  http.get(`${API_BASE}/banco-techdengue/geojson`, async () => {
    await delay(500);
    return HttpResponse.json({
      type: 'FeatureCollection',
      features: mockCriadouros.map((c) => ({
        type: 'Feature',
        properties: { id: c.id, tipo: c.tipo, status: c.status, data: c.data },
        geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] },
      })),
    });
  }),

  // Atividades
  http.get(`${API_BASE}/atividades`, async () => {
    await delay(400);
    return HttpResponse.json({
      data: mockAtividades,
      total: mockAtividades.length,
    });
  }),

  http.get(`${API_BASE}/atividades/resumo`, async () => {
    await delay(300);
    return HttpResponse.json({
      total: 45,
      concluidas: 32,
      em_andamento: 8,
      canceladas: 5,
      hectares_total: 1234.5,
    });
  }),

  http.get(`${API_BASE}/atividades/performance-pilotos`, async () => {
    await delay(400);
    return HttpResponse.json([
      { piloto: 'João Silva', hectares: 234.5, atividades: 12, efetividade: 95 },
      { piloto: 'Maria Santos', hectares: 198.2, atividades: 10, efetividade: 88 },
      { piloto: 'Pedro Oliveira', hectares: 156.8, atividades: 8, efetividade: 82 },
    ]);
  }),

  // Dados Gerenciais
  http.get(`${API_BASE}/dados-gerenciais/municipios`, async () => {
    await delay(300);
    return HttpResponse.json([
      { id: '1', nome: 'São Paulo', estado: 'SP' },
      { id: '2', nome: 'Rio de Janeiro', estado: 'RJ' },
      { id: '3', nome: 'Belo Horizonte', estado: 'MG' },
    ]);
  }),

  http.get(`${API_BASE}/dados-gerenciais/contratos`, async () => {
    await delay(300);
    return HttpResponse.json([
      { id: '1', nome: 'Contrato 001/2024', municipio_id: '1', status: 'ativo' },
      { id: '2', nome: 'Contrato 002/2024', municipio_id: '2', status: 'ativo' },
    ]);
  }),

  // Dados Geográficos
  http.get(`${API_BASE}/dados-geograficos/estados`, async () => {
    await delay(300);
    return HttpResponse.json([
      { id: 'SP', nome: 'São Paulo' },
      { id: 'RJ', nome: 'Rio de Janeiro' },
      { id: 'MG', nome: 'Minas Gerais' },
    ]);
  }),

  // Relatórios
  http.get(`${API_BASE}/relatorios/municipal`, async () => {
    await delay(600);
    return HttpResponse.json({
      periodo: { inicio: '2024-11-01', fim: '2024-12-01' },
      municipio: { id: '1', nome: 'São Paulo' },
      kpis: mockKPIs,
      criadouros_por_tipo: [
        { tipo: 'Pneu', quantidade: 120 },
        { tipo: 'Caixa d\'água', quantidade: 85 },
        { tipo: 'Calha', quantidade: 67 },
      ],
    });
  }),

  // Weather (OpenWeather proxy)
  http.get(`${API_BASE}/weather/current`, async () => {
    await delay(400);
    return HttpResponse.json({
      temperature: 28,
      humidity: 75,
      wind_speed: 12,
      description: 'Parcialmente nublado',
      icon: '02d',
    });
  }),

  // Fallback for unhandled requests
  http.all('*', () => {
    return HttpResponse.json(
      { message: 'Endpoint não implementado no mock' },
      { status: 501 }
    );
  }),
];
