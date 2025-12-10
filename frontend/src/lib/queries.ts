import { useQuery } from '@tanstack/react-query'
import { api } from './api-client'

/**
 * Query keys - TechDengue API
 */
export const queryKeys = {
  monitor: ['monitor'] as const,
  health: ['health'] as const,
  quality: ['quality'] as const,
  facts: (params?: Record<string, unknown>) => ['facts', params] as const,
  factsSummary: (groupBy?: string) => ['facts', 'summary', groupBy] as const,
  dengue: (params?: Record<string, unknown>) => ['dengue', params] as const,
  municipios: (params?: Record<string, unknown>) => ['municipios', params] as const,
  goldAnalise: (params?: Record<string, unknown>) => ['gold', 'analise', params] as const,
  datasets: ['datasets'] as const,
}

/**
 * Types
 */
export interface MonitorData {
  lastUpdate: string
  database: { status: string; message: string }
  qualityScore: number
  validations: { total: number; passed: number }
  layers: { bronze: number; silver: number; gold: number }
  stats: {
    totalPois: number
    totalHectares: number
    totalAtividades: number
    totalMunicipios: number
    totalDatasets: number
    totalSizeBytes: number
  }
}

export interface QualityReport {
  generatedAt: string
  score: number
  validations: Array<{
    id: string
    name: string
    status: 'passed' | 'warning' | 'error'
    rows: number
    columns: number
    nullPercentage: number
    message: string
  }>
  summary: { total: number; passed: number; warnings: number; errors: number }
}

export interface FactRecord {
  codigo_ibge: string
  municipio: string
  data_map: string
  nomenclatura_atividade: string
  pois: number
  devolutivas: number
  hectares_mapeados: number
}

export interface PagedResponse<T> {
  total: number
  limit: number
  offset: number
  items: T[]
}

/**
 * Monitor hooks
 */
export const useMonitorData = () => {
  return useQuery({
    queryKey: queryKeys.monitor,
    queryFn: async () => {
      const { data } = await api.monitor.getData()
      return data as MonitorData
    },
    refetchInterval: 60000,
    staleTime: 30000,
    retry: 3,
  })
}

/**
 * Health hook
 */
export const useHealth = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: async () => {
      const { data } = await api.monitor.getHealth()
      return data
    },
    staleTime: 30000,
  })
}

/**
 * Quality hooks
 */
export const useQualityReport = () => {
  return useQuery({
    queryKey: queryKeys.quality,
    queryFn: async () => {
      const { data } = await api.quality.getReport()
      return data as QualityReport
    },
    staleTime: 60000,
    retry: 2,
  })
}

/**
 * Facts/Atividades hooks
 */
export const useFacts = (params?: {
  limit?: number
  offset?: number
  codigo_ibge?: string
  sort_by?: string
  order?: 'asc' | 'desc'
}) => {
  return useQuery({
    queryKey: queryKeys.facts(params),
    queryFn: async () => {
      const { data } = await api.facts.getAll(params)
      return data as PagedResponse<FactRecord>
    },
    staleTime: 60000,
  })
}

export const useFactsSummary = (groupBy?: 'municipio' | 'codigo_ibge' | 'atividade') => {
  return useQuery({
    queryKey: queryKeys.factsSummary(groupBy),
    queryFn: async () => {
      const { data } = await api.facts.getSummary(groupBy)
      return data
    },
    staleTime: 60000,
  })
}

/**
 * Dengue hooks
 */
export const useDengue = (params?: {
  limit?: number
  offset?: number
  codigo_ibge?: string
}) => {
  return useQuery({
    queryKey: queryKeys.dengue(params),
    queryFn: async () => {
      const { data } = await api.dengue.getAll(params)
      return data as PagedResponse<Record<string, unknown>>
    },
    staleTime: 60000,
  })
}

/**
 * Municipios hooks
 */
export const useMunicipios = (params?: {
  limit?: number
  offset?: number
  q?: string
}) => {
  return useQuery({
    queryKey: queryKeys.municipios(params),
    queryFn: async () => {
      const { data } = await api.municipios.getAll(params)
      return data as PagedResponse<Record<string, unknown>>
    },
    staleTime: 60000,
  })
}

/**
 * Gold Analise hooks
 */
export const useGoldAnalise = (params?: {
  limit?: number
  offset?: number
  codigo_ibge?: string
  municipio?: string
}) => {
  return useQuery({
    queryKey: queryKeys.goldAnalise(params),
    queryFn: async () => {
      const { data } = await api.gold.getAnalise(params)
      return data as PagedResponse<Record<string, unknown>>
    },
    staleTime: 60000,
  })
}

/**
 * Datasets hooks
 */
export const useDatasets = () => {
  return useQuery({
    queryKey: queryKeys.datasets,
    queryFn: async () => {
      const { data } = await api.datasets.getAll()
      return data
    },
    staleTime: 120000,
  })
}
