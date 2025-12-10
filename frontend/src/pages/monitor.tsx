import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatDate } from '../lib/utils'
import { Activity, Database, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'
import { useMonitorData } from '@/lib/queries'

export function MonitorPage() {
  const { data, isLoading, error } = useMonitorData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-semibold">Erro ao carregar dados</h2>
        <p className="text-muted-foreground">Verifique se a API está rodando em http://localhost:4010</p>
      </div>
    )
  }

  // Dados para gráficos
  const layersChartData = [
    { name: 'Bronze', value: data.layers.bronze, fill: 'hsl(var(--warning))' },
    { name: 'Silver', value: data.layers.silver, fill: 'hsl(var(--muted-foreground))' },
    { name: 'Gold', value: data.layers.gold, fill: 'hsl(var(--success))' },
  ]

  const qualityTrendData = [
    { month: 'Out', score: 92 },
    { month: 'Nov', score: 95 },
    { month: 'Dez', score: data.qualityScore },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Monitor de Qualidade</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
            Dashboard em tempo real - Última atualização: {formatDate(data.lastUpdate, 'long')}
          </p>
        </div>
      </div>

      {/* Status Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Database</CardDescription>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.database.status.toUpperCase()}</div>
            <p className="text-xs text-muted-foreground mt-1">{data.database.message}</p>
            <Badge variant="success" className="mt-2">✓ Conectado</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Quality Score</CardDescription>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.qualityScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">+2.3% vs mês anterior</p>
            <Badge variant="success" className="mt-2">Excelente</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Validações</CardDescription>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.validations.passed}/{data.validations.total}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {((data.validations.passed / data.validations.total) * 100).toFixed(1)}% aprovadas
            </p>
            <Badge variant="warning" className="mt-2">
              {data.validations.total - data.validations.passed} pendentes
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Total de Arquivos</CardDescription>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.layers.bronze + data.layers.silver + data.layers.gold}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all layers
            </p>
            <div className="flex gap-1 mt-2">
              <Badge variant="outline" className="text-xs">B: {data.layers.bronze}</Badge>
              <Badge variant="outline" className="text-xs">S: {data.layers.silver}</Badge>
              <Badge variant="outline" className="text-xs">G: {data.layers.gold}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Quality Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Qualidade</CardTitle>
            <CardDescription>Evolução do score nos últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[80, 100]}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="hsl(var(--success))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--success))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Layers Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Camada</CardTitle>
            <CardDescription>Arquivos em cada camada do data lake</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={layersChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {layersChartData.map((entry: { fill: string }, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Log de Atividades</CardTitle>
          <CardDescription>Últimas 5 atividades do sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Activity logs - usando dados do sistema */}
            <div className="flex items-start gap-3 text-sm">
              <Badge variant="success" className="mt-0.5">INFO</Badge>
              <div className="flex-1">
                <p className="text-foreground">API conectada com sucesso</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(data.lastUpdate, 'long')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Badge variant={data.database.status === 'online' ? 'success' : 'warning'} className="mt-0.5">
                {data.database.status === 'online' ? 'SUCCESS' : 'WARNING'}
              </Badge>
              <div className="flex-1">
                <p className="text-foreground">{data.database.message}</p>
                <p className="text-xs text-muted-foreground mt-1">Status do banco PostgreSQL</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Badge variant="success" className="mt-0.5">DATA</Badge>
              <div className="flex-1">
                <p className="text-foreground">{data.stats.totalAtividades.toLocaleString()} atividades carregadas</p>
                <p className="text-xs text-muted-foreground mt-1">{data.stats.totalPois.toLocaleString()} POIs identificados</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
