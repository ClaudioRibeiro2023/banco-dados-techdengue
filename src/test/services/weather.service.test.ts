import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { weatherService } from '@/lib/services/weather.service';
import type { WeatherData } from '@/lib/services/weather.service';

// Mock axios
vi.mock('axios');

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock API client
vi.mock('@/lib/api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock config
vi.mock('@/lib/config', () => ({
  EXTERNAL_APIS: {
    openweather: {
      apiKey: 'test-api-key',
      baseUrl: 'https://api.openweathermap.org/data/2.5',
    },
  },
  API_CONFIG: {
    baseUrl: 'https://api.test.com',
    timeout: 30000,
    endpoints: {
      weather: '/api/v1/weather',
    },
  },
  APP_CONFIG: {
    isDevelopment: false,
    isProduction: true,
    appName: 'Test',
  },
  FEATURE_FLAGS: {
    mockApi: false,
    debugMode: false,
  },
}));

describe('weatherService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCurrentWeather', () => {
    const mockOpenWeatherResponse = {
      main: {
        temp: 25.5,
        feels_like: 26.0,
        humidity: 65,
        pressure: 1013,
      },
      weather: [
        {
          main: 'Clear',
          description: 'céu limpo',
          icon: '01d',
        },
      ],
      wind: {
        speed: 5.5,
      },
      clouds: {
        all: 20,
      },
      rain: {
        '1h': 0.5,
      },
      dt: 1704067200,
    };

    it('should fetch current weather for coordinates', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockOpenWeatherResponse });

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            lat: -23.5505,
            lon: -46.6333,
            appid: 'test-api-key',
            units: 'metric',
            lang: 'pt_br',
          },
        }
      );
      expect(result).not.toBeNull();
      expect(result?.temp).toBe(25.5);
      expect(result?.humidity).toBe(65);
    });

    it('should return transformed weather data', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockOpenWeatherResponse });

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(result).toMatchObject({
        temp: 25.5,
        feels_like: 26.0,
        humidity: 65,
        pressure: 1013,
        wind_speed: 5.5,
        weather: {
          main: 'Clear',
          description: 'céu limpo',
          icon: '01d',
        },
        clouds: 20,
        rain: 0.5,
      });
    });

    it('should handle response without rain data', async () => {
      const responseWithoutRain = {
        ...mockOpenWeatherResponse,
        rain: undefined,
      };
      vi.mocked(axios.get).mockResolvedValue({ data: responseWithoutRain });

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(result?.rain).toBeUndefined();
    });

    it('should handle 3h rain data', async () => {
      const responseWith3hRain = {
        ...mockOpenWeatherResponse,
        rain: { '3h': 2.5 },
      };
      vi.mocked(axios.get).mockResolvedValue({ data: responseWith3hRain });

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(result?.rain).toBe(2.5);
    });

    it('should return null on API error', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(result).toBeNull();
    });

    it('should return timestamp as Date', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockOpenWeatherResponse });

      const result = await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(result?.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('getForecast', () => {
    const mockForecastResponse = {
      list: [
        {
          dt: 1704067200,
          main: { temp_min: 20, temp_max: 28, humidity: 60 },
          pop: 0.2,
          weather: [{ main: 'Clear', description: 'céu limpo', icon: '01d' }],
        },
        {
          dt: 1704078000,
          main: { temp_min: 22, temp_max: 30, humidity: 55 },
          pop: 0.1,
          weather: [{ main: 'Clouds', description: 'nublado', icon: '03d' }],
        },
        {
          dt: 1704153600,
          main: { temp_min: 18, temp_max: 25, humidity: 70 },
          pop: 0.5,
          weather: [{ main: 'Rain', description: 'chuva leve', icon: '10d' }],
        },
      ],
    };

    it('should fetch forecast for coordinates', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockForecastResponse });

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      expect(axios.get).toHaveBeenCalledWith(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            lat: -23.5505,
            lon: -46.6333,
            appid: 'test-api-key',
            units: 'metric',
            lang: 'pt_br',
          },
        }
      );
      expect(result).toBeInstanceOf(Array);
    });

    it('should return aggregated daily forecasts', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockForecastResponse });

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('temp_min');
      expect(result[0]).toHaveProperty('temp_max');
      expect(result[0]).toHaveProperty('rain_probability');
    });

    it('should aggregate min/max temperatures for same day', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockForecastResponse });

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      // First two items in mock are same day
      const firstDay = result[0];
      expect(firstDay.temp_min).toBeLessThanOrEqual(firstDay.temp_max);
    });

    it('should convert rain probability to percentage', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockForecastResponse });

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      result.forEach((forecast) => {
        expect(forecast.rain_probability).toBeGreaterThanOrEqual(0);
        expect(forecast.rain_probability).toBeLessThanOrEqual(100);
      });
    });

    it('should return empty array on API error', async () => {
      vi.mocked(axios.get).mockRejectedValue(new Error('API error'));

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      expect(result).toEqual([]);
    });

    it('should have date as Date object', async () => {
      vi.mocked(axios.get).mockResolvedValue({ data: mockForecastResponse });

      const result = await weatherService.getForecast(-23.5505, -46.6333);

      result.forEach((forecast) => {
        expect(forecast.date).toBeInstanceOf(Date);
      });
    });
  });

  describe('getIconUrl', () => {
    it('should return 1x icon URL', () => {
      const url = weatherService.getIconUrl('01d', '1x');

      expect(url).toBe('https://openweathermap.org/img/wn/01d.png');
    });

    it('should return 2x icon URL by default', () => {
      const url = weatherService.getIconUrl('01d');

      expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });

    it('should return 2x icon URL', () => {
      const url = weatherService.getIconUrl('01d', '2x');

      expect(url).toBe('https://openweathermap.org/img/wn/01d@2x.png');
    });

    it('should return 4x icon URL', () => {
      const url = weatherService.getIconUrl('01d', '4x');

      expect(url).toBe('https://openweathermap.org/img/wn/01d@4x.png');
    });

    it('should handle different icon codes', () => {
      expect(weatherService.getIconUrl('02d')).toContain('02d');
      expect(weatherService.getIconUrl('10n')).toContain('10n');
      expect(weatherService.getIconUrl('50d')).toContain('50d');
    });
  });

  describe('isFavorableForDroneOperations', () => {
    const createWeatherData = (overrides: Partial<WeatherData> = {}): WeatherData => ({
      temp: 25,
      feels_like: 26,
      humidity: 60,
      pressure: 1013,
      wind_speed: 5,
      weather: {
        main: 'Clear',
        description: 'céu limpo',
        icon: '01d',
      },
      clouds: 20,
      timestamp: new Date(),
      ...overrides,
    });

    it('should return favorable for good conditions', () => {
      const weather = createWeatherData();
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(true);
      expect(result.reasons).toHaveLength(0);
    });

    it('should detect high wind speed', () => {
      const weather = createWeatherData({ wind_speed: 12 });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons).toContain('Vento forte: 12.0 m/s');
    });

    it('should detect rain', () => {
      const weather = createWeatherData({ rain: 2.5 });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons).toContain('Chuva detectada');
    });

    it('should not flag zero rain', () => {
      const weather = createWeatherData({ rain: 0 });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.reasons).not.toContain('Chuva detectada');
    });

    it('should detect thunderstorm', () => {
      const weather = createWeatherData({
        weather: { main: 'Thunderstorm', description: 'tempestade', icon: '11d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(true);
    });

    it('should detect rain condition', () => {
      const weather = createWeatherData({
        weather: { main: 'Rain', description: 'chuva', icon: '10d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(true);
    });

    it('should detect drizzle', () => {
      const weather = createWeatherData({
        weather: { main: 'Drizzle', description: 'chuvisco', icon: '09d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(true);
    });

    it('should detect snow', () => {
      const weather = createWeatherData({
        weather: { main: 'Snow', description: 'neve', icon: '13d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(true);
    });

    it('should detect reduced visibility (high clouds)', () => {
      const weather = createWeatherData({ clouds: 95 });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons).toContain('Visibilidade reduzida');
    });

    it('should not flag clouds at 90%', () => {
      const weather = createWeatherData({ clouds: 90 });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.reasons).not.toContain('Visibilidade reduzida');
    });

    it('should accumulate multiple reasons', () => {
      const weather = createWeatherData({
        wind_speed: 15,
        rain: 5,
        clouds: 95,
        weather: { main: 'Thunderstorm', description: 'tempestade', icon: '11d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      expect(result.favorable).toBe(false);
      expect(result.reasons.length).toBeGreaterThanOrEqual(3);
    });

    it('should allow clouds weather condition', () => {
      const weather = createWeatherData({
        weather: { main: 'Clouds', description: 'nublado', icon: '03d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      // Clouds alone should be favorable
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(false);
    });

    it('should allow mist/fog in conditions', () => {
      const weather = createWeatherData({
        weather: { main: 'Mist', description: 'névoa', icon: '50d' },
      });
      const result = weatherService.isFavorableForDroneOperations(weather);

      // Mist alone should be favorable (not in bad conditions list)
      expect(result.reasons.some((r) => r.includes('Condição adversa'))).toBe(false);
    });
  });

  describe('API Key Configuration', () => {
    it('should use configured API key', async () => {
      vi.mocked(axios.get).mockResolvedValue({
        data: {
          main: { temp: 25, feels_like: 26, humidity: 60, pressure: 1013 },
          weather: [{ main: 'Clear', description: 'clear', icon: '01d' }],
          wind: { speed: 5 },
          clouds: { all: 20 },
          dt: 1704067200,
        },
      });

      await weatherService.getCurrentWeather(-23.5505, -46.6333);

      expect(axios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            appid: 'test-api-key',
          }),
        })
      );
    });
  });
});
