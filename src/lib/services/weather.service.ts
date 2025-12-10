/**
 * Serviço de Clima - API TechDengue v2.0 + OpenWeather
 * 
 * Endpoints TechDengue:
 * - GET /api/v1/weather/{cidade} - Clima por cidade
 * - GET /api/v1/weather - Clima de todas as cidades principais
 * - GET /api/v1/weather/{cidade}/risk - Risco climático
 * 
 * Fallback: OpenWeather API diretamente
 */

import axios from 'axios';
import techdengueClient from '@/lib/api/client';
import { API_CONFIG, EXTERNAL_APIS } from '@/lib/config';
import { logger } from '@/lib/utils/logger';
import type { WeatherData as TechDengueWeatherData, WeatherRisk } from '@/types/api.types';

export interface WeatherData {
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
  clouds: number;
  rain?: number;
  timestamp: Date;
  // Campos TechDengue
  indice_favorabilidade_dengue?: number;
  cidade?: string;
}

export interface WeatherForecast {
  date: Date;
  temp_min: number;
  temp_max: number;
  humidity: number;
  rain_probability: number;
  weather: {
    main: string;
    description: string;
    icon: string;
  };
}

export interface WeatherAlert {
  event: string;
  sender: string;
  start: Date;
  end: Date;
  description: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
}

interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    pop: number;
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
  }>;
}

