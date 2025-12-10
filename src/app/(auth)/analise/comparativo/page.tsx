'use client';

import { useState } from 'react';
import { MapPin, TrendingUp, Award, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, RadarChart, BarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useComparativoMunicipios } from '@/features/analise/hooks/use-comparativo-municipios';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const MUNICIPIO_COLORS = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
];

export default function ComparativoPage() {
  const {
    dadosComparativos,
    radarData,
    selectedMunicipios,
    setSelectedMunicipios,
    isLoading,
  } = useComparativoMunicipios();

  const toggleMunicipio = (id: string) => {
    setSelectedMunicipios((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id].slice(0, 4)
    );
  };

  // Dados para os gráficos de barras
  const hectaresData = dadosComparativos.map((m) => ({
    name: m.nome,
    value: m.hectares_mapeados,
  }));

  const eficienciaData = dadosComparativos.map((m) => ({
    name: m.nome,
    value: m.eficiencia,
  }));

  // Dados para o radar
  const radarDataKeys = dadosComparativos
    .filter((m) => selectedMunicipios.length === 0 || selectedMunicipios.includes(m.id))
    .slice(0, 4)
    .map((m, i) => ({
      key: m.nome,
      name: m.nome,
      color: MUNICIPIO_COLORS[i % MUNICIPIO_COLORS.length],
    }));

  // Município líder (maior eficiência)
  const lider = dadosComparativos.reduce((prev, current) =>
    prev.eficiencia > current.eficiencia ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Municípios Ativos"
          value={dadosComparativos.length.toString()}
          description="Com operações no período"
          icon={Building2}
          loading={isLoading}
        />
        <KPICard
          title="Líder em Eficiência"
          value={lider.nome}
          description={`${lider.eficiencia}% de eficiência`}
          icon={Award}
          loading={isLoading}
        />
        <KPICard
          title="Total Hectares"
          value={dadosComparativos
            .reduce((sum, m) => sum + m.hectares_mapeados, 0)
            .toLocaleString('pt-BR')}
          description="Mapeados no período"
          icon={MapPin}
          loading={isLoading}
        />
        <KPICard
          title="Média Eficiência"
          value={`${Math.round(
            dadosComparativos.reduce((sum, m) => sum + m.eficiencia, 0) /
              dadosComparativos.length
          )}%`}
          description="Entre todos municípios"
          icon={TrendingUp}
          loading={isLoading}
        />
      </div>

      {/* Seletor de Municípios */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Selecione os Municípios para Comparar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {dadosComparativos.map((mun, index) => {
              const isSelected =
                selectedMunicipios.length === 0 || selectedMunicipios.includes(mun.id);
              const colorIndex = selectedMunicipios.indexOf(mun.id);

              return (
                <Badge
                  key={mun.id}
                  variant={isSelected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-all',
                    isSelected && colorIndex >= 0 && 'text-white'
                  )}
                  style={{
                    backgroundColor:
                      isSelected && colorIndex >= 0
                        ? MUNICIPIO_COLORS[colorIndex % MUNICIPIO_COLORS.length]
                        : undefined,
                  }}
                  onClick={() => toggleMunicipio(mun.id)}
                >
                  {mun.nome}
                </Badge>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Selecione até 4 municípios para comparação detalhada
          </p>
        </CardContent>
      </Card>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Comparativo Radar"
          description="Métricas normalizadas por município"
          loading={isLoading}
        >
          <RadarChart
            data={radarData}
            dataKeys={radarDataKeys}
            angleAxisKey="subject"
            height={350}
          />
        </ChartWrapper>

        <ChartWrapper
          title="Hectares Mapeados"
          description="Por município"
          loading={isLoading}
        >
          <BarChart data={hectaresData} height={350} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Tabela Comparativa */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tabela Comparativa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Município</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-right py-3 px-4 font-medium">Criadouros</th>
                  <th className="text-right py-3 px-4 font-medium">Taxa Devolutiva</th>
                  <th className="text-right py-3 px-4 font-medium">Atividades</th>
                  <th className="text-right py-3 px-4 font-medium">Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {dadosComparativos.map((mun, index) => {
                  const isLider = mun.id === lider.id;
                  const colorIndex = selectedMunicipios.indexOf(mun.id);

                  return (
                    <tr
                      key={mun.id}
                      className={cn(
                        'border-b last:border-0',
                        isLider && 'bg-emerald-50 dark:bg-emerald-950/20'
                      )}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {colorIndex >= 0 && (
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: MUNICIPIO_COLORS[colorIndex % MUNICIPIO_COLORS.length],
                              }}
                            />
                          )}
                          <span className="font-medium">{mun.nome}</span>
                          {isLider && (
                            <Badge variant="secondary" className="text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              Líder
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="text-right py-3 px-4">
                        {mun.hectares_mapeados.toLocaleString('pt-BR')}
                      </td>
                      <td className="text-right py-3 px-4">
                        {mun.criadouros.toLocaleString('pt-BR')}
                      </td>
                      <td className="text-right py-3 px-4">{mun.taxa_devolutiva}%</td>
                      <td className="text-right py-3 px-4">{mun.atividades}</td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={cn(
                            'font-medium',
                            mun.eficiencia >= 85
                              ? 'text-emerald-600'
                              : mun.eficiencia >= 70
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {mun.eficiencia}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
