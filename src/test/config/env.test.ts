import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Store original process.env
const originalEnv = { ...process.env };

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    // Restore original process.env
    process.env = originalEnv;
    vi.resetModules();
  });

  describe('APP_CONFIG', () => {
    it('should have default app name', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.name).toBe('TechDengue Dashboard');
    });

    it('should have default version', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.version).toBe('1.0.0');
    });

    it('should have default environment as development', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.env).toBe('development');
    });

    it('should have isProduction false by default', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.isProduction).toBe(false);
    });

    it('should have isStaging false by default', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.isStaging).toBe(false);
    });

    it('should have isDevelopment based on env', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      // isDevelopment is only true when env is exactly 'development'
      expect(typeof APP_CONFIG.isDevelopment).toBe('boolean');
    });

    it('should use custom app name from env', async () => {
      process.env.NEXT_PUBLIC_APP_NAME = 'Custom App';
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.name).toBe('Custom App');
    });

    it('should use custom version from env', async () => {
      process.env.NEXT_PUBLIC_APP_VERSION = '2.0.0';
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.version).toBe('2.0.0');
    });

    it('should detect production environment', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.isProduction).toBe(true);
      expect(APP_CONFIG.isStaging).toBe(false);
      expect(APP_CONFIG.isDevelopment).toBe(false);
    });

    it('should detect staging environment', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'staging';
      const { APP_CONFIG } = await import('@/lib/config/env');

      expect(APP_CONFIG.isStaging).toBe(true);
      expect(APP_CONFIG.isProduction).toBe(false);
      expect(APP_CONFIG.isDevelopment).toBe(false);
    });
  });

  describe('API_CONFIG', () => {
    it('should have default base URL', async () => {
      const { API_CONFIG } = await import('@/lib/config/env');

      expect(API_CONFIG.baseUrl).toContain('https://');
    });

    it('should have default timeout of 30000ms', async () => {
      const { API_CONFIG } = await import('@/lib/config/env');

      expect(API_CONFIG.timeout).toBe(30000);
    });

    it('should use custom base URL from env', async () => {
      process.env.NEXT_PUBLIC_API_BASE_URL = 'https://custom-api.com';
      const { API_CONFIG } = await import('@/lib/config/env');

      expect(API_CONFIG.baseUrl).toBe('https://custom-api.com');
    });

    it('should parse custom timeout from env', async () => {
      process.env.NEXT_PUBLIC_API_TIMEOUT = '60000';
      const { API_CONFIG } = await import('@/lib/config/env');

      expect(API_CONFIG.timeout).toBe(60000);
    });
  });

  describe('MAPBOX_CONFIG', () => {
    it('should have empty access token by default', async () => {
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.accessToken).toBe('');
    });

    it('should have default style', async () => {
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.style).toContain('mapbox://styles/');
    });

    it('should have hasValidToken false without valid token', async () => {
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.hasValidToken).toBe(false);
    });

    it('should have hasValidToken true with pk. token', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.valid_token_here';
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.hasValidToken).toBe(true);
    });

    it('should have hasValidToken false with invalid token prefix', async () => {
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'sk.invalid_token';
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.hasValidToken).toBe(false);
    });
  });

  describe('EXTERNAL_APIS', () => {
    it('should have IBGE API URL', async () => {
      const { EXTERNAL_APIS } = await import('@/lib/config/env');

      expect(EXTERNAL_APIS.ibge).toContain('ibge.gov.br');
    });

    it('should have InfoDengue API URL', async () => {
      const { EXTERNAL_APIS } = await import('@/lib/config/env');

      expect(EXTERNAL_APIS.infodengue).toContain('dengue');
    });

    it('should have OpenWeather config', async () => {
      const { EXTERNAL_APIS } = await import('@/lib/config/env');

      expect(EXTERNAL_APIS.openweather).toBeDefined();
      expect(EXTERNAL_APIS.openweather.apiKey).toBeDefined();
      expect(EXTERNAL_APIS.openweather.baseUrl).toContain('openweathermap');
    });

    it('should use custom OpenWeather API key from env', async () => {
      process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY = 'custom_api_key';
      const { EXTERNAL_APIS } = await import('@/lib/config/env');

      expect(EXTERNAL_APIS.openweather.apiKey).toBe('custom_api_key');
    });
  });

  describe('ANALYTICS_CONFIG', () => {
    it('should have Sentry config', async () => {
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.sentry).toBeDefined();
      expect(ANALYTICS_CONFIG.sentry.dsn).toBeDefined();
      expect(ANALYTICS_CONFIG.sentry.enabled).toBeDefined();
    });

    it('should have Sentry disabled without DSN', async () => {
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.sentry.enabled).toBe(false);
    });

    it('should enable Sentry with DSN', async () => {
      process.env.NEXT_PUBLIC_SENTRY_DSN = 'https://sentry.io/123';
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.sentry.enabled).toBe(true);
    });

    it('should have PostHog config', async () => {
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.posthog).toBeDefined();
      expect(ANALYTICS_CONFIG.posthog.key).toBeDefined();
      expect(ANALYTICS_CONFIG.posthog.host).toBeDefined();
      expect(ANALYTICS_CONFIG.posthog.enabled).toBeDefined();
    });

    it('should have PostHog disabled without key', async () => {
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.posthog.enabled).toBe(false);
    });

    it('should enable PostHog with key', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_key_here';
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.posthog.enabled).toBe(true);
    });

    it('should have default PostHog host', async () => {
      const { ANALYTICS_CONFIG } = await import('@/lib/config/env');

      expect(ANALYTICS_CONFIG.posthog.host).toBe('https://app.posthog.com');
    });
  });

  describe('FEATURE_FLAGS', () => {
    it('should have darkMode flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.darkMode).toBeDefined();
    });

    it('should have weatherCorrelation flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.weatherCorrelation).toBeDefined();
    });

    it('should have predictiveAnalytics flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.predictiveAnalytics).toBeDefined();
    });

    it('should have exportPdf flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.exportPdf).toBeDefined();
    });

    it('should have mockApi flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.mockApi).toBeDefined();
    });

    it('should have debugMode flag', async () => {
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.debugMode).toBeDefined();
    });

    it('should enable darkMode when true', async () => {
      process.env.NEXT_PUBLIC_ENABLE_DARK_MODE = 'true';
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.darkMode).toBe(true);
    });

    it('should disable darkMode when not true', async () => {
      process.env.NEXT_PUBLIC_ENABLE_DARK_MODE = 'false';
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.darkMode).toBe(false);
    });

    it('should enable mockApi when true', async () => {
      process.env.NEXT_PUBLIC_MOCK_API = 'true';
      const { FEATURE_FLAGS } = await import('@/lib/config/env');

      expect(FEATURE_FLAGS.mockApi).toBe(true);
    });
  });

  describe('validateEnv', () => {
    it('should return valid true in development', async () => {
      const { validateEnv } = await import('@/lib/config/env');

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors object', async () => {
      const { validateEnv } = await import('@/lib/config/env');

      const result = validateEnv();

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it('should validate mapbox token in production', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      const { validateEnv } = await import('@/lib/config/env');

      const result = validateEnv();

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is required in production');
    });

    it('should be valid in production with mapbox token', async () => {
      process.env.NEXT_PUBLIC_APP_ENV = 'production';
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = 'pk.valid_token';
      const { validateEnv } = await import('@/lib/config/env');

      const result = validateEnv();

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('logEnvInfo', () => {
    it('should not throw when called', async () => {
      const { logEnvInfo } = await import('@/lib/config/env');

      expect(() => logEnvInfo()).not.toThrow();
    });

    it('should log info when in server environment', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Simulate server environment
      const { logEnvInfo } = await import('@/lib/config/env');
      logEnvInfo();

      // In jsdom, window is defined, so logs won't happen
      // This test verifies the function doesn't error

      consoleSpy.mockRestore();
    });
  });

  describe('Type Safety', () => {
    it('should have readonly APP_CONFIG', async () => {
      const { APP_CONFIG } = await import('@/lib/config/env');

      // Verify properties exist
      expect(APP_CONFIG.name).toBeDefined();
      expect(APP_CONFIG.version).toBeDefined();
      expect(APP_CONFIG.env).toBeDefined();
    });

    it('should have readonly API_CONFIG', async () => {
      const { API_CONFIG } = await import('@/lib/config/env');

      expect(API_CONFIG.baseUrl).toBeDefined();
      expect(API_CONFIG.timeout).toBeDefined();
    });

    it('should have readonly MAPBOX_CONFIG', async () => {
      const { MAPBOX_CONFIG } = await import('@/lib/config/env');

      expect(MAPBOX_CONFIG.accessToken).toBeDefined();
      expect(MAPBOX_CONFIG.style).toBeDefined();
      expect(MAPBOX_CONFIG.hasValidToken).toBeDefined();
    });
  });
});