class WeatherService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = EXTERNAL_APIS.openweather.apiKey;
    this.baseUrl = EXTERNAL_APIS.openweather.baseUrl;
  }

  private get isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'xxx';
  }

  /**
   * Get current weather for coordinates
   */
  async getCurrentWeather(lat: number, lon: number): Promise<WeatherData | null> {
    if (!this.isConfigured) {
      console.warn('[WeatherService] API key not configured');
      return null;
    }

    try {
      const response = await axios.get<OpenWeatherResponse>(`${this.baseUrl}/weather`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br',
        },
      });

      const data = response.data;
      return {
        temp: data.main.temp,
        feels_like: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        wind_speed: data.wind.speed,
        weather: {
          main: data.weather[0].main,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
        },
        clouds: data.clouds.all,
        rain: data.rain?.['1h'] || data.rain?.['3h'],
        timestamp: new Date(data.dt * 1000),
      };
    } catch (error) {
      console.error('[WeatherService] Error fetching current weather:', error);
      return null;
    }
  }

  /**
   * Get 5-day forecast for coordinates
   */
  async getForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
    if (!this.isConfigured) {
      console.warn('[WeatherService] API key not configured');
      return [];
    }

    try {
      const response = await axios.get<OpenWeatherForecastResponse>(`${this.baseUrl}/forecast`, {
        params: {
          lat,
          lon,
          appid: this.apiKey,
          units: 'metric',
          lang: 'pt_br',
        },
      });

      // Group by day and get daily summary
      const dailyForecasts = new Map<string, WeatherForecast>();

      response.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toISOString().split('T')[0];

        if (!dailyForecasts.has(dateKey)) {
          dailyForecasts.set(dateKey, {
            date,
            temp_min: item.main.temp_min,
            temp_max: item.main.temp_max,
            humidity: item.main.humidity,
            rain_probability: item.pop * 100,
            weather: {
              main: item.weather[0].main,
              description: item.weather[0].description,
              icon: item.weather[0].icon,
            },
          });
        } else {
          const existing = dailyForecasts.get(dateKey)!;
          existing.temp_min = Math.min(existing.temp_min, item.main.temp_min);
          existing.temp_max = Math.max(existing.temp_max, item.main.temp_max);
          existing.rain_probability = Math.max(existing.rain_probability, item.pop * 100);
        }
      });

      return Array.from(dailyForecasts.values());
    } catch (error) {
      console.error('[WeatherService] Error fetching forecast:', error);
      return [];
    }
  }

  /**
   * Get weather icon URL
   */
  getIconUrl(iconCode: string, size: '1x' | '2x' | '4x' = '2x'): string {
    const sizeMap = { '1x': '', '2x': '@2x', '4x': '@4x' };
    return `https://openweathermap.org/img/wn/${iconCode}${sizeMap[size]}.png`;
  }

  /**
   * Check if weather conditions are favorable for drone operations
   */
  isFavorableForDroneOperations(weather: WeatherData): {
    favorable: boolean;
    reasons: string[];
  } {
    const reasons: string[] = [];

    // Wind speed check (max 10 m/s)
    if (weather.wind_speed > 10) {
      reasons.push(`Vento forte: ${weather.wind_speed.toFixed(1)} m/s`);
    }

    // Rain check
    if (weather.rain && weather.rain > 0) {
      reasons.push('Chuva detectada');
    }

    // Weather condition check
    const badConditions = ['Thunderstorm', 'Rain', 'Drizzle', 'Snow'];
    if (badConditions.includes(weather.weather.main)) {
      reasons.push(`Condição adversa: ${weather.weather.description}`);
    }

    // Visibility (approximated by clouds)
    if (weather.clouds > 90) {
      reasons.push('Visibilidade reduzida');
    }

    return {
      favorable: reasons.length === 0,
      reasons,
    };
  }

  // =========================================================================
  // Métodos da API TechDengue v2.0
  // =========================================================================

  /**
   * Busca clima de uma cidade via API TechDengue
   * GET /api/v1/weather/{cidade}
   */
  async getWeatherByCidade(cidade: string): Promise<TechDengueWeatherData | null> {
    try {
      const { data } = await techdengueClient.get<TechDengueWeatherData>(
        `${API_CONFIG.endpoints.weather}/${encodeURIComponent(cidade)}`
      );
      logger.debug('Weather fetched from TechDengue API', { cidade }, 'WeatherService');
      return data;
    } catch (error) {
      logger.warn('Error fetching weather from TechDengue API', { cidade, error }, 'WeatherService');
      return null;
    }
  }

  /**
   * Busca clima de todas as cidades principais de MG
   * GET /api/v1/weather
   */
  async getAllCidadesWeather(): Promise<TechDengueWeatherData[]> {
    try {
      const { data } = await techdengueClient.get<TechDengueWeatherData[]>(API_CONFIG.endpoints.weather);
      return data;
    } catch (error) {
      logger.warn('Error fetching all cities weather', { error }, 'WeatherService');
      return [];
    }
  }

  /**
   * Análise de risco climático para dengue
   * GET /api/v1/weather/{cidade}/risk
   */
  async getWeatherRisk(cidade: string): Promise<WeatherRisk | null> {
    try {
      const { data } = await techdengueClient.get<WeatherRisk>(
        `${API_CONFIG.endpoints.weather}/${encodeURIComponent(cidade)}/risk`
      );
      return data;
    } catch (error) {
      logger.warn('Error fetching weather risk', { cidade, error }, 'WeatherService');
      return null;
    }
  }

  /**
   * Converte dados da API TechDengue para o formato WeatherData local
   */
  convertTechDengueWeather(td: TechDengueWeatherData): WeatherData {
    return {
      temp: td.temperatura,
      feels_like: td.sensacao_termica,
      humidity: td.umidade,
      pressure: td.pressao,
      wind_speed: td.velocidade_vento,
      weather: {
        main: td.descricao,
        description: td.descricao,
        icon: this.getIconFromDescription(td.descricao),
      },
      clouds: td.nebulosidade,
      rain: td.chuva_1h,
      timestamp: new Date(td.timestamp),
      indice_favorabilidade_dengue: td.indice_favorabilidade_dengue,
      cidade: td.cidade,
    };
  }

  /**
   * Mapeia descrição para código de ícone OpenWeather
   */
  private getIconFromDescription(descricao: string): string {
    const desc = descricao.toLowerCase();
    if (desc.includes('céu limpo') || desc.includes('claro')) return '01d';
    if (desc.includes('poucas nuvens') || desc.includes('parcialmente')) return '02d';
    if (desc.includes('nublado') || desc.includes('nuvens')) return '03d';
    if (desc.includes('encoberto')) return '04d';
    if (desc.includes('chuva leve') || desc.includes('garoa')) return '09d';
    if (desc.includes('chuva') || desc.includes('chuvoso')) return '10d';
    if (desc.includes('trovoada') || desc.includes('tempestade')) return '11d';
    if (desc.includes('neve')) return '13d';
    if (desc.includes('neblina') || desc.includes('névoa')) return '50d';
    return '01d';
  }
}

export const weatherService = new WeatherService();
