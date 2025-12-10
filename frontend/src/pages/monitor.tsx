import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/ui/stat-card'
import { Loading } from '@/components/ui/spinner'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { formatDate } from '../lib/utils'
import { Activity, Database, CheckCircle2, AlertTriangle, FileStack } from 'lucide-react'
import { useMonitorData } from '@/lib/queries'

export function MonitorPage() {
  const { data, isLoading, error } = useMonitorData()

  if (isLoading) {
    return <Loading text="Carregando dados do monitor..." />
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
        <StatCard
          title="Database"
          value={data.database.status.toUpperCase()}
          icon={<Database className="h-5 w-5" />}
          variant={data.database.status === 'online' ? 'success' : 'error'}
          description={data.database.message}
        />
        <StatCard
          title="Quality Score"
          value={data.qualityScore}
          suffix="%"
          icon={<Activity className="h-5 w-5" />}
          variant="success"
          trend={2.3}
        />
        <StatCard
          title="Validações"
          value={`${data.validations.passed}/${data.validations.total}`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant={data.validations.passed === data.validations.total ? 'success' : 'warning'}
          description={`${((data.validations.passed / data.validations.total) * 100).toFixed(1)}% aprovadas`}
        />
        <StatCard
          title="Total de Arquivos"
          value={data.layers.bronze + data.layers.silver + data.layers.gold}
          icon={<FileStack className="h-5 w-5" />}
          description={`B:${data.layers.bronze} S:${data.layers.silver} G:${data.layers.gold}`}
        />
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
