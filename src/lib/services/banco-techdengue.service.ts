/**
 * Serviço de Atividades TechDengue (Facts) - API v2.0
 * 
 * Endpoints:
 * - GET /facts - Lista atividades de mapeamento (314k+ POIs)
 * - GET /gold - Dados consolidados (análise integrada)
 */

import techdengueClient from '@/lib/api/client';
import { API_CONFIG, FEATURE_FLAGS } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { BancoTechdengue, AtividadeFact, PaginatedResponse } from '@/types/api.types';

export interface BancoTechdengueParams {
  limit?: number;
  offset?: number;
  q?: string;           // Busca por município
  fields?: string;      // Campos específicos (separados por vírgula)
  format?: 'json' | 'csv' | 'parquet';
}

export interface BancoTechdengueStats {
  total: number;
  total_hectares: number;
  total_pois: number;
  por_municipio: { municipio: string; hectares: number; pois: number }[];
}

// Interface da resposta da API /facts
interface FactAPIResponse {
  codigo_ibge: string;
  municipio: string;
  data_mapeamento: string;
  atividade: string;
  hectares: number;
  pois: number;
  status: string;
  operador?: string;
  latitude?: number;
  longitude?: number;
}

// Mock POIs para desenvolvimento (distribuídos em MG)
const generateMockPOIs = (): BancoTechdengue[] => {
  const municipios = [
    { nome: 'Belo Horizonte', lat: -19.9167, lng: -43.9345, ibge: '3106200' },
    { nome: 'Uberlândia', lat: -18.9189, lng: -48.2768, ibge: '3170206' },
    { nome: 'Contagem', lat: -19.9318, lng: -44.0539, ibge: '3118601' },
    { nome: 'Juiz de Fora', lat: -21.7642, lng: -43.3496, ibge: '3136702' },
    { nome: 'Betim', lat: -19.9679, lng: -44.1983, ibge: '3106705' },
  ];
  const tipos = ['pneu', 'caixa_dagua', 'calha', 'piscina', 'lixo', 'outros'];
  const status = ['pendente', 'em_analise', 'tratado', 'descartado'] as const;
  const pois: BancoTechdengue[] = [];

  for (let i = 0; i < 100; i++) {
    const mun = municipios[i % municipios.length];
    pois.push({
      id: `poi-${String(i + 1).padStart(4, '0')}`,
      latitude: mun.lat + (Math.random() - 0.5) * 0.1,
      longitude: mun.lng + (Math.random() - 0.5) * 0.1,
      tipo_criadouro: tipos[Math.floor(Math.random() * tipos.length)],
      status_devolutiva: status[Math.floor(Math.random() * status.length)],
      data_identificacao: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      municipio: mun.nome,
      codigo_ibge: mun.ibge,
      observacoes: `POI identificado em ${mun.nome}`,
    });
  }

  return pois;
};

const MOCK_POIS = generateMockPOIs();

// Mapper: Fact API → BancoTechdengue (para compatibilidade com frontend)
function mapFactToPOI(fact: FactAPIResponse, index: number): BancoTechdengue {
  return {
    id: `fact-${fact.codigo_ibge}-${index}`,
    latitude: fact.latitude || -19.9 + (Math.random() - 0.5) * 2,
    longitude: fact.longitude || -44.0 + (Math.random() - 0.5) * 2,
    tipo_criadouro: 'mapeamento',
    status_devolutiva: fact.status?.toLowerCase().includes('conclu') ? 'tratado' : 'pendente',
    data_identificacao: fact.data_mapeamento,
    municipio: fact.municipio,
    codigo_ibge: fact.codigo_ibge,
    observacoes: `Atividade: ${fact.atividade} | ${fact.hectares}ha | ${fact.pois} POIs`,
  };
}

