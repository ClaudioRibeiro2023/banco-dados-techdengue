import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface FilterState {
  municipio: string
  codigoIbge: string
  dataInicio: string
  dataFim: string
  atividade: string
}

interface AdvancedFiltersProps {
  onFilter: (filters: FilterState) => void
  onReset: () => void
  loading?: boolean
}

const initialFilters: FilterState = {
  municipio: '',
  codigoIbge: '',
  dataInicio: '',
  dataFim: '',
  atividade: '',
}

export function AdvancedFilters({ onFilter, onReset, loading }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleChange = (field: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFilter(filters)
  }

  const handleReset = () => {
    setFilters(initialFilters)
    onReset()
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filtros Avançados
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Recolher' : 'Expandir'}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className={`grid gap-4 ${isExpanded ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-3'}`}>
          {/* Município */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Município
            </label>
            <input
              type="text"
              value={filters.municipio}
              onChange={(e) => handleChange('municipio', e.target.value)}
              placeholder="Buscar município..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Código IBGE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código IBGE
            </label>
            <input
              type="text"
              value={filters.codigoIbge}
              onChange={(e) => handleChange('codigoIbge', e.target.value)}
              placeholder="Ex: 3106200"
              maxLength={7}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Atividade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Atividade
            </label>
            <select
              id="filter-atividade"
              aria-label="Filtrar por atividade"
              value={filters.atividade}
              onChange={(e) => handleChange('atividade', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todas</option>
              <option value="MAPEAMENTO">Mapeamento</option>
              <option value="DEVOLUTIVA">Devolutiva</option>
              <option value="ANALISE">Análise</option>
            </select>
          </div>

          {/* Período - Expandido */}
          {isExpanded && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Início
                </label>
                <input
                  type="date"
                  id="filter-data-inicio"
                  aria-label="Data de início do período"
                  value={filters.dataInicio}
                  onChange={(e) => handleChange('dataInicio', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Data Fim
                </label>
                <input
                  type="date"
                  id="filter-data-fim"
                  aria-label="Data de fim do período"
                  value={filters.dataFim}
                  onChange={(e) => handleChange('dataFim', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Botões */}
        <div className="flex gap-3 mt-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Filtrando...' : 'Aplicar Filtros'}
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Limpar
          </Button>
        </div>
      </form>
    </div>
  )
}

export type { FilterState }
