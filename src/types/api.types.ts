/**
 * Tipos da API TechDengue v2.0 (DaaS)
 * API: https://banco-dados-techdengue-production.up.railway.app
 * Docs: https://banco-dados-techdengue-production.up.railway.app/docs
 * 
 * Estrutura de resposta padrão:
 * { total: number, limit: number, offset: number, items: T[] }
 */

// ============================================================================
// Tipos Base
// ============================================================================

// Resposta paginada da API v2.0
export interface PaginatedResponse<T> {
  items: T[];           // Array de dados (API v2.0)
  data: T[];             // Alias para compatibilidade
  total: number;
  limit: number;
  offset: number;
  // Campos legados para compatibilidade
  page?: number;
  totalPages?: number;
}

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Municípios (GET /municipios)
// ============================================================================

// Resposta real da API: GET /municipios
export interface MunicipioAPI {
  codigo_ibge: string;
  municipio: string;              // Nome em UPPERCASE
  populacao: string;              // Ex: "6.272" (formatado com ponto)
  urs: string;                    // Unidade Regional de Saúde
  cod_microregiao: number;
  microregiao_saude: string;
  cod_macroregiao: number;
  macroregiao_saude: string;
  area_ha: number;                // Área em hectares
  data_carga: string;
  versao: string;
}

// Interface normalizada para uso no frontend
export interface Municipio {
  codigo_ibge: string;
  nome_municipio: string;         // Normalizado de 'municipio'
  populacao?: number;             // Convertido de string
  urs?: string;
  microregiao_saude?: string;
  macroregiao_saude?: string;
  area_km2?: number;              // Convertido de area_ha
  // Campos calculados/opcionais
  latitude?: number;
  longitude?: number;
  mesorregiao?: string;
  microrregiao?: string;
  // Compatibilidade com código legado
  id?: string;
  nome?: string;
  cod_ibge?: string;
  uf?: string;
  created_at?: string;
  updated_at?: string;
}

// Contrato (legado - mantido para compatibilidade)
export interface Contrato {
  id: string;
  numero: string;
  municipio_id: string;
  data_inicio: string;
  data_fim: string;
  valor: number;
  status: 'ativo' | 'inativo' | 'encerrado';
  created_at: string;
  updated_at: string;
}

