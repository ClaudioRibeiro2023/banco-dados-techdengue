'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, BarChart3, Loader2, TrendingUp, TrendingDown, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, EvolutionChart, BarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useRelatorioData } from '@/features/relatorios/hooks/use-relatorios';
import { createPDFReport } from '@/lib/utils/export-pdf';
import type { RelatorioExecutivo } from '@/lib/services/relatorios.service';
import { cn } from '@/lib/utils';

export default function RelatorioExecutivoPage() {
  const { data, isLoading, isGenerating, setIsGenerating, periodoFormatado } =
    useRelatorioData('executivo');
  const relatorio = data as RelatorioExecutivo;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = createPDFReport({
        title: 'Relatório Executivo',
        subtitle: 'Visão Consolidada de Operações',
        periodo: relatorio.periodo,
      });

      pdf.addKPIs([
        { label: 'Hectares Mapeados', value: relatorio.kpis.hectares_mapeados.toLocaleString('pt-BR') },
        { label: 'Variação', value: relatorio.kpis.variacao_hectares > 0 ? '+' : '', suffix: `${relatorio.kpis.variacao_hectares}%` },
        { label: 'Criadouros', value: relatorio.kpis.criadouros_identificados.toLocaleString('pt-BR') },
        { label: 'Taxa Devolutivas', value: relatorio.kpis.taxa_devolutivas, suffix: '%' },
      ]);

      pdf.addTable({
        title: 'Ranking de Municípios',
        columns: [
          { header: 'Posição', dataKey: 'posicao' },
          { header: 'Município', dataKey: 'municipio' },
          { header: 'Hectares', dataKey: 'hectares' },
          { header: 'Eficiência', dataKey: 'eficiencia' },
        ],
        rows: relatorio.ranking_municipios.map(m => ({
          ...m,
          posicao: `${m.posicao}º`,
          hectares: m.hectares.toLocaleString('pt-BR'),
          eficiencia: `${m.eficiencia}%`,
        })),
      });

      pdf.addSection(
        'Análise de Tendências',
        `No período analisado, observou-se um crescimento de ${relatorio.kpis.variacao_hectares}% no mapeamento de hectares. ` +
        `A taxa de devolutivas está em ${relatorio.kpis.taxa_devolutivas}%, representando uma variação de ${relatorio.kpis.variacao_devolutivas > 0 ? '+' : ''}${relatorio.kpis.variacao_devolutivas}% em relação ao período anterior. ` +
        `O município líder em eficiência é ${relatorio.ranking_municipios[0]?.municipio || 'N/A'} com ${relatorio.ranking_municipios[0]?.eficiencia || 0}%.`
      );

      pdf.addSection(
        'Recomendações',
        '1. Intensificar ações nos municípios com menor taxa de eficiência.\n' +
        '2. Priorizar tratamento de devolutivas pendentes acima de 30 dias.\n' +
        '3. Avaliar redistribuição de pilotos para otimizar cobertura.\n' +
        '4. Implementar programa de capacitação para equipes com menor performance.'
      );

      pdf.save('relatorio-executivo.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  // Chart data for evolution
  const hectaresEvolutionData = relatorio.tendencias.hectares.map(h => ({
    date: h.mes,
    hectares: h.valor,
  }));

  const devolutivasEvolutionData = relatorio.tendencias.devolutivas.map(d => ({
    date: d.mes,
    hectares: d.valor, // reusing hectares key for evolution chart
  }));

  // Ranking chart data
  const rankingChartData = relatorio.ranking_municipios.map(m => ({
    name: m.municipio.split(' ')[0],
    value: m.hectares,
  }));

  return (
    <div className="space-y-6">
      {/* Header com Filtros e Exportação */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <DashboardFilters />
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* Info do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Relatório Executivo</CardTitle>
              <CardDescription>Período: {periodoFormatado}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs com Variação */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Hectares Mapeados"
          value={relatorio.kpis.hectares_mapeados.toLocaleString('pt-BR')}
          description="Total no período"
          icon={BarChart3}
          loading={isLoading}
          trend={{
            value: Math.abs(relatorio.kpis.variacao_hectares),
            direction: relatorio.kpis.variacao_hectares >= 0 ? 'up' : 'down',
          }}
        />
        <KPICard
          title="Criadouros"
          value={relatorio.kpis.criadouros_identificados.toLocaleString('pt-BR')}
          description="Identificados"
          icon={BarChart3}
          loading={isLoading}
          trend={{
            value: Math.abs(relatorio.kpis.variacao_criadouros),
            direction: relatorio.kpis.variacao_criadouros >= 0 ? 'up' : 'down',
            isPositive: relatorio.kpis.variacao_criadouros < 0, // menos criadouros é bom
          }}
        />
        <KPICard
          title="Taxa Devolutivas"
          value={`${relatorio.kpis.taxa_devolutivas}%`}
          description="Tratadas no período"
          icon={BarChart3}
          loading={isLoading}
          variant={relatorio.kpis.taxa_devolutivas >= 80 ? 'success' : 'warning'}
          trend={{
            value: Math.abs(relatorio.kpis.variacao_devolutivas),
            direction: relatorio.kpis.variacao_devolutivas >= 0 ? 'up' : 'down',
          }}
        />
        <KPICard
          title="Atividades"
          value={relatorio.kpis.atividades_realizadas.toString()}
          description="Realizadas"
          icon={BarChart3}
          loading={isLoading}
          trend={{
            value: Math.abs(relatorio.kpis.variacao_atividades),
            direction: relatorio.kpis.variacao_atividades >= 0 ? 'up' : 'down',
          }}
        />
      </div>

      {/* Ranking de Municípios */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-base">Ranking de Municípios</CardTitle>
          </div>
          <CardDescription>Por hectares mapeados e eficiência operacional</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-center py-3 px-4 font-medium w-16">Pos.</th>
                  <th className="text-left py-3 px-4 font-medium">Município</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-right py-3 px-4 font-medium">Eficiência</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.ranking_municipios.map((municipio, index) => (
                  <tr
                    key={municipio.municipio}
                    className={cn(
                      'border-b last:border-0',
                      index === 0 && 'bg-yellow-50 dark:bg-yellow-950/20'
                    )}
                  >
                    <td className="text-center py-3 px-4">
                      {index === 0 ? (
                        <Badge className="bg-yellow-500 text-white">1º</Badge>
                      ) : index === 1 ? (
                        <Badge className="bg-gray-400 text-white">2º</Badge>
                      ) : index === 2 ? (
                        <Badge className="bg-amber-700 text-white">3º</Badge>
                      ) : (
                        <span className="text-muted-foreground">{municipio.posicao}º</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-medium">{municipio.municipio}</td>
                    <td className="text-right py-3 px-4">
                      {municipio.hectares.toLocaleString('pt-BR')}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={cn(
                          'font-medium',
                          municipio.eficiencia >= 90 ? 'text-emerald-600' :
                          municipio.eficiencia >= 80 ? 'text-yellow-600' : 'text-red-600'
                        )}
                      >
                        {municipio.eficiencia}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Tendência */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Evolução de Hectares"
          description="Tendência mensal de mapeamento"
          loading={isLoading}
        >
          <EvolutionChart data={hectaresEvolutionData} dataKey="hectares" height={300} />
        </ChartWrapper>

        <ChartWrapper
          title="Hectares por Município"
          description="Distribuição atual"
          loading={isLoading}
        >
          <BarChart data={rankingChartData} height={300} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Insights e Recomendações */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Destaques Positivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">+</span>
                <span>Crescimento de {relatorio.kpis.variacao_hectares}% no mapeamento de hectares</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">+</span>
                <span>Aumento de {relatorio.kpis.variacao_atividades}% no número de atividades</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">+</span>
                <span>{relatorio.ranking_municipios[0]?.municipio} lidera com {relatorio.ranking_municipios[0]?.eficiencia}% de eficiência</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-500 mt-1">+</span>
                <span>Taxa de devolutivas em {relatorio.kpis.taxa_devolutivas}%</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
              Pontos de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">!</span>
                <span>Redução de {Math.abs(relatorio.kpis.variacao_criadouros)}% na identificação de criadouros</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">!</span>
                <span>Municípios com eficiência abaixo de 85% precisam de atenção</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">!</span>
                <span>Verificar cobertura em áreas com menor mapeamento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-500 mt-1">!</span>
                <span>Priorizar devolutivas pendentes há mais de 7 dias</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Curto Prazo</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Intensificar tratamento de devolutivas pendentes</li>
                <li>- Reforçar equipe em municípios de baixa performance</li>
                <li>- Avaliar condições climáticas para planejamento</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h4 className="font-medium mb-2">Médio Prazo</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>- Implementar programa de capacitação de pilotos</li>
                <li>- Otimizar rotas de mapeamento</li>
                <li>- Revisar metas por município</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
