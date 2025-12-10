/**
 * Testes do DadosGerenciaisService - API v2.0
 * Testa os métodos do serviço que consome /facts, /dengue, /municipios
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock config ANTES de importar o serviço
vi.mock('@/lib/config', () => ({
  API_CONFIG: {
    baseUrl: 'https://api.test.com',
    timeout: 30000,
    endpoints: {
      facts: '/facts',
      dengue: '/dengue',
      municipios: '/municipios',
      riskDashboard: '/api/v1/risk/dashboard',
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
import { dadosGerenciaisService } from '@/lib/services/dados-gerenciais.service';

describe('dadosGerenciaisService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getResumo (mock mode)', () => {
    it('should return mock resumo data', async () => {
      const result = await dadosGerenciaisService.getResumo();

      expect(result).toBeDefined();
      expect(result.hectares_mapeados).toBeDefined();
      expect(result.total_pois).toBeDefined();
    });

    it('should include distribution data', async () => {
      const result = await dadosGerenciaisService.getResumo();

      expect(result.distribuicao_pois).toBeDefined();
      expect(result.distribuicao_pois).toBeInstanceOf(Array);
    });
  });

  describe('getHectaresMapeados (mock mode)', () => {
    it('should return mock hectares data', async () => {
      const result = await dadosGerenciaisService.getHectaresMapeados();

      expect(result).toBeDefined();
      expect(result.total).toBeGreaterThan(0);
    });

    it('should include evolucao array', async () => {
      const result = await dadosGerenciaisService.getHectaresMapeados();

      expect(result.evolucao).toBeDefined();
      expect(result.evolucao).toBeInstanceOf(Array);
    });
  });

  describe('getCasosDengue (mock mode)', () => {
    it('should return mock dengue cases', async () => {
      const result = await dadosGerenciaisService.getCasosDengue();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should have valid case structure', async () => {
      const result = await dadosGerenciaisService.getCasosDengue();
      const firstCase = result[0];

      expect(firstCase).toHaveProperty('codigo_ibge');
      expect(firstCase).toHaveProperty('municipio');
      expect(firstCase).toHaveProperty('casos');
      expect(firstCase).toHaveProperty('semana_epidemiologica');
      expect(firstCase).toHaveProperty('ano');
    });
  });

  describe('getRiskDashboard (mock mode)', () => {
    it('should return mock risk dashboard', async () => {
      const result = await dadosGerenciaisService.getRiskDashboard();

      expect(result).toBeDefined();
      expect(result?.total_cidades).toBeDefined();
    });

    it('should have valid resumo structure', async () => {
      const result = await dadosGerenciaisService.getRiskDashboard();

      expect(result?.resumo).toHaveProperty('critico');
      expect(result?.resumo).toHaveProperty('alto');
      expect(result?.resumo).toHaveProperty('medio');
      expect(result?.resumo).toHaveProperty('baixo');
    });

    it('should have cidades array', async () => {
      const result = await dadosGerenciaisService.getRiskDashboard();

      expect(result?.cidades).toBeInstanceOf(Array);
      expect(result?.cidades.length).toBeGreaterThan(0);
    });
  });

  describe('getComparativoMunicipios', () => {
    it('should return empty array when no municipios provided', async () => {
      const result = await dadosGerenciaisService.getComparativoMunicipios([]);

      expect(result).toBeInstanceOf(Array);
    });
  });
});
