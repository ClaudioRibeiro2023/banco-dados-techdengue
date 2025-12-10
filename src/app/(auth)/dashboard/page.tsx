'use client';

import { MapPin, Bug, ClipboardCheck, Plane, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/data-display/kpi-card';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { ChartWrapper, EvolutionChart, DistributionChart } from '@/components/charts';
import { useDashboardKPIs, useHectaresMapeados } from '@/features/dashboard/hooks/use-dashboard-kpis';

// Dados mock para os gráficos enquanto a API não está disponível
const evolutionMockData = [
  { date: 'Jan', hectares: 1200 },
  { date: 'Fev', hectares: 2100 },
  { date: 'Mar', hectares: 3400 },
  { date: 'Abr', hectares: 4200 },
  { date: 'Mai', hectares: 5800 },
  { date: 'Jun', hectares: 7200 },
  { date: 'Jul', hectares: 8900 },
  { date: 'Ago', hectares: 10500 },
  { date: 'Set', hectares: 11200 },
  { date: 'Out', hectares: 12450 },
];

const distributionMockData = [
  { name: 'Pneus', value: 1245, color: '#10b981' },
  { name: 'Caixas d\'água', value: 892, color: '#3b82f6' },
  { name: 'Calhas', value: 534, color: '#f59e0b' },
  { name: 'Piscinas', value: 312, color: '#ef4444' },
  { name: 'Outros', value: 304, color: '#8b5cf6' },
];

export default function DashboardPage() {
  const { data: kpiData, isLoading: isLoadingKPIs } = useDashboardKPIs();
  const { data: hectaresData, isLoading: isLoadingHectares } = useHectaresMapeados();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das operações TechDengue</p>
        </div>
        <DashboardFilters />
      </div>

      {/* KPIs Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Hectares Mapeados"
          value={kpiData?.hectares_mapeados?.toLocaleString('pt-BR') || '12.450'}
          description="Área total coberta"
          icon={MapPin}
          trend={{ value: 15, direction: 'up' }}
          loading={isLoadingKPIs}
        />
        <KPICard
          title="Criadouros Identificados"
          value={kpiData?.total_pois?.toLocaleString('pt-BR') || '3.287'}
          description="POIs cadastrados"
          icon={Bug}
          trend={{ value: 23, direction: 'up' }}
          loading={isLoadingKPIs}
        />
        <KPICard
          title="Taxa de Devolutivas"
          value={`${kpiData?.taxa_devolutivas || 78}%`}
          description="Meta: 80%"
          icon={ClipboardCheck}
          trend={{ value: 5, direction: 'down' }}
          loading={isLoadingKPIs}
        />
        <KPICard
          title="Atividades Ativas"
          value={kpiData?.atividades_ativas?.toString() || '12'}
          description="Em andamento"
          icon={Plane}
          trend={{ value: 0, direction: 'stable' }}
          loading={isLoadingKPIs}
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper
          title="Evolução de Mapeamento"
          description="Hectares mapeados ao longo do tempo"
          loading={isLoadingHectares}
          action={
            <div className="flex items-center gap-1 text-xs text-emerald-600">
              <TrendingUp className="h-3 w-3" />
              +18% este mês
            </div>
          }
        >
          <EvolutionChart
            data={hectaresData?.evolucao || evolutionMockData}
            dataKey="hectares"
          />
        </ChartWrapper>

        <ChartWrapper
          title="Distribuição por Tipo de Criadouro"
          description="Classificação dos POIs identificados"
          loading={isLoadingKPIs}
        >
          <DistributionChart
            data={kpiData?.distribuicao_pois || distributionMockData}
          />
        </ChartWrapper>
      </div>

      {/* Map Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Mapa de Operações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <div className="text-center">
              <MapPin className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">Mapa geoespacial será implementado na Fase 3</p>
              <p className="text-sm">Integração com Mapbox GL JS</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
