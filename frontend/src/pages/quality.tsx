import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { mockValidations, mockValidationsByCategory, type ValidationCheck } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'
import { CheckCircle2, XCircle, AlertTriangle, Search } from 'lucide-react'

export function QualityPage() {
  const [filter, setFilter] = useState<'all' | 'pass' | 'fail' | 'warning'>('all')

  const filteredValidations = mockValidations.filter((v) => {
    if (filter === 'all') return true
    return v.status === filter
  })

  const getStatusIcon = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case 'fail':
        return <XCircle className="h-4 w-4 text-error" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-warning" />
    }
  }

  const getStatusBadge = (status: ValidationCheck['status']) => {
    switch (status) {
      case 'pass':
        return <Badge variant="success">PASS</Badge>
      case 'fail':
        return <Badge variant="error">FAIL</Badge>
      case 'warning':
        return <Badge variant="warning">WARNING</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Qualidade de Dados</h1>
        <p className="text-muted-foreground">
          Relatórios detalhados de validação e qualidade
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Checks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockValidations.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprovados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {mockValidations.filter((v) => v.status === 'pass').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avisos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {mockValidations.filter((v) => v.status === 'warning').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Falharam</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-error">
              {mockValidations.filter((v) => v.status === 'fail').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validations by Category Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Validações por Categoria</CardTitle>
          <CardDescription>Distribuição de checks por categoria</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockValidationsByCategory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="category" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey="passed" fill="hsl(var(--success))" name="Passou" />
              <Bar dataKey="failed" fill="hsl(var(--error))" name="Falhou" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Validations Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Validações Detalhadas</CardTitle>
              <CardDescription>
                {filteredValidations.length} de {mockValidations.length} validações
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                Todas
              </Button>
              <Button
                variant={filter === 'pass' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('pass')}
              >
                Aprovadas
              </Button>
              <Button
                variant={filter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('warning')}
              >
                Avisos
              </Button>
              <Button
                variant={filter === 'fail' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('fail')}
              >
                Falharam
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-3 text-left text-sm font-medium">Status</th>
                  <th className="p-3 text-left text-sm font-medium">Nome</th>
                  <th className="p-3 text-left text-sm font-medium">Categoria</th>
                  <th className="p-3 text-right text-sm font-medium">Score</th>
                  <th className="p-3 text-left text-sm font-medium">Detalhes</th>
                  <th className="p-3 text-left text-sm font-medium">Última Execução</th>
                </tr>
              </thead>
              <tbody>
                {filteredValidations.map((validation) => (
                  <tr key={validation.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(validation.status)}
                        {getStatusBadge(validation.status)}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{validation.name}</td>
                    <td className="p-3">
                      <Badge variant="outline">{validation.category}</Badge>
                    </td>
                    <td className="p-3 text-right font-mono">
                      {validation.score.toFixed(1)}%
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {validation.details}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(validation.lastRun, 'short')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredValidations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma validação encontrada</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Tente ajustar os filtros para ver mais resultados
              </p>
              <Button onClick={() => setFilter('all')} variant="outline">
                Limpar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
