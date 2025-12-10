/**
 * TechDengue API Client v2.0
 * 
 * Cliente HTTP para a API TechDengue DaaS (Data as a Service)
 * Documentação: https://techdengue-api.railway.app/docs
 * 
 * Autenticação:
 * - Endpoints públicos: não requerem autenticação
 * - Endpoints protegidos: Header X-API-Key
 * 
 * Rate Limits por Tier:
 * - free: 60/min
 * - standard: 300/min  
 * - premium: 1000/min
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/lib/config';
import { logger } from '@/lib/utils/logger';

const API_BASE_URL = API_CONFIG.baseUrl;
const API_TIMEOUT = API_CONFIG.timeout;
const API_KEY = API_CONFIG.apiKey;

// Create axios instance
export const techdengueClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - adds X-API-Key header if configured
techdengueClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Adiciona API Key se configurada (para endpoints protegidos)
    if (API_KEY && config.headers) {
      config.headers['X-API-Key'] = API_KEY;
    }

    logger.debug('API Request', { 
      method: config.method?.toUpperCase(), 
      url: config.url,
      params: config.params 
    }, 'TechDengueClient');

    return config;
  },
  (error: AxiosError) => {
    logger.error('Request error', error, null, 'TechDengueClient');
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors and rate limiting
techdengueClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log rate limit headers se presentes
    const rateLimit = response.headers['x-ratelimit-remaining'];
    if (rateLimit && parseInt(rateLimit) < 10) {
      logger.warn('Rate limit baixo', { remaining: rateLimit }, 'TechDengueClient');
    }
    return response;
  },
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;

    // Handle specific error codes
    switch (status) {
      case 401:
        logger.error('API Key inválida ou ausente', error, { url }, 'TechDengueClient');
        break;
      case 403:
        logger.error('Permissão negada (tier insuficiente)', error, { url }, 'TechDengueClient');
        break;
      case 404:
        logger.warn('Recurso não encontrado', { url }, 'TechDengueClient');
        break;
      case 429:
        const retryAfter = error.response?.headers['retry-after'] || '60';
        logger.error('Rate limit excedido', error, { url, retryAfter }, 'TechDengueClient');
        break;
      case 500:
      case 502:
      case 503:
        logger.error('Erro no servidor', error, { status, url }, 'TechDengueClient');
        break;
      default:
        if (!error.response) {
          logger.error('Erro de rede', error, { message: error.message }, 'TechDengueClient');
        }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// API Error Types
// ============================================================================

export interface ApiError {
  error: string;
  message: string;
  status: number;
  details?: Record<string, unknown>;
}

export function parseApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as Record<string, unknown> | undefined;
    return {
      error: (data?.error as string) || 'UNKNOWN_ERROR',
      message: (data?.message as string) || 'Erro ao processar requisição',
      status: error.response.status,
      details: data?.details as Record<string, unknown> | undefined,
    };
  }

  if (error.request) {
    return {
      error: 'NETWORK_ERROR',
      message: 'Sem resposta do servidor. Verifique sua conexão.',
      status: 0,
    };
  }

  return {
    error: 'REQUEST_ERROR',
    message: error.message || 'Erro desconhecido',
    status: 0,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Verifica se a API está online
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await techdengueClient.get('/health');
    return response.status === 200;
  } catch {
    return false;
  }
}

/**
 * Obtém estatísticas do cache
 */
export async function getCacheStats(): Promise<{
  hits: number;
  misses: number;
  hit_rate: number;
  backend: string;
}> {
  const { data } = await techdengueClient.get(API_CONFIG.endpoints.cacheStats);
  return data.cache;
}

// ============================================================================
// Legacy Compatibility (para código que ainda usa tokenManager)
// ============================================================================

/**
 * Token Manager legado - mantido para compatibilidade
 * A API v2.0 usa X-API-Key, não JWT tokens
 */
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },

  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('auth_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken);
    }
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() >= exp - 30000;
    } catch {
      return true;
    }
  },

  getTokenExpiration: (token: string): Date | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  },
};

export default techdengueClient;
