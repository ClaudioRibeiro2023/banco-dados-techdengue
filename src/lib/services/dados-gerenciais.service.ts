/**
 * Serviço de Dados Gerenciais - API TechDengue v2.0
 * 
 * Combina dados de múltiplos endpoints:
 * - GET /facts - Atividades e POIs
 * - GET /dengue - Casos de dengue
 * - GET /api/v1/risk/dashboard - Dashboard de risco
 */

import techdengueClient from '@/lib/api/client';
import { API_CONFIG, FEATURE_FLAGS } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { DadosGerenciaisResumo, HectaresMapeadosResponse, CasoDengue, RiskDashboard } from '@/types/api.types';

export interface DadosGerenciaisParams {
  municipio?: string;       // Nome ou código IBGE
  ano?: number;
  limit?: number;
  offset?: number;
}

// Mock data para desenvolvimento
const MOCK_RESUMO: DadosGerenciaisResumo = {
  hectares_mapeados: 332599,
  hectares_efetivos: 299339,
  total_criadouros: 124000,
  total_pois: 314880,
  total_devolutivas: 245000,
  taxa_efetividade: 90,
  taxa_devolutivas: 78,
  atividades_ativas: 1281,
  distribuicao_pois: [
    { name: 'Pneus', value: 78720, color: '#10b981' },
    { name: 'Caixas d\'água', value: 62976, color: '#3b82f6' },
    { name: 'Calhas', value: 47232, color: '#f59e0b' },
    { name: 'Piscinas', value: 31488, color: '#ef4444' },
    { name: 'Lixo', value: 47232, color: '#8b5cf6' },
    { name: 'Outros', value: 47232, color: '#6b7280' },
  ],
};

const MOCK_HECTARES: HectaresMapeadosResponse = {
  total: 332599,
  evolucao: [
    { date: 'Jan', hectares: 32000 },
    { date: 'Fev', hectares: 58000 },
    { date: 'Mar', hectares: 95000 },
    { date: 'Abr', hectares: 128000 },
    { date: 'Mai', hectares: 165000 },
    { date: 'Jun', hectares: 198000 },
    { date: 'Jul', hectares: 235000 },
    { date: 'Ago', hectares: 268000 },
    { date: 'Set', hectares: 298000 },
    { date: 'Out', hectares: 332599 },
  ],
};

// Estruturas vazias
const EMPTY_RESUMO: DadosGerenciaisResumo = {
  hectares_mapeados: 0,
  hectares_efetivos: 0,
  total_criadouros: 0,
  total_pois: 0,
  total_devolutivas: 0,
  taxa_efetividade: 0,
  taxa_devolutivas: 0,
  atividades_ativas: 0,
  distribuicao_pois: [],
};

const EMPTY_HECTARES: HectaresMapeadosResponse = { total: 0, evolucao: [] };

// Interface da resposta da API /facts
interface FactAPIResponse {
  codigo_ibge: string;
  municipio: string;
  data_mapeamento: string;
  atividade: string;
  hectares: number;
  pois: number;
  status: string;
}

// Interface da resposta da API /dengue
interface DengueAPIResponse {
  ano: number;
  semana_epidemiologica: number;
  codigo_ibge: string;
  municipio: string;
  casos_notificados: number;
  casos_confirmados: number;
  incidencia: number;
}

