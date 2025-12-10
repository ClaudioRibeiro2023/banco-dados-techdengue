/**
 * Mock data para demonstração
 * Em produção, virá da API backend
 */

export interface MonitorData {
  database: {
    status: 'online' | 'offline' | 'error'
    message: string
  }
  qualityScore: number
  validations: {
    passed: number
    total: number
  }
  layers: {
    bronze: number
    silver: number
    gold: number
  }
  lastUpdate: string
}

export interface ValidationCheck {
  id: string
  name: string
  category: string
  status: 'pass' | 'fail' | 'warning'
  score: number
  details: string
  lastRun: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

export interface DataRow {
  id: string
  municipio: string
  urs: string
  ano: number
  pois: number
  atividades: number
  hectares: number
  qualidade: number
}

// Monitor Data
export const mockMonitorData: MonitorData = {
  database: {
    status: 'online',
    message: 'Conectado com sucesso',
  },
  qualityScore: 94.5,
  validations: {
    passed: 18,
    total: 20,
  },
  layers: {
    bronze: 5,
    silver: 4,
    gold: 3,
  },
  lastUpdate: new Date().toISOString(),
}

// Validation Checks
export const mockValidations: ValidationCheck[] = [
  {
    id: '1',
    name: 'Completude de POIs',
    category: 'Completeness',
    status: 'pass',
    score: 98.5,
    details: 'Todos os registros têm POIs válidos',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '2',
    name: 'Consistência de Datas',
    category: 'Consistency',
    status: 'pass',
    score: 100,
    details: 'Datas em formato correto',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '3',
    name: 'Validação de Coordenadas',
    category: 'Accuracy',
    status: 'warning',
    score: 85.2,
    details: '14.8% dos registros com coordenadas suspeitas',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '4',
    name: 'Integridade Referencial',
    category: 'Integrity',
    status: 'pass',
    score: 96.8,
    details: 'Referências entre tabelas válidas',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '5',
    name: 'Unicidade de IDs',
    category: 'Uniqueness',
    status: 'pass',
    score: 100,
    details: 'Todos os IDs são únicos',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '6',
    name: 'Valores Nulos',
    category: 'Completeness',
    status: 'fail',
    score: 72.3,
    details: '27.7% dos campos opcionais estão nulos',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '7',
    name: 'Formato de Telefones',
    category: 'Format',
    status: 'pass',
    score: 94.1,
    details: 'Telefones em formato padronizado',
    lastRun: '2025-10-31T14:30:00',
  },
  {
    id: '8',
    name: 'Duplicatas',
    category: 'Uniqueness',
    status: 'pass',
    score: 99.2,
    details: 'Mínimo de registros duplicados',
    lastRun: '2025-10-31T14:30:00',
  },
]

// Activity Logs
export const mockActivityLogs: ActivityLog[] = [
  {
    id: '1',
    timestamp: '2025-10-31T14:30:00',
    type: 'success',
    message: 'Sincronização concluída com sucesso',
  },
  {
    id: '2',
    timestamp: '2025-10-31T14:15:00',
    type: 'info',
    message: 'Iniciando validação de dados',
  },
  {
    id: '3',
    timestamp: '2025-10-31T14:00:00',
    type: 'warning',
    message: 'Detectadas 42 coordenadas suspeitas',
  },
  {
    id: '4',
    timestamp: '2025-10-31T13:45:00',
    type: 'success',
    message: 'Backup da camada Gold realizado',
  },
  {
    id: '5',
    timestamp: '2025-10-31T13:30:00',
    type: 'info',
    message: 'Atualização de metadados iniciada',
  },
]

// Data Table Rows
export const mockDataRows: DataRow[] = Array.from({ length: 100 }, (_, i) => ({
  id: `row-${i + 1}`,
  municipio: ['Uberlândia', 'Uberaba', 'Ituiutaba', 'Patos de Minas', 'Araguari'][i % 5],
  urs: ['URS Norte', 'URS Sul', 'URS Leste', 'URS Oeste'][i % 4],
  ano: 2023 + (i % 3), // Anos válidos: 2023, 2024, 2025 (projeto iniciou em 2023)
  pois: Math.floor(Math.random() * 1000) + 100,
  atividades: Math.floor(Math.random() * 500) + 50,
  hectares: Math.floor(Math.random() * 10000) + 1000,
  qualidade: Math.floor(Math.random() * 30) + 70,
}))

// Chart Data
export const mockLayersChartData = [
  { name: 'Bronze', value: 5, fill: '#cd7f32' },
  { name: 'Silver', value: 4, fill: '#c0c0c0' },
  { name: 'Gold', value: 3, fill: '#ffd700' },
]

export const mockQualityTrendData = [
  { month: 'Jan', score: 88 },
  { month: 'Fev', score: 90 },
  { month: 'Mar', score: 91 },
  { month: 'Abr', score: 93 },
  { month: 'Mai', score: 92 },
  { month: 'Jun', score: 94.5 },
]

export const mockValidationsByCategory = [
  { category: 'Completeness', passed: 5, failed: 1 },
  { category: 'Accuracy', passed: 3, failed: 0 },
  { category: 'Consistency', passed: 4, failed: 0 },
  { category: 'Integrity', passed: 3, failed: 0 },
  { category: 'Uniqueness', passed: 3, failed: 0 },
]