// Atividade (legado - mantido para compatibilidade)
export interface Atividade {
  id: string;
  municipio_id: string;
  contrato_id: string;
  piloto_id: string;
  data_atividade: string;
  turno: 'manha' | 'tarde';
  hectares_mapeados: number;
  hectares_efetivos: number;
  status: 'planejada' | 'em_andamento' | 'concluida' | 'cancelada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Atividades TechDengue (GET /facts)
// ============================================================================

// Resposta real da API: GET /facts
export interface AtividadeFactAPI {
  codigo_ibge: string;
  municipio: string;              // Nome do município
  data_map: string;               // "2025-02-26"
  nomenclatura_atividade: string; // "ATV.13_ABADIA.DOURADOS"
  pois: number;                   // Quantidade de POIs
  devolutivas: number;            // Quantidade de devolutivas
  hectares_mapeados: number;
}

// Interface normalizada para uso no frontend
export interface AtividadeFact {
  codigo_ibge: string;
  municipio: string;
  data_mapeamento: string;        // Normalizado de 'data_map'
  atividade: string;              // Normalizado de 'nomenclatura_atividade'
  hectares: number;               // Normalizado de 'hectares_mapeados'
  pois: number;
  devolutivas?: number;
  status?: string;
  operador?: string;
}

// POI/Criadouro (mapeado de /facts)
export interface BancoTechdengue {
  id: string;
  atividade_id?: string;
  latitude: number;
  longitude: number;
  tipo_criadouro: string;
  status_devolutiva: 'pendente' | 'em_analise' | 'tratado' | 'descartado';
  data_identificacao: string;
  data_tratamento?: string;
  observacoes?: string;
  foto_url?: string;
  municipio?: string;
  codigo_ibge?: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// Casos de Dengue (GET /dengue)
// ============================================================================

// Resposta real da API: GET /dengue
export interface CasoDengueAPI {
  codigo_ibge: string;
  municipio: string;
  casos: number;                  // Total de casos
  semana_epidemiologica: number;
  ano: number;
  data_carga: string;
  versao: string;
}

// Interface normalizada para uso no frontend
export interface CasoDengue {
  codigo_ibge: string;
  municipio: string;
  casos: number;                  // Campo real da API
  semana_epidemiologica: number;
  ano: number;
  // Campos calculados/estimados
  casos_notificados?: number;     // Alias para 'casos'
  casos_confirmados?: number;     // Estimativa (80% dos notificados)
  incidencia?: number;            // Calculado: casos / população * 100000
}

// ============================================================================
// Clima (GET /api/v1/weather/{cidade})
// ============================================================================

export interface WeatherData {
  cidade: string;
  estado: string;
  temperatura: number;
  sensacao_termica: number;
  umidade: number;
  pressao: number;
  velocidade_vento: number;
  nebulosidade: number;
  chuva_1h?: number;
  descricao: string;
  indice_favorabilidade_dengue: number;
  timestamp: string;
}

export interface WeatherRisk {
  cidade: string;
  risco_climatico: 'baixo' | 'moderado' | 'alto' | 'critico';
  score: number;
  fatores: string[];
  recomendacoes: string[];
}

// ============================================================================
// Análise de Risco com IA (POST /api/v1/risk/analyze)
// ============================================================================

export interface RiskAnalysisRequest {
  municipio: string;
  codigo_ibge?: string;
  casos_recentes: number;
  casos_ano_anterior?: number;
  temperatura_media?: number;
  umidade_media?: number;
  populacao?: number;
  cobertura_saneamento?: number;
  acoes_recentes?: string[];
}

export interface RiskAnalysisResponse {
  municipio: string;
  nivel_risco: 'baixo' | 'moderado' | 'alto' | 'critico';
  score_risco: number;
  tendencia: 'diminuindo' | 'estavel' | 'aumentando';
  fatores_principais: string[];
  recomendacoes: string[];
  analise_detalhada: string;
  confianca: number;
  modelo_usado: string;
  timestamp: string;
}

// ============================================================================
// Dashboard de Risco (GET /api/v1/risk/dashboard)
// ============================================================================

// Resposta real da API: GET /api/v1/risk/dashboard
export interface RiskDashboard {
  timestamp: string;              // ISO datetime
  total_cidades: number;
  resumo: {
    critico: number;
    alto: number;
    medio: number;                // API usa 'medio' não 'moderado'
    baixo: number;
  };
  cidades: RiskDashboardCity[];
  alerta?: {
    tipo: string;
    severidade: string;
    mensagem: string;
    cidades: string[];
  };
  // Alias para compatibilidade
  ultima_atualizacao?: string;
}

// Cidade no dashboard de risco
export interface RiskDashboardCity {
  cidade: string;
  temperatura: number;
  umidade: number;
  indice_favorabilidade: number;  // 0-100
  risco_climatico: 'baixo' | 'medio' | 'alto' | 'critico';
  score: number;
  // Campos opcionais
  codigo_ibge?: string;
}

// Dados Gerenciais
export interface DadosGerenciaisResumo {
  hectares_mapeados: number;
  hectares_efetivos: number;
  total_criadouros: number;
  total_pois: number;
  total_devolutivas: number;
  taxa_efetividade: number;
  taxa_devolutivas: number;
  atividades_ativas: number;
  distribuicao_pois?: DistribuicaoPOI[];
}

export interface DistribuicaoPOI {
  name: string;
  value: number;
  color?: string;
  [key: string]: string | number | undefined;
}

export interface HectaresMapeadosResponse {
  total: number;
  evolucao: EvolucaoHectares[];
}

export interface EvolucaoHectares {
  date: string;
  hectares: number;
}

// Usuario
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  municipio_id?: string;
  contrato_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

// Audit Log
export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}
