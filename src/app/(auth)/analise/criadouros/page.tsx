'use client';

import { Bug, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, TreemapChart, StackedBarChart, DistributionChart, BarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useCriadourosAnalytics } from '@/features/analise/hooks/use-criadouros-analytics';

const TIPO_CATEGORIES = [
  { key: 'pneu', name: 'Pneu', color: '#10b981' },
  { key: 'caixa_dagua', name: 'Caixa d\'água', color: '#3b82f6' },
  { key: 'calha', name: 'Calha', color: '#f59e0b' },
  { key: 'piscina', name: 'Piscina', color: '#ef4444' },
  { key: 'lixo', name: 'Lixo/Entulho', color: '#8b5cf6' },
];

export default function CriadourosPage() {
  const {
    estatisticasPorTipo,
    evolucaoTemporal,
    treemapData,
    totalCriadouros,
    isLoading,
  } = useCriadourosAnalytics();

  // Preparar dados para o stacked bar chart
  const stackedData = evolucaoTemporal.map((item) => ({
    periodo: item.periodo,
    ...item.porTipo,
  }));

  // Dados para ranking por tipo
  const rankingData = estatisticasPorTipo.map((item) => ({
    name: item.tipo,
    value: item.total,
  }));

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Criadouros"
          value={totalCriadouros.toLocaleString('pt-BR')}
          description="Identificados no período"
          icon={Bug}
          trend={{ value: 12, direction: 'up' }}
          loading={isLoading}
        />
        <KPICard
          title="Tipo Predominante"
          value="Pneu"
          description="38% do total"
          icon={TrendingUp}
          loading={isLoading}
        />
        <KPICard
          title="Média Diária"
          value="32"
          description="Criadouros/dia"
          icon={MapPin}
          trend={{ value: 8, direction: 'up' }}
          loading={isLoading}
        />
        <KPICard
          title="Variação Mensal"
          value="+18%"
          description="vs. mês anterior"
          icon={TrendingDown}
          trend={{ value: 18, direction: 'up' }}
          loading={isLoading}
        />
      </div>

      {/* Gráficos - Primeira Linha */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper
          title="Distribuição por Tipo"
          description="Treemap proporcional ao volume"
          loading={isLoading}
        >
          <TreemapChart data={treemapData} height={280} />
        </ChartWrapper>

        <ChartWrapper
          title="Proporção por Categoria"
          description="Percentual de cada tipo de criadouro"
          loading={isLoading}
        >
          <DistributionChart
            data={estatisticasPorTipo.map((item) => ({
              name: item.tipo,
              value: item.total,
              color: item.color,
            }))}
            height={280}
          />
        </ChartWrapper>
      </div>

      {/* Gráficos - Segunda Linha */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartWrapper
          title="Evolução Temporal"
          description="Identificação de criadouros por mês"
          loading={isLoading}
          className="md:col-span-2 lg:col-span-1"
        >
          <StackedBarChart
            data={stackedData}
            categories={TIPO_CATEGORIES}
            xAxisKey="periodo"
            height={300}
          />
        </ChartWrapper>

        <ChartWrapper
          title="Ranking por Tipo"
          description="Quantidade absoluta por categoria"
          loading={isLoading}
        >
          <BarChart data={rankingData} height={300} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Tipo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Tipo</th>
                  <th className="text-right py-3 px-4 font-medium">Quantidade</th>
                  <th className="text-right py-3 px-4 font-medium">Percentual</th>
                  <th className="text-right py-3 px-4 font-medium">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {estatisticasPorTipo.map((item, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.tipo}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 font-medium">
                      {item.total.toLocaleString('pt-BR')}
                    </td>
                    <td className="text-right py-3 px-4 text-muted-foreground">
                      {item.percentual}%
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="text-emerald-600 text-xs flex items-center justify-end gap-1">
                        <TrendingUp className="h-3 w-3" />
                        +{Math.floor(Math.random() * 20)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
