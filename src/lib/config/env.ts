/**
 * Environment configuration with validation
 * All environment variables should be accessed through this module
 */

// App configuration
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'TechDengue Dashboard',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  env: process.env.NEXT_PUBLIC_APP_ENV || 'development',
  isProduction: process.env.NEXT_PUBLIC_APP_ENV === 'production',
  isStaging: process.env.NEXT_PUBLIC_APP_ENV === 'staging',
  isDevelopment: process.env.NEXT_PUBLIC_APP_ENV === 'development',
} as const;

// API TechDengue v2.0 configuration
export const API_CONFIG = {
  // Base da API TechDengue (FastAPI no Railway)
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://banco-dados-techdengue-production.up.railway.app',
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  // API Key para endpoints protegidos (Header: X-API-Key)
  apiKey: process.env.NEXT_PUBLIC_API_KEY || '',
  // Endpoints principais
  endpoints: {
    health: '/health',
    facts: '/facts',           // Atividades TechDengue (POIs)
    dengue: '/dengue',         // Casos de dengue
    municipios: '/municipios', // Municípios de MG
    gold: '/gold',             // Dados consolidados
    weather: '/api/v1/weather',       // Clima
    riskDashboard: '/api/v1/risk/dashboard',  // Dashboard de risco
    riskAnalyze: '/api/v1/risk/analyze',      // Análise de risco com IA
    cacheStats: '/api/v1/cache/stats',        // Stats do cache
  },
} as const;

// Mapbox configuration
export const MAPBOX_CONFIG = {
  accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '',
  style: process.env.NEXT_PUBLIC_MAPBOX_STYLE || 'mapbox://styles/mapbox/light-v11',
  hasValidToken: !!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN?.startsWith('pk.'),
} as const;

// External APIs
export const EXTERNAL_APIS = {
  ibge: process.env.NEXT_PUBLIC_IBGE_API_URL || 'https://servicodados.ibge.gov.br/api',
  infodengue: process.env.NEXT_PUBLIC_INFODENGUE_API_URL || 'https://info.dengue.mat.br/api',
  openweather: {
    apiKey: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || '',
    baseUrl: process.env.NEXT_PUBLIC_OPENWEATHER_BASE_URL || 'https://api.openweathermap.org/data/2.5',
  },
} as const;

// Analytics & Monitoring
export const ANALYTICS_CONFIG = {
  sentry: {
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
    enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  },
  posthog: {
    key: process.env.NEXT_PUBLIC_POSTHOG_KEY || '',
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    enabled: !!process.env.NEXT_PUBLIC_POSTHOG_KEY,
  },
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  darkMode: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE === 'true',
  weatherCorrelation: process.env.NEXT_PUBLIC_ENABLE_WEATHER_CORRELATION === 'true',
  predictiveAnalytics: process.env.NEXT_PUBLIC_ENABLE_PREDICTIVE_ANALYTICS === 'true',
  exportPdf: process.env.NEXT_PUBLIC_ENABLE_EXPORT_PDF === 'true',
  mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
  debugMode: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
} as const;

// Validate required environment variables
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required in production
  if (APP_CONFIG.isProduction) {
    if (!MAPBOX_CONFIG.hasValidToken) {
      errors.push('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is required in production');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Log environment info (non-sensitive)
export function logEnvInfo(): void {
  if (typeof window === 'undefined') {
    console.log('[ENV] App:', APP_CONFIG.name, 'v' + APP_CONFIG.version);
    console.log('[ENV] Environment:', APP_CONFIG.env);
    console.log('[ENV] API URL:', API_CONFIG.baseUrl);
    console.log('[ENV] Mapbox:', MAPBOX_CONFIG.hasValidToken ? 'configured' : 'not configured');
    console.log('[ENV] Sentry:', ANALYTICS_CONFIG.sentry.enabled ? 'enabled' : 'disabled');
    console.log('[ENV] PostHog:', ANALYTICS_CONFIG.posthog.enabled ? 'enabled' : 'disabled');
  }
}
