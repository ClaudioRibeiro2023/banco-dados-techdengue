'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FileText, Download, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, BarChart, DistributionChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { useRelatorioData } from '@/features/relatorios/hooks/use-relatorios';
import { createPDFReport } from '@/lib/utils/export-pdf';
import { exportToExcel } from '@/lib/utils/export-excel';
import type { RelatorioMunicipal } from '@/lib/services/relatorios.service';

export default function RelatorioMunicipalPage() {
  const { data, isLoading, isGenerating, setIsGenerating, periodoFormatado } =
    useRelatorioData('municipal');
  const relatorio = data as RelatorioMunicipal;

  const handleExportPDF = async () => {
    setIsGenerating(true);
    try {
      const pdf = createPDFReport({
        title: 'Relatório Municipal',
        subtitle: relatorio.municipio.nome,
        periodo: relatorio.periodo,
      });

      pdf.addKPIs([
        { label: 'Hectares Mapeados', value: relatorio.resumo.hectares_mapeados.toLocaleString('pt-BR') },
        { label: 'Hectares Efetivos', value: relatorio.resumo.hectares_efetivos.toLocaleString('pt-BR') },
        { label: 'Criadouros', value: relatorio.resumo.total_criadouros.toLocaleString('pt-BR') },
        { label: 'Taxa Efetividade', value: relatorio.resumo.taxa_efetividade, suffix: '%' },
      ]);

      pdf.addTable({
        title: 'Criadouros por Tipo',
        columns: [
          { header: 'Tipo', dataKey: 'tipo' },
          { header: 'Quantidade', dataKey: 'quantidade' },
          { header: 'Percentual', dataKey: 'percentual' },
        ],
        rows: relatorio.criadouros_por_tipo.map(c => ({
          ...c,
          percentual: `${c.percentual}%`,
        })),
      });

      pdf.addTable({
        title: 'Devolutivas por Status',
        columns: [
          { header: 'Status', dataKey: 'status' },
          { header: 'Quantidade', dataKey: 'quantidade' },
          { header: 'Percentual', dataKey: 'percentual' },
        ],
        rows: relatorio.devolutivas_por_status.map(d => ({
          ...d,
          percentual: `${d.percentual}%`,
        })),
      });

      pdf.addTable({
        title: 'Últimas Atividades',
        columns: [
          { header: 'Data', dataKey: 'data' },
          { header: 'Piloto', dataKey: 'piloto' },
          { header: 'Turno', dataKey: 'turno' },
          { header: 'Hectares', dataKey: 'hectares' },
          { header: 'Status', dataKey: 'status' },
        ],
        rows: relatorio.atividades.map(a => ({
          ...a,
          data: format(new Date(a.data), 'dd/MM/yyyy', { locale: ptBR }),
        })),
      });

      pdf.save(`relatorio-municipal-${relatorio.municipio.nome.toLowerCase().replace(/\s/g, '-')}.pdf`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportExcel = () => {
    setIsGenerating(true);
    try {
      exportToExcel({
        filename: `relatorio-municipal-${relatorio.municipio.nome.toLowerCase().replace(/\s/g, '-')}`,
        sheets: [
          {
            name: 'Resumo',
            data: [
              { Indicador: 'Hectares Mapeados', Valor: relatorio.resumo.hectares_mapeados },
              { Indicador: 'Hectares Efetivos', Valor: relatorio.resumo.hectares_efetivos },
              { Indicador: 'Total Criadouros', Valor: relatorio.resumo.total_criadouros },
              { Indicador: 'Total Devolutivas', Valor: relatorio.resumo.total_devolutivas },
              { Indicador: 'Taxa Efetividade (%)', Valor: relatorio.resumo.taxa_efetividade },
              { Indicador: 'Taxa Devolutivas (%)', Valor: relatorio.resumo.taxa_devolutivas },
            ],
          },
          {
            name: 'Criadouros por Tipo',
            data: relatorio.criadouros_por_tipo,
            columns: [
              { header: 'Tipo', key: 'tipo', width: 20 },
              { header: 'Quantidade', key: 'quantidade', width: 15 },
              { header: 'Percentual (%)', key: 'percentual', width: 15 },
            ],
          },
          {
            name: 'Devolutivas por Status',
            data: relatorio.devolutivas_por_status,
            columns: [
              { header: 'Status', key: 'status', width: 20 },
              { header: 'Quantidade', key: 'quantidade', width: 15 },
              { header: 'Percentual (%)', key: 'percentual', width: 15 },
            ],
          },
          {
            name: 'Atividades',
            data: relatorio.atividades.map(a => ({
              ...a,
              data: format(new Date(a.data), 'dd/MM/yyyy', { locale: ptBR }),
            })),
            columns: [
              { header: 'Data', key: 'data', width: 12 },
              { header: 'Piloto', key: 'piloto', width: 20 },
              { header: 'Turno', key: 'turno', width: 10 },
              { header: 'Hectares', key: 'hectares', width: 12 },
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
  const criadourosChartData = relatorio.criadouros_por_tipo.map(c => ({
    name: c.tipo,
    value: c.quantidade,
  }));

  const devolutivasChartData = relatorio.devolutivas_por_status.map(d => ({
    name: d.status,
    value: d.quantidade,
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
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>{relatorio.municipio.nome}</CardTitle>
              <CardDescription>
                IBGE: {relatorio.municipio.cod_ibge} | Período: {periodoFormatado}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Hectares Mapeados"
          value={relatorio.resumo.hectares_mapeados.toLocaleString('pt-BR')}
          description="Total no período"
          icon={Building2}
          loading={isLoading}
        />
        <KPICard
          title="Hectares Efetivos"
          value={relatorio.resumo.hectares_efetivos.toLocaleString('pt-BR')}
          description={`${relatorio.resumo.taxa_efetividade}% de efetividade`}
          icon={Building2}
          loading={isLoading}
          variant="success"
        />
        <KPICard
          title="Criadouros"
          value={relatorio.resumo.total_criadouros.toLocaleString('pt-BR')}
          description="Identificados"
          icon={Building2}
          loading={isLoading}
        />
        <KPICard
          title="Taxa Devolutivas"
          value={`${relatorio.resumo.taxa_devolutivas}%`}
          description={`${relatorio.resumo.total_devolutivas} devolutivas`}
          icon={Building2}
          loading={isLoading}
          variant={relatorio.resumo.taxa_devolutivas >= 80 ? 'success' : 'warning'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Criadouros por Tipo"
          description="Distribuição dos criadouros identificados"
          loading={isLoading}
        >
          <DistributionChart data={criadourosChartData} height={300} />
        </ChartWrapper>

        <ChartWrapper
          title="Devolutivas por Status"
          description="Status atual das devolutivas"
          loading={isLoading}
        >
          <BarChart data={devolutivasChartData} height={300} color="#3b82f6" />
        </ChartWrapper>
      </div>

      {/* Tabela de Criadouros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalhamento por Tipo de Criadouro</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatorio.criadouros_por_tipo.map((criadouro) => (
              <div key={criadouro.tipo} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{criadouro.tipo}</span>
                    <span className="text-sm text-muted-foreground">
                      {criadouro.quantidade.toLocaleString('pt-BR')} ({criadouro.percentual}%)
                    </span>
                  </div>
                  <Progress value={criadouro.percentual} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Atividades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Data</th>
                  <th className="text-left py-3 px-4 font-medium">Piloto</th>
                  <th className="text-left py-3 px-4 font-medium">Turno</th>
                  <th className="text-right py-3 px-4 font-medium">Hectares</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.atividades.map((atividade, index) => (
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      {format(new Date(atividade.data), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="py-3 px-4 font-medium">{atividade.piloto}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline">{atividade.turno}</Badge>
                    </td>
                    <td className="text-right py-3 px-4">{atividade.hectares}</td>
                    <td className="text-center py-3 px-4">
                      <Badge variant={atividade.status === 'Concluída' ? 'default' : 'secondary'}>
                        {atividade.status}
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
