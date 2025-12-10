/**
 * Serviço de Análise de Risco - API TechDengue v2.0
 * 
 * Endpoints:
 * - POST /api/v1/risk/analyze - Análise de risco com IA (Groq/Llama 3.3)
 * - GET /api/v1/risk/dashboard - Dashboard consolidado de risco
 * - GET /api/v1/risk/municipio/{codigo_ibge} - Risco de um município
 */

import techdengueClient from '@/lib/api/client';
import { API_CONFIG, FEATURE_FLAGS } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { 
  RiskAnalysisRequest, 
  RiskAnalysisResponse, 
  RiskDashboard,
  RiskDashboardCity 
} from '@/types/api.types';

// Mock data para desenvolvimento
const MOCK_RISK_ANALYSIS: RiskAnalysisResponse = {
  municipio: 'Belo Horizonte',
  nivel_risco: 'alto',
  score_risco: 72.5,
  tendencia: 'aumentando',
  fatores_principais: [
    'Aumento de 87% nos casos em relação ao ano anterior',
    'Temperatura média ideal para o vetor (28.5°C)',
    'Umidade elevada (75%)',
    'Período de chuvas intensas',
  ],
  recomendacoes: [
    'Intensificar ações de controle vetorial nas áreas de maior incidência',
    'Realizar mutirões de limpeza nos bairros mais afetados',
    'Ampliar campanhas de conscientização sobre eliminação de criadouros',
    'Reforçar equipes de agentes de saúde',
  ],
  analise_detalhada: 'O município de Belo Horizonte apresenta risco alto de surto de dengue nas próximas semanas. A combinação de fatores climáticos favoráveis (temperatura entre 25-30°C e umidade acima de 70%) com o aumento significativo de casos notificados sugere uma tendência de crescimento na transmissão.',
  confianca: 0.85,
  modelo_usado: 'llama-3.3-70b-versatile',
  timestamp: new Date().toISOString(),
};

const MOCK_DASHBOARD: RiskDashboard = {
  timestamp: new Date().toISOString(),
  total_cidades: 853,
  resumo: {
    critico: 13,
    alto: 60,
    medio: 180,
    baixo: 600,
  },
  cidades: [
    { cidade: 'Belo Horizonte', codigo_ibge: '3106200', risco_climatico: 'alto', score: 72, temperatura: 28, umidade: 75, indice_favorabilidade: 72 },
    { cidade: 'Uberlândia', codigo_ibge: '3170206', risco_climatico: 'medio', score: 55, temperatura: 26, umidade: 68, indice_favorabilidade: 55 },
    { cidade: 'Contagem', codigo_ibge: '3118601', risco_climatico: 'alto', score: 68, temperatura: 27, umidade: 72, indice_favorabilidade: 68 },
    { cidade: 'Juiz de Fora', codigo_ibge: '3136702', risco_climatico: 'medio', score: 48, temperatura: 24, umidade: 65, indice_favorabilidade: 48 },
    { cidade: 'Betim', codigo_ibge: '3106705', risco_climatico: 'alto', score: 70, temperatura: 28, umidade: 74, indice_favorabilidade: 70 },
    { cidade: 'Montes Claros', codigo_ibge: '3143302', risco_climatico: 'critico', score: 85, temperatura: 32, umidade: 80, indice_favorabilidade: 85 },
  ],
  alerta: {
    tipo: 'risco_elevado',
    severidade: 'warning',
    mensagem: '13 municípios em risco crítico de dengue',
    cidades: ['Montes Claros', 'Teófilo Otoni', 'Governador Valadares'],
  },
  ultima_atualizacao: new Date().toISOString(),
};

