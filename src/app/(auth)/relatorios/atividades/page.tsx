'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Calendar, Loader2, Users, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, BarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useRelatorioData } from '@/features/relatorios/hooks/use-relatorios';
import { createPDFReport } from '@/lib/utils/export-pdf';
import { exportToExcel } from '@/lib/utils/export-excel';
import type { RelatorioAtividades } from '@/lib/services/relatorios.service';
import { cn } from '@/lib/utils';

export default function RelatorioAtividadesPage() {
  const { data, isLoading, isGenerating, setIsGenerating, periodoFormatado } =
    useRelatorioData('atividades');
  const relatorio = data as RelatorioAtividades;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = createPDFReport({
        title: 'Relatório de Atividades',
        subtitle: 'Consolidado por Período',
        periodo: relatorio.periodo,
      });

      pdf.addKPIs([
        { label: 'Total Atividades', value: relatorio.resumo.total_atividades },
        { label: 'Concluídas', value: relatorio.resumo.atividades_concluidas },
        { label: 'Taxa Conclusão', value: relatorio.resumo.taxa_conclusao, suffix: '%' },
        { label: 'Total Hectares', value: relatorio.resumo.total_hectares.toLocaleString('pt-BR') },
      ]);

      pdf.addTable({
        title: 'Performance por Piloto',
        columns: [
          { header: 'Piloto', dataKey: 'piloto_nome' },
          { header: 'Atividades', dataKey: 'atividades' },
          { header: 'Hectares', dataKey: 'hectares' },
          { header: 'Efetividade', dataKey: 'efetividade' },
        ],
        rows: relatorio.por_piloto.map(p => ({
          ...p,
          hectares: p.hectares.toLocaleString('pt-BR'),
          efetividade: `${p.efetividade}%`,
        })),
      });

      pdf.addTable({
        title: 'Distribuição por Município',
        columns: [
          { header: 'Município', dataKey: 'municipio_nome' },
          { header: 'Atividades', dataKey: 'atividades' },
          { header: 'Hectares', dataKey: 'hectares' },
        ],
        rows: relatorio.por_municipio.map(m => ({
          ...m,
          hectares: m.hectares.toLocaleString('pt-BR'),
        })),
      });

      pdf.addPageBreak();

      pdf.addTable({
        title: 'Detalhamento de Atividades',
        columns: [
          { header: 'Data', dataKey: 'data' },
          { header: 'Município', dataKey: 'municipio' },
          { header: 'Piloto', dataKey: 'piloto' },
          { header: 'Turno', dataKey: 'turno' },
          { header: 'Hectares', dataKey: 'hectares_mapeados' },
          { header: 'Status', dataKey: 'status' },
        ],
        rows: relatorio.detalhes.map(d => ({
          ...d,
          data: format(new Date(d.data), 'dd/MM/yyyy', { locale: ptBR }),
        })),
      });

      pdf.save('relatorio-atividades.pdf');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setIsGenerating(true);
    try {
      exportToExcel({
        filename: 'relatorio-atividades',
        sheets: [
          {
            name: 'Resumo',
            data: [
              { Indicador: 'Total Atividades', Valor: relatorio.resumo.total_atividades },
              { Indicador: 'Atividades Concluídas', Valor: relatorio.resumo.atividades_concluidas },
              { Indicador: 'Atividades Canceladas', Valor: relatorio.resumo.atividades_canceladas },
              { Indicador: 'Taxa de Conclusão (%)', Valor: relatorio.resumo.taxa_conclusao },
              { Indicador: 'Total Hectares', Valor: relatorio.resumo.total_hectares },
              { Indicador: 'Hectares Efetivos', Valor: relatorio.resumo.hectares_efetivos },
            ],
          },
          {
            name: 'Por Piloto',
            data: relatorio.por_piloto,
            columns: [
              { header: 'ID', key: 'piloto_id', width: 10 },
              { header: 'Piloto', key: 'piloto_nome', width: 25 },
              { header: 'Atividades', key: 'atividades', width: 12 },
              { header: 'Hectares', key: 'hectares', width: 12 },
              { header: 'Efetividade (%)', key: 'efetividade', width: 15 },
            ],
          },
          {
            name: 'Por Município',
            data: relatorio.por_municipio,
            columns: [
              { header: 'ID', key: 'municipio_id', width: 10 },
              { header: 'Município', key: 'municipio_nome', width: 25 },
              { header: 'Atividades', key: 'atividades', width: 12 },
              { header: 'Hectares', key: 'hectares', width: 12 },
            ],
          },
          {
            name: 'Detalhes',
            data: relatorio.detalhes.map(d => ({
              ...d,
              data: format(new Date(d.data), 'dd/MM/yyyy', { locale: ptBR }),
            })),
            columns: [
              { header: 'ID', key: 'id', width: 10 },
              { header: 'Data', key: 'data', width: 12 },
              { header: 'Município', key: 'municipio', width: 20 },
              { header: 'Piloto', key: 'piloto', width: 20 },
              { header: 'Turno', key: 'turno', width: 10 },
              { header: 'Hectares Mapeados', key: 'hectares_mapeados', width: 18 },
              { header: 'Hectares Efetivos', key: 'hectares_efetivos', width: 18 },
              { header: 'Status', key: 'status', width: 15 },
            ],
          },
        ],
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Chart data
  const pilotosChartData = relatorio.por_piloto.map(p => ({
    name: p.piloto_nome.split(' ')[0],
    value: p.hectares,
  }));

  const municipiosChartData = relatorio.por_municipio.map(m => ({
    name: m.municipio_nome.split(' ')[0],
    value: m.hectares,
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
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Relatório de Atividades</CardTitle>
              <CardDescription>Período: {periodoFormatado}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Atividades"
          value={relatorio.resumo.total_atividades.toString()}
          description={`${relatorio.resumo.atividades_canceladas} canceladas`}
          icon={Calendar}
          loading={isLoading}
        />
        <KPICard
          title="Concluídas"
          value={relatorio.resumo.atividades_concluidas.toString()}
          description={`${relatorio.resumo.taxa_conclusao}% de conclusão`}
          icon={Calendar}
          loading={isLoading}
          variant="success"
        />
        <KPICard
          title="Total Hectares"
          value={relatorio.resumo.total_hectares.toLocaleString('pt-BR')}
          description="Mapeados no período"
          icon={MapPin}
          loading={isLoading}
        />
        <KPICard
          title="Hectares Efetivos"
          value={relatorio.resumo.hectares_efetivos.toLocaleString('pt-BR')}
          description={`${Math.round((relatorio.resumo.hectares_efetivos / relatorio.resumo.total_hectares) * 100)}% de efetividade`}
          icon={MapPin}
          loading={isLoading}
          variant="success"
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Hectares por Piloto"
          description="Distribuição de hectares mapeados"
          loading={isLoading}
        >
          <BarChart data={pilotosChartData} height={300} color="#10b981" />
        </ChartWrapper>

        <ChartWrapper
          title="Hectares por Município"
          description="Distribuição geográfica"
          loading={isLoading}
        >
          <BarChart data={municipiosChartData} height={300} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Tabela de Pilotos */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle className="text-base">Performance por Piloto</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Piloto</th>
                  <th className="text-right py-3 px-4 font-medium">Atividades</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-right py-3 px-4 font-medium">Efetividade</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.por_piloto.map((piloto) => (
                  <tr key={piloto.piloto_id} className="border-b last:border-0">
                    <td className="py-3 px-4 font-medium">{piloto.piloto_nome}</td>
                    <td className="text-right py-3 px-4">{piloto.atividades}</td>
                    <td className="text-right py-3 px-4">{piloto.hectares.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={cn(
                          'font-medium',
                          piloto.efetividade >= 90 ? 'text-emerald-600' : piloto.efetividade >= 80 ? 'text-yellow-600' : 'text-red-600'
                        )}
                      >
                        {piloto.efetividade}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Município</th>
                  <th className="text-left py-3 px-4 font-medium">Piloto</th>
                  <th className="text-left py-3 px-4 font-medium">Turno</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.detalhes.map((detalhe) => (
                  <tr key={detalhe.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      {format(new Date(detalhe.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4">{detalhe.municipio}</td>
                    <td className="py-3 px-4 font-medium">{detalhe.piloto}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{detalhe.turno}</Badge>
                    </td>
                    <td className="text-right py-3 px-4">{detalhe.hectares_mapeados}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={detalhe.status === 'Concluída' ? 'default' : 'destructive'}>
                        {detalhe.status}
                      </Badge>
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