export const bancoTechdengueService = {
  /**
   * Lista atividades de mapeamento TechDengue
   * GET /facts
   */
  async list(params?: BancoTechdengueParams): Promise<PaginatedResponse<BancoTechdengue>> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for facts list', params, 'BancoTechdengueService');
      return {
        items: MOCK_POIS,
        data: MOCK_POIS,
        total: MOCK_POIS.length,
        limit: 100,
        offset: 0,
        page: 1,
        totalPages: 1,
      };
    }

    try {
      const { data } = await techdengueClient.get<{ data: FactAPIResponse[]; total: number }>(
        API_CONFIG.endpoints.facts,
        { params: { limit: params?.limit || 100, offset: params?.offset || 0, ...params } }
      );
      
      logger.debug('Facts fetched', { total: data.total }, 'BancoTechdengueService');
      
      const mappedData = data.data.map((fact, idx) => mapFactToPOI(fact, idx));
      return {
        items: mappedData,
        data: mappedData,
        total: data.total,
        limit: params?.limit || 100,
        offset: params?.offset || 0,
        page: Math.floor((params?.offset || 0) / (params?.limit || 100)) + 1,
        totalPages: Math.ceil(data.total / (params?.limit || 100)),
      };
    } catch (error) {
      logger.error('Error fetching facts', error as Error, params, 'BancoTechdengueService');
      return { items: [], data: [], total: 0, limit: 100, offset: 0, page: 1, totalPages: 0 };
    }
  },

  /**
   * Lista atividades brutas (formato original da API)
   */
  async listFacts(params?: BancoTechdengueParams): Promise<AtividadeFact[]> {
    if (FEATURE_FLAGS.mockApi) {
      return MOCK_POIS.slice(0, 10).map(p => ({
        codigo_ibge: p.codigo_ibge || '',
        municipio: p.municipio || '',
        data_mapeamento: p.data_identificacao,
        atividade: 'Mapeamento Mock',
        hectares: Math.random() * 100,
        pois: Math.floor(Math.random() * 50),
        status: 'Concluído',
      }));
    }

    try {
      const { data } = await techdengueClient.get<{ data: FactAPIResponse[] }>(
        API_CONFIG.endpoints.facts,
        { params }
      );
      return data.data.map(f => ({
        codigo_ibge: f.codigo_ibge,
        municipio: f.municipio,
        data_mapeamento: f.data_mapeamento,
        atividade: f.atividade,
        hectares: f.hectares,
        pois: f.pois,
        status: f.status,
        operador: f.operador,
      }));
    } catch (error) {
      logger.error('Error fetching raw facts', error as Error, params, 'BancoTechdengueService');
      return [];
    }
  },

  /**
   * Estatísticas agregadas das atividades
   */
  async getStats(params?: BancoTechdengueParams): Promise<BancoTechdengueStats> {
    if (FEATURE_FLAGS.mockApi) {
      return {
        total: 1281,
        total_hectares: 332599,
        total_pois: 314880,
        por_municipio: [
          { municipio: 'Belo Horizonte', hectares: 50000, pois: 45000 },
          { municipio: 'Uberlândia', hectares: 40000, pois: 38000 },
          { municipio: 'Contagem', hectares: 35000, pois: 32000 },
        ],
      };
    }

    try {
      // Buscar todos os facts e agregar
      const { data } = await techdengueClient.get<{ data: FactAPIResponse[]; total: number }>(
        API_CONFIG.endpoints.facts,
        { params: { limit: 10000, ...params } }
      );

      const porMunicipio: Record<string, { hectares: number; pois: number }> = {};
      let totalHectares = 0;
      let totalPois = 0;

      for (const fact of data.data) {
        totalHectares += fact.hectares || 0;
        totalPois += fact.pois || 0;
        
        if (!porMunicipio[fact.municipio]) {
          porMunicipio[fact.municipio] = { hectares: 0, pois: 0 };
        }
        porMunicipio[fact.municipio].hectares += fact.hectares || 0;
        porMunicipio[fact.municipio].pois += fact.pois || 0;
      }

      return {
        total: data.total,
        total_hectares: totalHectares,
        total_pois: totalPois,
        por_municipio: Object.entries(porMunicipio)
          .map(([municipio, stats]) => ({ municipio, ...stats }))
          .sort((a, b) => b.hectares - a.hectares)
          .slice(0, 20),
      };
    } catch (error) {
      logger.error('Error computing stats', error as Error, params, 'BancoTechdengueService');
      return { total: 0, total_hectares: 0, total_pois: 0, por_municipio: [] };
    }
  },

  /**
   * Exporta dados em formato específico
   */
  async exportData(format: 'csv' | 'parquet' = 'csv', limit = 10000): Promise<string> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.facts}?format=${format}&limit=${limit}`;
    return url; // Retorna URL para download direto
  },

  /**
   * Dados consolidados (Gold)
   */
  async getGoldData(params?: BancoTechdengueParams) {
    try {
      const { data } = await techdengueClient.get(API_CONFIG.endpoints.gold, { params });
      return data;
    } catch (error) {
      logger.error('Error fetching gold data', error as Error, params, 'BancoTechdengueService');
      return { data: [], total: 0 };
    }
  },
};
