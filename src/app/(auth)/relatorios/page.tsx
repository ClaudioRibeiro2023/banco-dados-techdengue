'use client';

import { useState } from 'react';
import { FileText, Download, Building2, Calendar, FileCheck, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';

interface TipoRelatorio {
  id: string;
  titulo: string;
  descricao: string;
  icon: React.ElementType;
  href: string;
  secoes: string[];
  formatos: string[];
}

const tiposRelatorio: TipoRelatorio[] = [
  {
    id: 'municipal',
    titulo: 'Relatório Municipal',
    descricao: 'Dados completos de um município: hectares, criadouros, devolutivas e atividades.',
    icon: Building2,
    href: '/relatorios/municipal',
    secoes: ['Resumo Geral', 'Criadouros por Tipo', 'Status de Devolutivas', 'Histórico de Atividades'],
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 'atividades',
    titulo: 'Relatório de Atividades',
    descricao: 'Detalhamento de todas as atividades realizadas no período selecionado.',
    icon: Calendar,
    href: '/relatorios/atividades',
    secoes: ['Resumo de Atividades', 'Performance por Piloto', 'Distribuição por Município', 'Lista Detalhada'],
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 'devolutivas',
    titulo: 'Relatório de Devolutivas',
    descricao: 'Análise do status e tempo de resposta das devolutivas de criadouros.',
    icon: FileCheck,
    href: '/relatorios/devolutivas',
    secoes: ['Status Geral', 'Por Tipo de Criadouro', 'Por Município', 'Tempo de Resposta'],
    formatos: ['PDF', 'Excel'],
  },
  {
    id: 'executivo',
    titulo: 'Relatório Executivo',
    descricao: 'Visão consolidada com KPIs, ranking de municípios e análise de tendências.',
    icon: BarChart3,
    href: '/relatorios/executivo',
    secoes: ['KPIs Principais', 'Ranking de Municípios', 'Tendências', 'Recomendações'],
    formatos: ['PDF'],
  },
];

export default function RelatoriosPage() {
  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* Introdução */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle>Gerador de Relatórios</CardTitle>
              <CardDescription>
                Selecione o tipo de relatório desejado e configure os parâmetros para gerar
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Os relatórios são gerados com base nos filtros selecionados acima.
            Você pode exportar em formato PDF ou Excel, dependendo do tipo de relatório.
          </p>
        </CardContent>
      </Card>

      {/* Tipos de Relatório */}
      <div className="grid gap-4 md:grid-cols-2">
        {tiposRelatorio.map((tipo) => {
          const Icon = tipo.icon;

          return (
            <Card key={tipo.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{tipo.titulo}</CardTitle>
                      <CardDescription className="text-sm mt-1">
                        {tipo.descricao}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Seções */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Seções incluídas:</p>
                  <div className="flex flex-wrap gap-1">
                    {tipo.secoes.map((secao) => (
                      <Badge key={secao} variant="secondary" className="text-xs">
                        {secao}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Formatos e Ação */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Formatos:</span>
                    {tipo.formatos.map((formato) => (
                      <Badge key={formato} variant="outline" className="text-xs">
                        {formato}
                      </Badge>
                    ))}
                  </div>
                  <Link href={tipo.href}>
                    <Button size="sm">
                      Gerar
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Histórico de Relatórios</CardTitle>
          <CardDescription>Últimos relatórios gerados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Nenhum relatório gerado ainda</p>
            <p className="text-sm">Os relatórios gerados aparecerão aqui para download rápido</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