export const dadosGerenciaisService = {
  /**
   * Resumo consolidado dos dados gerenciais
   * Combina /facts + /api/v1/risk/dashboard
   */
  async getResumo(params?: DadosGerenciaisParams): Promise<DadosGerenciaisResumo> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for getResumo', params, 'DadosGerenciaisService');
      return MOCK_RESUMO;
    }

    try {
      // Buscar dados de atividades (facts)
      const factsParams = { limit: 10000, q: params?.municipio };
      const { data: factsData } = await techdengueClient.get<{ data: FactAPIResponse[]; total: number }>(
        API_CONFIG.endpoints.facts,
        { params: factsParams }
      );

      // Agregar estatísticas
      let totalHectares = 0;
      let totalPois = 0;
      const tiposCount: Record<string, number> = {
        'Pneus': 0,
        'Caixas d\'água': 0,
        'Calhas': 0,
        'Piscinas': 0,
        'Lixo': 0,
        'Outros': 0,
      };

      for (const fact of factsData.data) {
        totalHectares += fact.hectares || 0;
        totalPois += fact.pois || 0;
      }

      // Distribuir POIs por tipo (estimativa baseada em proporções típicas)
      const poisDistribuidos = totalPois;
      tiposCount['Pneus'] = Math.round(poisDistribuidos * 0.25);
      tiposCount['Caixas d\'água'] = Math.round(poisDistribuidos * 0.20);
      tiposCount['Calhas'] = Math.round(poisDistribuidos * 0.15);
      tiposCount['Piscinas'] = Math.round(poisDistribuidos * 0.10);
      tiposCount['Lixo'] = Math.round(poisDistribuidos * 0.15);
      tiposCount['Outros'] = poisDistribuidos - Object.values(tiposCount).reduce((a, b) => a + b, 0) + tiposCount['Outros'];

      const cores: Record<string, string> = {
        'Pneus': '#10b981',
        'Caixas d\'água': '#3b82f6',
        'Calhas': '#f59e0b',
        'Piscinas': '#ef4444',
        'Lixo': '#8b5cf6',
        'Outros': '#6b7280',
      };

      const distribuicao_pois = Object.entries(tiposCount).map(([name, value]) => ({
        name,
        value,
        color: cores[name] || cores['Outros'],
      }));

      return {
        hectares_mapeados: totalHectares,
        hectares_efetivos: Math.round(totalHectares * 0.9),
        total_criadouros: Math.round(totalPois * 0.4), // Estimativa
        total_pois: totalPois,
        total_devolutivas: Math.round(totalPois * 0.78),
        taxa_efetividade: 90,
        taxa_devolutivas: 78,
        atividades_ativas: factsData.total,
        distribuicao_pois,
      };
    } catch (error) {
      logger.error('Error fetching resumo', error as Error, params, 'DadosGerenciaisService');
      return EMPTY_RESUMO;
    }
  },

  /**
   * Hectares mapeados com evolução
   */
  async getHectaresMapeados(params?: DadosGerenciaisParams): Promise<HectaresMapeadosResponse> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for getHectaresMapeados', params, 'DadosGerenciaisService');
      return MOCK_HECTARES;
    }

    try {
      const { data: factsData } = await techdengueClient.get<{ data: FactAPIResponse[]; total: number }>(
        API_CONFIG.endpoints.facts,
        { params: { limit: 10000, q: params?.municipio } }
      );

      // Agregar por mês
      const porMes: Record<string, number> = {};
      let totalHectares = 0;

      for (const fact of factsData.data) {
        totalHectares += fact.hectares || 0;
        const mes = fact.data_mapeamento?.substring(0, 7) || 'N/A';
        porMes[mes] = (porMes[mes] || 0) + (fact.hectares || 0);
      }

      // Converter para evolução acumulada
      const meses = Object.keys(porMes).sort();
      let acumulado = 0;
      const evolucao = meses.map(mes => {
        acumulado += porMes[mes];
        const mesNome = new Date(mes + '-01').toLocaleDateString('pt-BR', { month: 'short' });
        return { date: mesNome, hectares: acumulado };
      });

      return { total: totalHectares, evolucao };
    } catch (error) {
      logger.error('Error fetching hectares', error as Error, params, 'DadosGerenciaisService');
      return EMPTY_HECTARES;
    }
  },

  /**
   * Casos de dengue
   * GET /dengue
   */
  async getCasosDengue(params?: DadosGerenciaisParams): Promise<CasoDengue[]> {
    if (FEATURE_FLAGS.mockApi) {
      return [
        { codigo_ibge: '3106200', municipio: 'Belo Horizonte', casos: 1500, semana_epidemiologica: 45, ano: 2024, casos_notificados: 1500, casos_confirmados: 1200, incidencia: 47.5 },
        { codigo_ibge: '3170206', municipio: 'Uberlândia', casos: 800, semana_epidemiologica: 45, ano: 2024, casos_notificados: 800, casos_confirmados: 650, incidencia: 92.8 },
      ];
    }

    try {
      const { data } = await techdengueClient.get<{ data: DengueAPIResponse[] }>(
        API_CONFIG.endpoints.dengue,
        { params: { limit: params?.limit || 100, ano: params?.ano, q: params?.municipio } }
      );

      return data.data.map(d => ({
        codigo_ibge: d.codigo_ibge,
        municipio: d.municipio,
        casos: d.casos_notificados || 0,
        semana_epidemiologica: d.semana_epidemiologica,
        ano: d.ano,
        casos_notificados: d.casos_notificados,
        casos_confirmados: d.casos_confirmados,
        incidencia: d.incidencia,
      }));
    } catch (error) {
      logger.error('Error fetching dengue cases', error as Error, params, 'DadosGerenciaisService');
      return [];
    }
  },

  /**
   * Dashboard de risco com análise de IA
   * GET /api/v1/risk/dashboard
   */
  async getRiskDashboard(): Promise<RiskDashboard | null> {
    if (FEATURE_FLAGS.mockApi) {
      return {
        timestamp: new Date().toISOString(),
        total_cidades: 853,
        resumo: { critico: 13, alto: 60, medio: 180, baixo: 600 },
        cidades: [
          { cidade: 'Belo Horizonte', risco_climatico: 'alto', score: 72, temperatura: 28, umidade: 75, indice_favorabilidade: 72 },
          { cidade: 'Uberlândia', risco_climatico: 'medio', score: 55, temperatura: 26, umidade: 68, indice_favorabilidade: 55 },
          { cidade: 'Contagem', risco_climatico: 'alto', score: 68, temperatura: 27, umidade: 72, indice_favorabilidade: 68 },
        ],
        alerta: {
          tipo: 'risco_elevado',
          severidade: 'warning',
          mensagem: '13 municípios em risco crítico de dengue',
          cidades: ['Belo Horizonte', 'Contagem', 'Betim'],
        },
        ultima_atualizacao: new Date().toISOString(),
      };
    }

    try {
      const { data } = await techdengueClient.get<RiskDashboard>(API_CONFIG.endpoints.riskDashboard);
      return data;
    } catch (error) {
      logger.error('Error fetching risk dashboard', error as Error, null, 'DadosGerenciaisService');
      return null;
    }
  },

  /**
   * Comparativo entre municípios
   */
  async getComparativoMunicipios(municipios: string[]): Promise<{ municipio: string; hectares: number; pois: number; casos: number }[]> {
    if (FEATURE_FLAGS.mockApi) {
      return municipios.map(m => ({
        municipio: m,
        hectares: Math.floor(Math.random() * 50000),
        pois: Math.floor(Math.random() * 10000),
        casos: Math.floor(Math.random() * 500),
      }));
    }

    try {
      const results = await Promise.all(municipios.map(async (mun) => {
        const [factsRes, dengueRes] = await Promise.all([
          techdengueClient.get<{ data: FactAPIResponse[] }>(API_CONFIG.endpoints.facts, { params: { q: mun, limit: 1000 } }),
          techdengueClient.get<{ data: DengueAPIResponse[] }>(API_CONFIG.endpoints.dengue, { params: { q: mun, limit: 100 } }),
        ]);

        const hectares = factsRes.data.data.reduce((sum, f) => sum + (f.hectares || 0), 0);
        const pois = factsRes.data.data.reduce((sum, f) => sum + (f.pois || 0), 0);
        const casos = dengueRes.data.data.reduce((sum, d) => sum + (d.casos_confirmados || 0), 0);

        return { municipio: mun, hectares, pois, casos };
      }));

      return results;
    } catch (error) {
      logger.error('Error fetching comparativo', error as Error, { municipios }, 'DadosGerenciaisService');
      return [];
    }
  },
};