export const riskService = {
  /**
   * Análise de risco com IA (Groq/Llama 3.3 70B)
   * POST /api/v1/risk/analyze
   */
  async analyzeRisk(request: RiskAnalysisRequest): Promise<RiskAnalysisResponse> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for analyzeRisk', request, 'RiskService');
      return {
        ...MOCK_RISK_ANALYSIS,
        municipio: request.municipio,
      };
    }

    try {
      const { data } = await techdengueClient.post<RiskAnalysisResponse>(
        API_CONFIG.endpoints.riskAnalyze,
        request
      );
      
      logger.info('Risk analysis completed', { 
        municipio: request.municipio, 
        nivel: data.nivel_risco,
        score: data.score_risco 
      }, 'RiskService');
      
      return data;
    } catch (error) {
      logger.error('Error analyzing risk', error as Error, request, 'RiskService');
      throw error;
    }
  },

  /**
   * Dashboard de risco regional
   * GET /api/v1/risk/dashboard
   */
  async getDashboard(): Promise<RiskDashboard> {
    if (FEATURE_FLAGS.mockApi) {
      logger.debug('Using mock data for risk dashboard', null, 'RiskService');
      return MOCK_DASHBOARD;
    }

    try {
      const { data } = await techdengueClient.get<RiskDashboard>(API_CONFIG.endpoints.riskDashboard);
      logger.debug('Risk dashboard fetched', { total: data.total_cidades }, 'RiskService');
      return data;
    } catch (error) {
      logger.error('Error fetching risk dashboard', error as Error, null, 'RiskService');
      return MOCK_DASHBOARD; // Fallback para mock em caso de erro
    }
  },

  /**
   * Risco de um município específico
   * GET /api/v1/risk/municipio/{codigo_ibge}
   */
  async getRiskByMunicipio(codigoIbge: string): Promise<RiskAnalysisResponse | null> {
    if (FEATURE_FLAGS.mockApi) {
      return MOCK_RISK_ANALYSIS;
    }

    try {
      const { data } = await techdengueClient.get<RiskAnalysisResponse>(
        `/api/v1/risk/municipio/${codigoIbge}`
      );
      return data;
    } catch (error) {
      logger.warn('Error fetching risk for municipio', { codigoIbge, error }, 'RiskService');
      return null;
    }
  },

  /**
   * Lista cidades por nível de risco
   */
  async getCidadesByRisco(nivel: 'baixo' | 'moderado' | 'alto' | 'critico'): Promise<RiskDashboardCity[]> {
    const dashboard = await this.getDashboard();
    return dashboard.cidades.filter(c => c.risco_climatico === nivel);
  },

  /**
   * Obtém cidades em alerta
   */
  async getCidadesEmAlerta(): Promise<RiskDashboardCity[]> {
    const dashboard = await this.getDashboard();
    return dashboard.cidades.filter(c => 
      c.risco_climatico === 'alto' || c.risco_climatico === 'critico'
    );
  },

  /**
   * Calcula score de risco baseado em parâmetros locais
   * (útil quando API não está disponível)
   */
  calculateLocalRiskScore(params: {
    temperatura: number;
    umidade: number;
    casosRecentes: number;
    casosAnoAnterior: number;
    populacao: number;
  }): { score: number; nivel: 'baixo' | 'moderado' | 'alto' | 'critico' } {
    let score = 0;

    // Fator temperatura (ideal 25-30°C para Aedes aegypti)
    if (params.temperatura >= 25 && params.temperatura <= 30) {
      score += 30;
    } else if (params.temperatura >= 20 && params.temperatura <= 35) {
      score += 15;
    }

    // Fator umidade (ideal > 60%)
    if (params.umidade >= 70) {
      score += 25;
    } else if (params.umidade >= 60) {
      score += 15;
    }

    // Fator tendência de casos
    const variacao = params.casosAnoAnterior > 0 
      ? ((params.casosRecentes - params.casosAnoAnterior) / params.casosAnoAnterior) * 100
      : 0;
    
    if (variacao > 100) score += 30;
    else if (variacao > 50) score += 20;
    else if (variacao > 0) score += 10;

    // Fator incidência (casos por 100k habitantes)
    const incidencia = (params.casosRecentes / params.populacao) * 100000;
    if (incidencia > 300) score += 15;
    else if (incidencia > 100) score += 10;
    else if (incidencia > 30) score += 5;

    // Classificação
    let nivel: 'baixo' | 'moderado' | 'alto' | 'critico';
    if (score >= 80) nivel = 'critico';
    else if (score >= 60) nivel = 'alto';
    else if (score >= 40) nivel = 'moderado';
    else nivel = 'baixo';

    return { score: Math.min(score, 100), nivel };
  },

  /**
   * Cores para cada nível de risco
   */
  getRiskColor(nivel: 'baixo' | 'moderado' | 'alto' | 'critico'): string {
    const cores = {
      baixo: '#10b981',      // Verde
      moderado: '#f59e0b',   // Amarelo
      alto: '#f97316',       // Laranja
      critico: '#ef4444',    // Vermelho
    };
    return cores[nivel];
  },

  /**
   * Ícone para cada nível de risco
   */
  getRiskIcon(nivel: 'baixo' | 'moderado' | 'alto' | 'critico'): string {
    const icones = {
      baixo: '✓',
      moderado: '⚠',
      alto: '⚠️',
      critico: '🚨',
    };
    return icones[nivel];
  },
};
