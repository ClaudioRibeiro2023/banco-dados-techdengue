import axios, { AxiosError } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'

/**
 * API Client configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4010'
const API_TIMEOUT = 30000 // 30 seconds

/**
 * Create axios instance with default config
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor
 * Add auth token, logging, etc.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('[API Request]', config.method?.toUpperCase(), config.url)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor
 * Handle errors, retry logic, etc.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('[API Response]', response.status, response.config.url)
    }

    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Log error
    if (import.meta.env.DEV) {
      console.error('[API Error]', error.response?.status, error.config?.url, error.message)
    }

    // Retry logic for network errors
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Wait 1s before retry
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return apiClient(originalRequest)
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access forbidden')
    }

    // Handle 500 Server Error
    if (error.response?.status && error.response.status >= 500) {
      console.error('Server error, please try again later')
    }

    return Promise.reject(error)
  }
)

/**
 * API endpoints - TechDengue API
 */
export const api = {
  // Monitor/Health endpoints
  monitor: {
    getData: () => apiClient.get('/monitor'),
    getHealth: () => apiClient.get('/health'),
  },

  // Quality endpoints
  quality: {
    getReport: () => apiClient.get('/quality'),
  },

  // Facts/Atividades endpoints
  facts: {
    getAll: (params?: {
      limit?: number
      offset?: number
      codigo_ibge?: string
      nomenclatura_atividade?: string
      start_date?: string
      end_date?: string
      sort_by?: string
      order?: 'asc' | 'desc'
      format?: 'json' | 'csv' | 'parquet'
    }) => apiClient.get('/facts', { params }),
    getSummary: (group_by?: 'municipio' | 'codigo_ibge' | 'atividade') =>
      apiClient.get('/facts/summary', { params: { group_by } }),
  },

  // Dengue endpoints
  dengue: {
    getAll: (params?: {
      limit?: number
      offset?: number
      codigo_ibge?: string
      sort_by?: string
      order?: 'asc' | 'desc'
      format?: 'json' | 'csv' | 'parquet'
    }) => apiClient.get('/dengue', { params }),
  },

  // Municipios endpoints
  municipios: {
    getAll: (params?: {
      limit?: number
      offset?: number
      q?: string
      codigo_ibge?: string
      sort_by?: string
      order?: 'asc' | 'desc'
      format?: 'json' | 'csv' | 'parquet'
    }) => apiClient.get('/municipios', { params }),
  },

  // Gold/Analise endpoints
  gold: {
    getAnalise: (params?: {
      limit?: number
      offset?: number
      codigo_ibge?: string
      municipio?: string
      comp_start?: string
      comp_end?: string
      sort_by?: string
      order?: 'asc' | 'desc'
      format?: 'json' | 'csv' | 'parquet'
    }) => apiClient.get('/gold/analise', { params }),
  },

  // GIS endpoints
  gis: {
    getBanco: (limit?: number) => apiClient.get('/gis/banco', { params: { limit } }),
    getPois: (limit?: number, id_atividade?: string) =>
      apiClient.get('/gis/pois', { params: { limit, id_atividade } }),
  },

  // Datasets catalog
  datasets: {
    getAll: () => apiClient.get('/datasets'),
  },

  // System endpoints
  system: {
    getHealth: () => apiClient.get('/health'),
    getDocs: () => `${API_BASE_URL}/docs`,
  },
}

/**
 * Error handler helper
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // Server responded with error status
      return error.response.data?.message || error.message
    } else if (error.request) {
      // Request made but no response
      return 'Sem resposta do servidor. Verifique sua conexão.'
    }
  }
  
  return 'Erro inesperado. Tente novamente.'
}

/**
 * Check if API is online
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    await api.system.getHealth()
    return true
  } catch {
    return false
  }
}

export default apiClient
