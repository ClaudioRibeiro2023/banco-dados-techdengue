/**
 * Mapeadores: API v2.0 → Frontend
 * Converte estruturas da API real para interfaces normalizadas do frontend
 */

import type {
  MunicipioAPI,
  Municipio,
  AtividadeFactAPI,
  AtividadeFact,
  CasoDengueAPI,
  CasoDengue,
  PaginatedResponse,
} from '@/types/api.types';

// ============================================================================
// Municípios
// ============================================================================

/**
 * Converte resposta da API /municipios para interface Municipio
 */
export function mapMunicipio(api: MunicipioAPI): Municipio {
  // Converter população de string formatada para número
  const populacaoNum = parseInt(api.populacao.replace(/\./g, ''), 10) || 0;
  
  return {
    codigo_ibge: api.codigo_ibge,
    nome_municipio: titleCase(api.municipio), // UPPERCASE → Title Case
    populacao: populacaoNum,
    urs: api.urs,
    microregiao_saude: api.microregiao_saude,
    macroregiao_saude: api.macroregiao_saude,
    area_km2: api.area_ha / 100, // hectares → km²
    // Aliases para compatibilidade
    id: api.codigo_ibge,
    nome: titleCase(api.municipio),
    cod_ibge: api.codigo_ibge,
    uf: 'MG',
  };
}

/**
 * Converte array de municípios
 */
export function mapMunicipios(apiList: MunicipioAPI[]): Municipio[] {
  return apiList.map(mapMunicipio);
}

// ============================================================================
// Atividades (Facts)
// ============================================================================

/**
 * Converte resposta da API /facts para interface AtividadeFact
 */
export function mapAtividadeFact(api: AtividadeFactAPI): AtividadeFact {
  return {
    codigo_ibge: api.codigo_ibge,
    municipio: api.municipio,
    data_mapeamento: api.data_map,
    atividade: api.nomenclatura_atividade,
    hectares: api.hectares_mapeados,
    pois: api.pois,
    devolutivas: api.devolutivas,
    status: 'concluida', // Default
  };
}

/**
 * Converte array de atividades
 */
export function mapAtividadesFact(apiList: AtividadeFactAPI[]): AtividadeFact[] {
  return apiList.map(mapAtividadeFact);
}

// ============================================================================
// Casos de Dengue
// ============================================================================

/**
 * Converte resposta da API /dengue para interface CasoDengue
 */
export function mapCasoDengue(api: CasoDengueAPI): CasoDengue {
  return {
    codigo_ibge: api.codigo_ibge,
    municipio: api.municipio,
    casos: api.casos,
    semana_epidemiologica: api.semana_epidemiologica,
    ano: api.ano,
    // Campos calculados
    casos_notificados: api.casos,
    casos_confirmados: Math.round(api.casos * 0.8), // Estimativa: 80%
  };
}

/**
 * Converte array de casos
 */
export function mapCasosDengue(apiList: CasoDengueAPI[]): CasoDengue[] {
  return apiList.map(mapCasoDengue);
}

// ============================================================================
// Paginação
// ============================================================================

/**
 * Normaliza resposta paginada da API v2.0
 * API retorna: { total, limit, offset, items }
 * Frontend espera: { data, total, page, limit, totalPages }
 */
export function normalizePaginatedResponse<T, U>(
  apiResponse: { total: number; limit: number; offset: number; items: T[] },
  mapper: (item: T) => U
): PaginatedResponse<U> {
  const mappedItems = apiResponse.items.map(mapper);
  const page = Math.floor(apiResponse.offset / apiResponse.limit) + 1;
  const totalPages = Math.ceil(apiResponse.total / apiResponse.limit);

  return {
    items: mappedItems,
    data: mappedItems, // Alias para compatibilidade
    total: apiResponse.total,
    limit: apiResponse.limit,
    offset: apiResponse.offset,
    page,
    totalPages,
  };
}

// ============================================================================
// Utilitários
// ============================================================================

/**
 * Converte string UPPERCASE para Title Case
 * "BELO HORIZONTE" → "Belo Horizonte"
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Formata população para exibição
 * 6272 → "6.272"
 */
export function formatPopulacao(pop: number): string {
  return pop.toLocaleString('pt-BR');
}

/**
 * Converte área de hectares para km²
 */
export function hectaresToKm2(hectares: number): number {
  return hectares / 100;
}
