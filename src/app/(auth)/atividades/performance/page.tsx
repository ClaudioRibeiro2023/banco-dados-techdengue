'use client';

import { TrendingUp, TrendingDown, Target, Award, MapPin, Calendar, BarChart3, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, BarChart, EvolutionChart, GaugeChart, RadarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { cn } from '@/lib/utils';

interface PerformanceMetrics {
  totalAtividades: number;
  atividadesConcluidas: number;
  atividadesCanceladas: number;
  taxaConclusao: number;
  totalHectares: number;
  hectaresEfetivos: number;
  taxaEfetividade: number;
  mediaHectaresDia: number;
  tendencia: 'up' | 'down' | 'stable';
  variacaoMensal: number;
}

// Mock data
const mockMetrics: PerformanceMetrics = {
  totalAtividades: 156,
  atividadesConcluidas: 142,
  atividadesCanceladas: 8,
  taxaConclusao: 91,
  totalHectares: 42500,
  hectaresEfetivos: 38250,
  taxaEfetividade: 90,
  mediaHectaresDia: 275,
  tendencia: 'up',
  variacaoMensal: 12.5,
};

const mockEvolucaoData = [
  { date: '01/12', hectares: 1200 },
  { date: '02/12', hectares: 1450 },
  { date: '03/12', hectares: 1100 },
  { date: '04/12', hectares: 1680 },
  { date: '05/12', hectares: 1520 },
  { date: '06/12', hectares: 1890 },
  { date: '07/12', hectares: 1340 },
  { date: '08/12', hectares: 1760 },
  { date: '09/12', hectares: 1920 },
  { date: '10/12', hectares: 1580 },
  { date: '11/12', hectares: 2100 },
  { date: '12/12', hectares: 1960 },
];

const mockAtividadesPorStatus = [
  { name: 'Concluídas', value: 142 },
  { name: 'Planejadas', value: 6 },
  { name: 'Canceladas', value: 8 },
];

const mockComparativoMensal = [
  { name: 'Jan', value: 35000 },
  { name: 'Fev', value: 32000 },
  { name: 'Mar', value: 38000 },
  { name: 'Abr', value: 41000 },
  { name: 'Mai', value: 39500 },
  { name: 'Jun', value: 42500 },
];

const mockRadarData = [
  { subject: 'Efetividade', fullMark: 100, Atual: 90, Meta: 95 },
  { subject: 'Conclusão', fullMark: 100, Atual: 91, Meta: 90 },
  { subject: 'Pontualidade', fullMark: 100, Atual: 85, Meta: 90 },
  { subject: 'Qualidade', fullMark: 100, Atual: 88, Meta: 85 },
  { subject: 'Produtividade', fullMark: 100, Atual: 92, Meta: 90 },
];

const radarDataKeys = [
  { key: 'Atual', name: 'Performance Atual', color: '#3b82f6' },
  { key: 'Meta', name: 'Meta', color: '#10b981' },
];

export default function PerformancePage() {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Taxa de Conclusão"
          value={`${mockMetrics.taxaConclusao}%`}
          description={`${mockMetrics.atividadesConcluidas}/${mockMetrics.totalAtividades} atividades`}
          icon={Target}
          variant={mockMetrics.taxaConclusao >= 90 ? 'success' : mockMetrics.taxaConclusao >= 80 ? 'warning' : 'danger'}
          trend={
            mockMetrics.tendencia === 'up'
              ? { value: mockMetrics.variacaoMensal, direction: 'up' }
              : mockMetrics.tendencia === 'down'
              ? { value: mockMetrics.variacaoMensal, direction: 'down' }
              : undefined
          }
        />
        <KPICard
          title="Taxa de Efetividade"
          value={`${mockMetrics.taxaEfetividade}%`}
          description={`${mockMetrics.hectaresEfetivos.toLocaleString('pt-BR')} ha efetivos`}
          icon={Activity}
          variant={mockMetrics.taxaEfetividade >= 90 ? 'success' : mockMetrics.taxaEfetividade >= 80 ? 'warning' : 'danger'}
        />
        <KPICard
          title="Total Hectares"
          value={mockMetrics.totalHectares.toLocaleString('pt-BR')}
          description="Mapeados no período"
          icon={MapPin}
        />
        <KPICard
          title="Média Diária"
          value={`${mockMetrics.mediaHectaresDia} ha`}
          description="Por dia de operação"
          icon={BarChart3}
          trend={{ value: 8.2, direction: 'up' }}
        />
      </div>

      {/* Gauges de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart
              value={mockMetrics.taxaConclusao}
              max={100}
              label="Taxa"
              size={150}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Efetividade</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart
              value={mockMetrics.taxaEfetividade}
              max={100}
              label="Taxa"
              size={150}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Meta Hectares</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart
              value={85}
              max={100}
              label="Atingido"
              size={150}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Qualidade</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart
              value={88}
              max={100}
              label="Score"
              size={150}
            />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Evolução Diária"
          description="Hectares mapeados por dia"
        >
          <EvolutionChart data={mockEvolucaoData} dataKey="hectares" height={300} />
        </ChartWrapper>

        <ChartWrapper
          title="Comparativo Radar"
          description="Performance atual vs metas"
        >
          <RadarChart
            data={mockRadarData}
            dataKeys={radarDataKeys}
            angleAxisKey="subject"
            height={300}
          />
        </ChartWrapper>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Evolução Mensal"
          description="Hectares totais por mês"
        >
          <BarChart data={mockComparativoMensal} height={300} color="#3b82f6" />
        </ChartWrapper>

        <ChartWrapper
          title="Status das Atividades"
          description="Distribuição por status"
        >
          <BarChart data={mockAtividadesPorStatus} height={300} color="#10b981" />
        </ChartWrapper>
      </div>

      {/* Indicadores Detalhados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores de Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <IndicadorCard
              titulo="Tempo Médio por Atividade"
              valor="4.2h"
              meta="4h"
              status="warning"
              variacao={5}
              direcao="up"
            />
            <IndicadorCard
              titulo="Atividades/Dia"
              valor="3.8"
              meta="4"
              status="success"
              variacao={8}
              direcao="up"
            />
            <IndicadorCard
              titulo="Hectares/Hora"
              valor="65.5"
              meta="60"
              status="success"
              variacao={12}
              direcao="up"
            />
            <IndicadorCard
              titulo="Taxa de Cancelamento"
              valor="5.1%"
              meta="< 5%"
              status="warning"
              variacao={2}
              direcao="up"
            />
            <IndicadorCard
              titulo="Utilização de Frota"
              valor="87%"
              meta="85%"
              status="success"
              variacao={4}
              direcao="up"
            />
            <IndicadorCard
              titulo="Retrabalho"
              valor="3.2%"
              meta="< 5%"
              status="success"
              variacao={15}
              direcao="down"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface IndicadorCardProps {
  titulo: string;
  valor: string;
  meta: string;
  status: 'success' | 'warning' | 'danger';
  variacao: number;
  direcao: 'up' | 'down';
}

function IndicadorCard({ titulo, valor, meta, status, variacao, direcao }: IndicadorCardProps) {
  const isPositive = (direcao === 'up' && status !== 'danger') || (direcao === 'down' && status === 'success');

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{titulo}</span>
        <Badge
          variant={status === 'success' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}
          className="text-xs"
        >
          Meta: {meta}
        </Badge>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{valor}</span>
        <div
          className={cn(
            'flex items-center gap-1 text-sm',
            isPositive ? 'text-emerald-600' : 'text-red-600'
          )}
        >
          {direcao === 'up' ? (
            <TrendingUp className="h-4 w-4" />
          ) : (
            <TrendingDown className="h-4 w-4" />
          )}
          <span>{variacao}%</span>
        </div>
      </div>
    </div>
  );
}
