import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { StatCard } from '@/components/ui/stat-card'
import { mockDataRows, type DataRow } from '@/lib/mock-data'
import { formatNumber } from '@/lib/utils'
import { ArrowUpDown, ChevronLeft, ChevronRight, Download, Search, Database, Activity, MapPin, Gauge } from 'lucide-react'

const columns: ColumnDef<DataRow>[] = [
  {
    accessorKey: 'municipio',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Município
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'urs',
    header: 'URS',
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue('urs')}</Badge>
    ),
  },
  {
    accessorKey: 'ano',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Ano
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: 'pois',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          POIs
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatNumber(row.getValue('pois'))}
      </div>
    ),
  },
  {
    accessorKey: 'atividades',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Atividades
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatNumber(row.getValue('atividades'))}
      </div>
    ),
  },
  {
    accessorKey: 'hectares',
    header: ({ column }) => (
      <div className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Hectares
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <div className="text-right font-mono">
        {formatNumber(row.getValue('hectares'))}
      </div>
    ),
  },
  {
    accessorKey: 'qualidade',
    header: 'Qualidade',
    cell: ({ row }) => {
      const score = row.getValue('qualidade') as number
      const variant = score >= 90 ? 'success' : score >= 70 ? 'warning' : 'error'
      return (
        <Badge variant={variant}>{score}%</Badge>
      )
    },
  },
]

export function DataTablePage() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: mockDataRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  })

  const handleExport = (format: 'csv' | 'json') => {
    const rows = table.getFilteredRowModel().rows.map(row => row.original)
    
    if (format === 'csv') {
      const headers = columns.map(col => col.header as string).join(',')
      const csvData = rows.map(row => 
        `${row.municipio},${row.urs},${row.ano},${row.pois},${row.atividades},${row.hectares},${row.qualidade}`
      ).join('\n')
      const blob = new Blob([`${headers}\n${csvData}`], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dados.csv'
      a.click()
    } else {
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'dados.json'
      a.click()
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Tabela de Dados</h1>
          <p className="text-muted-foreground">
            {table.getFilteredRowModel().rows.length} de {mockDataRows.length} registros
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleExport('csv')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button onClick={() => handleExport('json')} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total POIs"
          value={formatNumber(mockDataRows.reduce((sum, row) => sum + row.pois, 0))}
          icon={<MapPin className="h-5 w-5" />}
          variant="primary"
          description="Pontos de interesse"
        />
        <StatCard
          title="Total Atividades"
          value={formatNumber(mockDataRows.reduce((sum, row) => sum + row.atividades, 0))}
          icon={<Activity className="h-5 w-5" />}
          variant="success"
          trend={12.5}
        />
        <StatCard
          title="Total Hectares"
          value={formatNumber(mockDataRows.reduce((sum, row) => sum + row.hectares, 0))}
          icon={<Database className="h-5 w-5" />}
          description="Área mapeada"
        />
        <StatCard
          title="Qualidade Média"
          value={(mockDataRows.reduce((sum, row) => sum + row.qualidade, 0) / mockDataRows.length).toFixed(1)}
          suffix="%"
          icon={<Gauge className="h-5 w-5" />}
          variant="success"
          trend={2.3}
        />
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Dados Analíticos</CardTitle>
              <CardDescription>Filtros, ordenação e paginação</CardDescription>
            </div>
            <Input
              type="search"
              placeholder="Buscar em todas as colunas..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              className="w-64"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="p-3 text-left text-sm font-medium">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="p-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Nenhum resultado encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>
                Página {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount()}
              </span>
              <span>•</span>
              <span>
                {table.getFilteredRowModel().rows.length} resultado(s)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
