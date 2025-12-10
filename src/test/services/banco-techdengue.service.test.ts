/**
 * Testes do BancoTechdengueService - API v2.0
 * Testa os métodos do serviço que consome /facts
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config ANTES de importar o serviço
vi.mock('@/lib/config', () => ({
  API_CONFIG: {
    baseUrl: 'https://api.test.com',
    timeout: 30000,
    endpoints: {
      facts: '/facts',
      gold: '/gold',
    },
  },
  FEATURE_FLAGS: {
    mockApi: true, // Usar mock para testes
  },
}));

vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/lib/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Importar serviço DEPOIS dos mocks
import { bancoTechdengueService } from '@/lib/services/banco-techdengue.service';

describe('bancoTechdengueService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('list (mock mode)', () => {
    it('should return mock data when FEATURE_FLAGS.mockApi is true', async () => {
      const result = await bancoTechdengueService.list();

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should include pagination fields', async () => {
      const result = await bancoTechdengueService.list();

      expect(result.items).toBeDefined();
      expect(result.limit).toBeDefined();
      expect(result.offset).toBeDefined();
      expect(result.page).toBeDefined();
      expect(result.totalPages).toBeDefined();
    });

    it('should have valid POI structure', async () => {
      const result = await bancoTechdengueService.list();
      const firstPOI = result.data[0];

      expect(firstPOI).toHaveProperty('id');
      expect(firstPOI).toHaveProperty('latitude');
      expect(firstPOI).toHaveProperty('longitude');
      expect(firstPOI).toHaveProperty('tipo_criadouro');
      expect(firstPOI).toHaveProperty('status_devolutiva');
    });
  });

  describe('getStats (mock mode)', () => {
    it('should return mock stats', async () => {
      const result = await bancoTechdengueService.getStats();

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
      expect(result.total_hectares).toBeGreaterThan(0);
      expect(result.total_pois).toBeGreaterThan(0);
    });

    it('should include por_municipio array', async () => {
      const result = await bancoTechdengueService.getStats();

      expect(result.por_municipio).toBeInstanceOf(Array);
      expect(result.por_municipio.length).toBeGreaterThan(0);
    });

    it('should have valid municipio stats structure', async () => {
      const result = await bancoTechdengueService.getStats();
      const firstMunicipio = result.por_municipio[0];

      expect(firstMunicipio).toHaveProperty('municipio');
      expect(firstMunicipio).toHaveProperty('hectares');
      expect(firstMunicipio).toHaveProperty('pois');
    });
  });

  describe('listFacts (mock mode)', () => {
    it('should return mock facts', async () => {
      const result = await bancoTechdengueService.listFacts();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have valid fact structure', async () => {
      const result = await bancoTechdengueService.listFacts();
      const firstFact = result[0];

      expect(firstFact).toHaveProperty('codigo_ibge');
      expect(firstFact).toHaveProperty('municipio');
      expect(firstFact).toHaveProperty('data_mapeamento');
      expect(firstFact).toHaveProperty('atividade');
      expect(firstFact).toHaveProperty('hectares');
      expect(firstFact).toHaveProperty('pois');
    });
  });
});
