/**
 * Serviço de Dados Geográficos - API TechDengue v2.0
 * 
 * Endpoints:
 * - GET /municipios - Lista municípios de MG (853 municípios)
 */

import techdengueClient from '@/lib/api/client';
import { API_CONFIG, FEATURE_FLAGS } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { Municipio, Contrato } from '@/types/api.types';

// Interface da resposta real da API /municipios
interface MunicipioAPIResponse {
  codigo_ibge: string;
  municipio: string;              // Nome em UPPERCASE
  populacao: string;              // Ex: "6.272" (formatado com ponto)
  urs: string;
  cod_microregiao: number;
  microregiao_saude: string;
  cod_macroregiao: number;
  macroregiao_saude: string;
  area_ha: number;
  data_carga?: string;
  versao?: string;
}

// Mock data para desenvolvimento (apenas quando NEXT_PUBLIC_MOCK_API=true)
const MOCK_MUNICIPIOS: Municipio[] = [
  { codigo_ibge: '3106200', nome_municipio: 'Belo Horizonte', mesorregiao: 'Metropolitana de Belo Horizonte', populacao: 2530701, latitude: -19.9167, longitude: -43.9345 },
  { codigo_ibge: '3170206', nome_municipio: 'Uberlândia', mesorregiao: 'Triângulo Mineiro/Alto Paranaíba', populacao: 699097, latitude: -18.9189, longitude: -48.2768 },
  { codigo_ibge: '3118601', nome_municipio: 'Contagem', mesorregiao: 'Metropolitana de Belo Horizonte', populacao: 668949, latitude: -19.9318, longitude: -44.0539 },
  { codigo_ibge: '3136702', nome_municipio: 'Juiz de Fora', mesorregiao: 'Zona da Mata', populacao: 577532, latitude: -21.7642, longitude: -43.3496 },
  { codigo_ibge: '3106705', nome_municipio: 'Betim', mesorregiao: 'Metropolitana de Belo Horizonte', populacao: 444784, latitude: -19.9679, longitude: -44.1983 },
];

const MOCK_CONTRATOS: Contrato[] = [
  { id: 'cont-001', numero: 'CT-2024-001', municipio_id: '3106200', data_inicio: '2024-01-01', data_fim: '2024-12-31', valor: 150000, status: 'ativo', created_at: '2024-01-01', updated_at: '2024-01-01' },
  { id: 'cont-002', numero: 'CT-2024-002', municipio_id: '3170206', data_inicio: '2024-02-01', data_fim: '2024-12-31', valor: 120000, status: 'ativo', created_at: '2024-02-01', updated_at: '2024-02-01' },
];

// Converte string UPPERCASE para Title Case
function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Converte população de string formatada para número
function parsePopulacao(pop: string): number {
  return parseInt(pop.replace(/\./g, ''), 10) || 0;
}

// Mapper: API response → Municipio (com compatibilidade legada)
function mapMunicipio(api: MunicipioAPIResponse): Municipio {
  const nomeNormalizado = titleCase(api.municipio);
  return {
    codigo_ibge: api.codigo_ibge,
    nome_municipio: nomeNormalizado,
    microregiao_saude: api.microregiao_saude,
    macroregiao_saude: api.macroregiao_saude,
    urs: api.urs,
    populacao: parsePopulacao(api.populacao),
    area_km2: api.area_ha / 100, // hectares → km²
    // Campos legados para compatibilidade
    id: api.codigo_ibge,
    nome: nomeNormalizado,
    cod_ibge: api.codigo_ibge,
    uf: 'MG',
  };
}

export interface MunicipiosParams {
  limit?: number;
  offset?: number;
  q?: string; // Busca por nome
}

export const dadosGeograficosService = {
  /**
   * Lista municípios de Minas Gerais
   * GET /municipios
   */
  async getMunicipios(params?: MunicipiosParams): Promise<Municipio[]> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for getMunicipios', params, 'DadosGeograficosService');
      return MOCK_MUNICIPIOS;
    }

    try {
      const { data } = await techdengueClient.get<{ data: MunicipioAPIResponse[]; total: number }>(
        API_CONFIG.endpoints.municipios,
        { params: { limit: params?.limit || 100, ...params } }
      );
      
      logger.debug('Municipios fetched', { total: data.total }, 'DadosGeograficosService');
      return data.data.map(mapMunicipio);
    } catch (error) {
      logger.warn('API unavailable for getMunicipios', { error }, 'DadosGeograficosService');
      return [];
    }
  },

  /**
   * Busca município por código IBGE
   */
  async getMunicipioById(codigoIbge: string): Promise<Municipio | null> {
    if (FEATURE_FLAGS.mockApi) {
      const found = MOCK_MUNICIPIOS.find(m => m.codigo_ibge === codigoIbge);
      return found || null;
    }

    try {
      // Busca na lista filtrada
      const { data } = await techdengueClient.get<{ data: MunicipioAPIResponse[] }>(
        API_CONFIG.endpoints.municipios,
        { params: { q: codigoIbge, limit: 1 } }
      );
      
      if (data.data.length > 0) {
        return mapMunicipio(data.data[0]);
      }
      return null;
    } catch (error) {
      logger.warn('API unavailable for getMunicipioById', { error, codigoIbge }, 'DadosGeograficosService');
      return null;
    }
  },

  /**
   * Busca municípios por nome (pesquisa)
   */
  async searchMunicipios(query: string, limit = 10): Promise<Municipio[]> {
    if (FEATURE_FLAGS.mockApi) {
      return MOCK_MUNICIPIOS.filter(m => 
        m.nome_municipio.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
    }

    try {
      const { data } = await techdengueClient.get<{ data: MunicipioAPIResponse[] }>(
        API_CONFIG.endpoints.municipios,
        { params: { q: query, limit } }
      );
      return data.data.map(mapMunicipio);
    } catch (error) {
      logger.warn('Search municipios failed', { error, query }, 'DadosGeograficosService');
      return [];
    }
  },

  /**
   * Contratos (legado - mantido para compatibilidade)
   * Nota: A API v2.0 não tem endpoint de contratos separado
   */
  async getContratos(municipioId?: string): Promise<Contrato[]> {
    if (FEATURE_FLAGS.mockApi) {
      if (municipioId) {
        return MOCK_CONTRATOS.filter(c => c.municipio_id === municipioId);
      }
      return MOCK_CONTRATOS;
    }
    
    // API v2.0 não tem endpoint de contratos
    logger.warn('Contratos endpoint not available in API v2.0', { municipioId }, 'DadosGeograficosService');
    return [];
  },

  async getContratoById(id: string): Promise<Contrato | null> {
    if (FEATURE_FLAGS.mockApi) {
      return MOCK_CONTRATOS.find(c => c.id === id) || null;
    }
    
    logger.warn('Contrato endpoint not available in API v2.0', { id }, 'DadosGeograficosService');
    return null;
  },
};
