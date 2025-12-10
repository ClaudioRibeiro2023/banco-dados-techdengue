'use client';

import { FileCheck, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, FunnelChart, BarChart, DistributionChart, GaugeChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useDevolutivasAnalytics } from '@/features/analise/hooks/use-devolutivas-analytics';

export default function DevolutivasPage() {
  const {
    estatisticasPorStatus,
    funnelData,
    tempoResposta,
    metricas,
    isLoading,
  } = useDevolutivasAnalytics();

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Taxa de Conclusão"
          value={`${metricas.taxaConclusao}%`}
          description="Meta: 80%"
          icon={CheckCircle2}
          trend={{ value: 5, direction: metricas.taxaConclusao >= 80 ? 'up' : 'down' }}
          loading={isLoading}
        />
        <KPICard
          title="Pendências"
          value={metricas.pendencias.toLocaleString('pt-BR')}
          description="Aguardando tratamento"
          icon={AlertTriangle}
          trend={{ value: 12, direction: 'down' }}
          loading={isLoading}
        />
        <KPICard
          title="Tempo Médio"
          value={`${metricas.tempoMedio} dias`}
          description="Para conclusão"
          icon={Clock}
          trend={{ value: 8, direction: 'up' }}
          loading={isLoading}
        />
        <KPICard
          title="Total Processado"
          value={metricas.total.toLocaleString('pt-BR')}
          description="No período"
          icon={FileCheck}
          loading={isLoading}
        />
      </div>

      {/* Gauge de Taxa */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <GaugeChart
              value={metricas.taxaConclusao}
              max={100}
              label="% concluídas"
              size={200}
            />
          </CardContent>
        </Card>

        <ChartWrapper
          title="Funil de Devolutivas"
          description="Fluxo de processamento"
          loading={isLoading}
          className="md:col-span-2"
        >
          <FunnelChart data={funnelData} height={250} />
        </ChartWrapper>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper
          title="Distribuição por Status"
          description="Situação atual das devolutivas"
          loading={isLoading}
        >
          <DistributionChart
            data={estatisticasPorStatus.map((item) => ({
              name: item.status,
              value: item.total,
              color: item.color,
            }))}
            height={280}
          />
        </ChartWrapper>

        <ChartWrapper
          title="Tempo de Resposta"
          description="Histograma de tempo até conclusão"
          loading={isLoading}
        >
          <BarChart
            data={tempoResposta.map((item) => ({
              name: item.faixa,
              value: item.quantidade,
            }))}
            height={280}
            layout="horizontal"
            color="#3b82f6"
          />
        </ChartWrapper>
      </div>

      {/* Tabela de Pendências */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status das Devolutivas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {estatisticasPorStatus.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-medium">{item.status}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {item.total.toLocaleString('pt-BR')}
                  </span>
                  <span className="font-medium w-12 text-right">{item.percentual}%</span>
                </div>
              </div>
              <Progress value={item.percentual} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
