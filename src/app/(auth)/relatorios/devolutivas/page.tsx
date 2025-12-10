'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, FileCheck, Loader2, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, BarChart, FunnelChart, GaugeChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useRelatorioData } from '@/features/relatorios/hooks/use-relatorios';
import { createPDFReport } from '@/lib/utils/export-pdf';
import { exportToExcel } from '@/lib/utils/export-excel';
import type { RelatorioDevolutivas } from '@/lib/services/relatorios.service';
import { cn } from '@/lib/utils';

export default function RelatorioDevolutivasPage() {
  const { data, isLoading, isGenerating, setIsGenerating, periodoFormatado } =
    useRelatorioData('devolutivas');
  const relatorio = data as RelatorioDevolutivas;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = createPDFReport({
        title: 'Relatório de Devolutivas',
        subtitle: 'Análise de Status e Tempo de Resposta',
        periodo: relatorio.periodo,
      });

      pdf.addKPIs([
        { label: 'Total Criadouros', value: relatorio.resumo.total_criadouros.toLocaleString('pt-BR') },
        { label: 'Tratados', value: relatorio.resumo.devolutivas_tratadas.toLocaleString('pt-BR') },
        { label: 'Taxa Conclusão', value: relatorio.resumo.taxa_conclusao, suffix: '%' },
        { label: 'Tempo Médio', value: relatorio.resumo.tempo_medio_resposta, suffix: ' dias' },
      ]);

      pdf.addTable({
        title: 'Devolutivas por Tipo de Criadouro',
        columns: [
          { header: 'Tipo', dataKey: 'tipo' },
          { header: 'Total', dataKey: 'total' },
          { header: 'Tratados', dataKey: 'tratados' },
          { header: 'Pendentes', dataKey: 'pendentes' },
          { header: 'Taxa', dataKey: 'taxa' },
        ],
        rows: relatorio.por_tipo.map(t => ({
          ...t,
          taxa: `${t.taxa}%`,
        })),
      });

      pdf.addTable({
        title: 'Devolutivas por Município',
        columns: [
          { header: 'Município', dataKey: 'municipio' },
          { header: 'Total', dataKey: 'total' },
          { header: 'Tratados', dataKey: 'tratados' },
          { header: 'Taxa', dataKey: 'taxa' },
        ],
        rows: relatorio.por_municipio.map(m => ({
          ...m,
          taxa: `${m.taxa}%`,
        })),
      });

      pdf.save('relatorio-devolutivas.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setIsGenerating(true);
    try {
      exportToExcel({
        filename: 'relatorio-devolutivas',
        sheets: [
          {
            name: 'Resumo',
            data: [
              { Indicador: 'Total Criadouros', Valor: relatorio.resumo.total_criadouros },
              { Indicador: 'Devolutivas Pendentes', Valor: relatorio.resumo.devolutivas_pendentes },
              { Indicador: 'Devolutivas Em Análise', Valor: relatorio.resumo.devolutivas_em_analise },
              { Indicador: 'Devolutivas Tratadas', Valor: relatorio.resumo.devolutivas_tratadas },
              { Indicador: 'Devolutivas Descartadas', Valor: relatorio.resumo.devolutivas_descartadas },
              { Indicador: 'Taxa de Conclusão (%)', Valor: relatorio.resumo.taxa_conclusao },
              { Indicador: 'Tempo Médio de Resposta (dias)', Valor: relatorio.resumo.tempo_medio_resposta },
            ],
          },
          {
            name: 'Por Tipo',
            data: relatorio.por_tipo,
            columns: [
              { header: 'Tipo', key: 'tipo', width: 25 },
              { header: 'Total', key: 'total', width: 12 },
              { header: 'Tratados', key: 'tratados', width: 12 },
              { header: 'Pendentes', key: 'pendentes', width: 12 },
              { header: 'Taxa (%)', key: 'taxa', width: 12 },
            ],
          },
          {
            name: 'Por Município',
            data: relatorio.por_municipio,
            columns: [
              { header: 'Município', key: 'municipio', width: 25 },
              { header: 'Total', key: 'total', width: 12 },
              { header: 'Tratados', key: 'tratados', width: 12 },
              { header: 'Taxa (%)', key: 'taxa', width: 12 },
            ],
          },
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Funnel data
  const funnelData = [
    { name: 'Total', value: relatorio.resumo.total_criadouros, fill: '#3b82f6' },
    { name: 'Em Análise', value: relatorio.resumo.devolutivas_em_analise, fill: '#f59e0b' },
    { name: 'Tratados', value: relatorio.resumo.devolutivas_tratadas, fill: '#10b981' },
  ];

  // Chart data
  const tiposChartData = relatorio.por_tipo.map(t => ({
    name: t.tipo.split(' ')[0],
    value: t.taxa,
  }));

  const municipiosChartData = relatorio.por_municipio.map(m => ({
    name: m.municipio.split(' ')[0],
    value: m.taxa,
  }));

  return (
    <div className="space-y-6">
      {/* Header com Filtros e Exportação */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <DashboardFilters />
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportExcel} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Excel
          </Button>
          <Button onClick={handleExportPDF} disabled={isGenerating}>
            {isGenerating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <FileText className="h-4 w-4 mr-2" />}
            PDF
          </Button>
        </div>
      </div>

      {/* Info do Relatório */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Relatório de Devolutivas</CardTitle>
              <CardDescription>Período: {periodoFormatado}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Criadouros"
          value={relatorio.resumo.total_criadouros.toLocaleString('pt-BR')}
          description="Identificados no período"
          icon={FileCheck}
          loading={isLoading}
        />
        <KPICard
          title="Devolutivas Tratadas"
          value={relatorio.resumo.devolutivas_tratadas.toLocaleString('pt-BR')}
          description={`${relatorio.resumo.taxa_conclusao}% de conclusão`}
          icon={FileCheck}
          loading={isLoading}
          variant="success"
        />
        <KPICard
          title="Pendentes"
          value={relatorio.resumo.devolutivas_pendentes.toLocaleString('pt-BR')}
          description="Aguardando tratamento"
          icon={FileCheck}
          loading={isLoading}
          variant={relatorio.resumo.devolutivas_pendentes > 500 ? 'danger' : 'warning'}
        />
        <KPICard
          title="Tempo Médio"
          value={`${relatorio.resumo.tempo_medio_resposta} dias`}
          description="Para tratamento"
          icon={Clock}
          loading={isLoading}
          variant={relatorio.resumo.tempo_medio_resposta <= 3 ? 'success' : 'warning'}
        />
      </div>

      {/* Gauges e Funil */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
          </CardHeader>
          <CardContent>
            <GaugeChart value={relatorio.resumo.taxa_conclusao} max={100} label="%" size={150} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Funil de Devolutivas</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart data={funnelData} height={150} />
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Taxa por Tipo de Criadouro"
          description="Percentual de tratamento"
          loading={isLoading}
        >
          <BarChart data={tiposChartData} height={300} color="#10b981" />
        </ChartWrapper>

        <ChartWrapper
          title="Taxa por Município"
          description="Percentual de tratamento"
          loading={isLoading}
        >
          <BarChart data={municipiosChartData} height={300} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Tabela por Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Tipo de Criadouro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatorio.por_tipo.map((tipo) => (
              <div key={tipo.tipo} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{tipo.tipo}</span>
                  <span className="text-muted-foreground">
                    {tipo.tratados}/{tipo.total} tratados ({tipo.taxa}%)
                  </span>
                </div>
                <div className="flex gap-1 h-2">
                  <div
                    className="bg-emerald-500 rounded-l"
                    style={{ width: `${(tipo.tratados / tipo.total) * 100}%` }}
                  />
                  <div
                    className="bg-red-400 rounded-r"
                    style={{ width: `${(tipo.pendentes / tipo.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela por Município */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Devolutivas por Município</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Município</th>
                  <th className="text-right py-3 px-4 font-medium">Total</th>
                  <th className="text-right py-3 px-4 font-medium">Tratados</th>
                  <th className="text-right py-3 px-4 font-medium">Taxa</th>
                  <th className="text-left py-3 px-4 font-medium w-32">Progresso</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.por_municipio.map((municipio) => (
                  <tr key={municipio.municipio} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{municipio.municipio}</td>
                    <td className="text-right py-3 px-4">{municipio.total.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-3 px-4">{municipio.tratados.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={cn(
                          'font-medium',
                          municipio.taxa >= 85 ? 'text-emerald-600' : municipio.taxa >= 70 ? 'text-yellow-600' : 'text-red-600'
                        )}
                      >
                        {municipio.taxa}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Progress value={municipio.taxa} className="h-2" />
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
