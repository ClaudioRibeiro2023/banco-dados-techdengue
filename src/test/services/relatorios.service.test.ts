import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { relatoriosService } from '@/lib/services/relatorios.service';
import techdengueClient from '@/lib/api/client';

// Mock the API client
vi.mock('@/lib/api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('relatoriosService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getRelatorioMunicipal', () => {
    const mockRelatorioMunicipal = {
      municipio: {
        id: 'mun-123',
        nome: 'São Paulo',
        cod_ibge: '3550308',
      },
      periodo: {
        inicio: '2024-01-01',
        fim: '2024-06-30',
      },
      resumo: {
        hectares_mapeados: 1500,
        hectares_efetivos: 1200,
        total_criadouros: 350,
        total_devolutivas: 280,
        taxa_efetividade: 80,
        taxa_devolutivas: 70,
      },
      criadouros_por_tipo: [
        { tipo: 'Caixa d\'água', quantidade: 100, percentual: 28.5 },
        { tipo: 'Pneu', quantidade: 80, percentual: 22.8 },
      ],
      devolutivas_por_status: [
        { status: 'Tratado', quantidade: 200, percentual: 71.4 },
        { status: 'Pendente', quantidade: 80, percentual: 28.6 },
      ],
      atividades: [
        { data: '2024-01-15', piloto: 'João', turno: 'Manhã', hectares: 50, status: 'Concluída' },
      ],
    };

    it('should fetch relatorio municipal with params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioMunicipal });

      const params = { municipio_id: 'mun-123' };
      const result = await relatoriosService.getRelatorioMunicipal(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/municipal', {
        params,
      });
      expect(result).toEqual(mockRelatorioMunicipal);
    });

    it('should fetch relatorio municipal with date range', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioMunicipal });

      const params = {
        municipio_id: 'mun-123',
        data_inicio: '2024-01-01',
        data_fim: '2024-06-30',
      };
      const result = await relatoriosService.getRelatorioMunicipal(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/municipal', {
        params,
      });
      expect(result).toEqual(mockRelatorioMunicipal);
    });

    it('should fetch relatorio municipal with contrato_id', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioMunicipal });

      const params = { contrato_id: 'cont-456' };
      const result = await relatoriosService.getRelatorioMunicipal(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/municipal', {
        params,
      });
      expect(result).toEqual(mockRelatorioMunicipal);
    });

    it('should throw error when API fails', async () => {
      const error = new Error('API error');
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioMunicipal({})).rejects.toThrow('API error');
    });
  });

  describe('getRelatorioAtividades', () => {
    const mockRelatorioAtividades = {
      periodo: {
        inicio: '2024-01-01',
        fim: '2024-06-30',
      },
      resumo: {
        total_atividades: 150,
        atividades_concluidas: 120,
        atividades_canceladas: 10,
        taxa_conclusao: 80,
        total_hectares: 3000,
        hectares_efetivos: 2400,
      },
      por_piloto: [
        { piloto_id: 'p1', piloto_nome: 'João Silva', atividades: 50, hectares: 1000, efetividade: 85 },
        { piloto_id: 'p2', piloto_nome: 'Maria Santos', atividades: 45, hectares: 900, efetividade: 90 },
      ],
      por_municipio: [
        { municipio_id: 'm1', municipio_nome: 'São Paulo', atividades: 80, hectares: 1600 },
        { municipio_id: 'm2', municipio_nome: 'Campinas', atividades: 70, hectares: 1400 },
      ],
      detalhes: [
        {
          id: 'a1',
          data: '2024-01-15',
          municipio: 'São Paulo',
          piloto: 'João Silva',
          turno: 'Manhã',
          hectares_mapeados: 50,
          hectares_efetivos: 45,
          status: 'Concluída',
        },
      ],
    };

    it('should fetch relatorio atividades with params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioAtividades });

      const params = { municipio_id: 'mun-123' };
      const result = await relatoriosService.getRelatorioAtividades(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/atividades', {
        params,
      });
      expect(result).toEqual(mockRelatorioAtividades);
    });

    it('should fetch relatorio atividades with date range', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioAtividades });

      const params = {
        data_inicio: '2024-01-01',
        data_fim: '2024-06-30',
      };
      const result = await relatoriosService.getRelatorioAtividades(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/atividades', {
        params,
      });
      expect(result).toEqual(mockRelatorioAtividades);
    });

    it('should fetch relatorio atividades with all params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioAtividades });

      const params = {
        municipio_id: 'mun-123',
        contrato_id: 'cont-456',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
      };
      const result = await relatoriosService.getRelatorioAtividades(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/atividades', {
        params,
      });
      expect(result).toEqual(mockRelatorioAtividades);
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Server error');
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioAtividades({})).rejects.toThrow('Server error');
    });
  });

  describe('getRelatorioDevolutivas', () => {
    const mockRelatorioDevolutivas = {
      periodo: {
        inicio: '2024-01-01',
        fim: '2024-06-30',
      },
      resumo: {
        total_criadouros: 500,
        devolutivas_pendentes: 100,
        devolutivas_em_analise: 50,
        devolutivas_tratadas: 320,
        devolutivas_descartadas: 30,
        taxa_conclusao: 70,
        tempo_medio_resposta: 48,
      },
      por_tipo: [
        { tipo: 'Caixa d\'água', total: 150, tratados: 120, pendentes: 30, taxa: 80 },
        { tipo: 'Pneu', total: 100, tratados: 75, pendentes: 25, taxa: 75 },
      ],
      por_municipio: [
        { municipio: 'São Paulo', total: 200, tratados: 160, taxa: 80 },
        { municipio: 'Campinas', total: 150, tratados: 100, taxa: 66.6 },
      ],
    };

    it('should fetch relatorio devolutivas with params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioDevolutivas });

      const params = { municipio_id: 'mun-123' };
      const result = await relatoriosService.getRelatorioDevolutivas(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/devolutivas', {
        params,
      });
      expect(result).toEqual(mockRelatorioDevolutivas);
    });

    it('should fetch relatorio devolutivas with date range', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioDevolutivas });

      const params = {
        data_inicio: '2024-01-01',
        data_fim: '2024-06-30',
      };
      const result = await relatoriosService.getRelatorioDevolutivas(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/devolutivas', {
        params,
      });
      expect(result).toEqual(mockRelatorioDevolutivas);
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Not found');
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioDevolutivas({})).rejects.toThrow('Not found');
    });
  });

  describe('getRelatorioExecutivo', () => {
    const mockRelatorioExecutivo = {
      periodo: {
        inicio: '2024-01-01',
        fim: '2024-06-30',
      },
      kpis: {
        hectares_mapeados: 5000,
        variacao_hectares: 15.5,
        criadouros_identificados: 1200,
        variacao_criadouros: -5.2,
        taxa_devolutivas: 78,
        variacao_devolutivas: 8.3,
        atividades_realizadas: 300,
        variacao_atividades: 12.0,
      },
      ranking_municipios: [
        { posicao: 1, municipio: 'São Paulo', hectares: 1500, eficiencia: 92 },
        { posicao: 2, municipio: 'Campinas', hectares: 1200, eficiencia: 88 },
        { posicao: 3, municipio: 'Ribeirão Preto', hectares: 1000, eficiencia: 85 },
      ],
      tendencias: {
        hectares: [
          { mes: '2024-01', valor: 800 },
          { mes: '2024-02', valor: 850 },
          { mes: '2024-03', valor: 900 },
        ],
        criadouros: [
          { mes: '2024-01', valor: 200 },
          { mes: '2024-02', valor: 180 },
          { mes: '2024-03', valor: 210 },
        ],
        devolutivas: [
          { mes: '2024-01', valor: 70 },
          { mes: '2024-02', valor: 75 },
          { mes: '2024-03', valor: 78 },
        ],
      },
    };

    it('should fetch relatorio executivo with params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioExecutivo });

      const params = { municipio_id: 'mun-123' };
      const result = await relatoriosService.getRelatorioExecutivo(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/executivo', {
        params,
      });
      expect(result).toEqual(mockRelatorioExecutivo);
    });

    it('should fetch relatorio executivo with date range', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioExecutivo });

      const params = {
        data_inicio: '2024-01-01',
        data_fim: '2024-06-30',
      };
      const result = await relatoriosService.getRelatorioExecutivo(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/executivo', {
        params,
      });
      expect(result).toEqual(mockRelatorioExecutivo);
    });

    it('should fetch relatorio executivo with contrato_id', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: mockRelatorioExecutivo });

      const params = { contrato_id: 'cont-456' };
      const result = await relatoriosService.getRelatorioExecutivo(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/executivo', {
        params,
      });
      expect(result).toEqual(mockRelatorioExecutivo);
    });

    it('should throw error when API fails', async () => {
      const error = new Error('Unauthorized');
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioExecutivo({})).rejects.toThrow('Unauthorized');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 unauthorized error', async () => {
      const error = { response: { status: 401, data: { message: 'Unauthorized' } } };
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioMunicipal({})).rejects.toEqual(error);
    });

    it('should handle 403 forbidden error', async () => {
      const error = { response: { status: 403, data: { message: 'Forbidden' } } };
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioAtividades({})).rejects.toEqual(error);
    });

    it('should handle 500 server error', async () => {
      const error = { response: { status: 500, data: { message: 'Internal server error' } } };
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioDevolutivas({})).rejects.toEqual(error);
    });

    it('should handle network timeout', async () => {
      const error = { code: 'ECONNABORTED', message: 'timeout of 30000ms exceeded' };
      vi.mocked(techdengueClient.get).mockRejectedValue(error);

      await expect(relatoriosService.getRelatorioExecutivo({})).rejects.toEqual(error);
    });
  });

  describe('RelatorioParams Interface', () => {
    it('should accept empty params', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: {} });

      await relatoriosService.getRelatorioMunicipal({});

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/municipal', {
        params: {},
      });
    });

    it('should accept all params combined', async () => {
      vi.mocked(techdengueClient.get).mockResolvedValue({ data: {} });

      const params = {
        municipio_id: 'mun-123',
        contrato_id: 'cont-456',
        data_inicio: '2024-01-01',
        data_fim: '2024-12-31',
      };
      await relatoriosService.getRelatorioMunicipal(params);

      expect(techdengueClient.get).toHaveBeenCalledWith('/relatorios/municipal', {
        params,
      });
    });
  });
});
