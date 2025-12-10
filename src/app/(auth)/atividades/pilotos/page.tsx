'use client';

import { Users, TrendingUp, Award, MapPin, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { KPICard } from '@/components/data-display/kpi-card';
import { ChartWrapper, BarChart } from '@/components/charts';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { cn } from '@/lib/utils';

interface Piloto {
  id: string;
  nome: string;
  email: string;
  totalAtividades: number;
  hectaresMapeados: number;
  hectaresEfetivos: number;
  taxaEfetividade: number;
  mediaHectaresDia: number;
  status: 'ativo' | 'inativo';
}

// Mock data
const mockPilotos: Piloto[] = [
  {
    id: '1',
    nome: 'João Silva',
    email: 'joao.silva@techdengue.com',
    totalAtividades: 45,
    hectaresMapeados: 12500,
    hectaresEfetivos: 11250,
    taxaEfetividade: 90,
    mediaHectaresDia: 280,
    status: 'ativo',
  },
  {
    id: '2',
    nome: 'Maria Santos',
    email: 'maria.santos@techdengue.com',
    totalAtividades: 38,
    hectaresMapeados: 10200,
    hectaresEfetivos: 9180,
    taxaEfetividade: 90,
    mediaHectaresDia: 268,
    status: 'ativo',
  },
  {
    id: '3',
    nome: 'Carlos Oliveira',
    email: 'carlos.oliveira@techdengue.com',
    totalAtividades: 42,
    hectaresMapeados: 11800,
    hectaresEfetivos: 10030,
    taxaEfetividade: 85,
    mediaHectaresDia: 281,
    status: 'ativo',
  },
  {
    id: '4',
    nome: 'Ana Costa',
    email: 'ana.costa@techdengue.com',
    totalAtividades: 30,
    hectaresMapeados: 8100,
    hectaresEfetivos: 7695,
    taxaEfetividade: 95,
    mediaHectaresDia: 270,
    status: 'ativo',
  },
  {
    id: '5',
    nome: 'Pedro Lima',
    email: 'pedro.lima@techdengue.com',
    totalAtividades: 25,
    hectaresMapeados: 6500,
    hectaresEfetivos: 5525,
    taxaEfetividade: 85,
    mediaHectaresDia: 260,
    status: 'inativo',
  },
];

export default function PilotosPage() {
  const totalPilotos = mockPilotos.length;
  const pilotosAtivos = mockPilotos.filter((p) => p.status === 'ativo').length;
  const mediaEfetividade =
    mockPilotos.reduce((sum, p) => sum + p.taxaEfetividade, 0) / totalPilotos;
  const liderHectares = mockPilotos.reduce(
    (max, p) => (p.hectaresMapeados > max.hectaresMapeados ? p : max),
    mockPilotos[0]
  );

  // Chart data
  const hectaresChartData = mockPilotos
    .sort((a, b) => b.hectaresMapeados - a.hectaresMapeados)
    .map((p) => ({
      name: p.nome.split(' ')[0],
      value: p.hectaresMapeados,
    }));

  const efetividadeChartData = mockPilotos
    .sort((a, b) => b.taxaEfetividade - a.taxaEfetividade)
    .map((p) => ({
      name: p.nome.split(' ')[0],
      value: p.taxaEfetividade,
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
          title="Total de Pilotos"
          value={totalPilotos.toString()}
          description={`${pilotosAtivos} ativos`}
          icon={Users}
        />
        <KPICard
          title="Média Efetividade"
          value={`${Math.round(mediaEfetividade)}%`}
          description="Entre todos pilotos"
          icon={TrendingUp}
          variant={mediaEfetividade >= 90 ? 'success' : mediaEfetividade >= 80 ? 'warning' : 'danger'}
        />
        <KPICard
          title="Líder em Hectares"
          value={liderHectares.nome.split(' ')[0]}
          description={`${liderHectares.hectaresMapeados.toLocaleString('pt-BR')} ha`}
          icon={Award}
        />
        <KPICard
          title="Total Mapeado"
          value={mockPilotos
            .reduce((sum, p) => sum + p.hectaresMapeados, 0)
            .toLocaleString('pt-BR')}
          description="Hectares no período"
          icon={MapPin}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartWrapper
          title="Hectares por Piloto"
          description="Total mapeado no período"
        >
          <BarChart data={hectaresChartData} height={300} color="#3b82f6" />
        </ChartWrapper>
        <ChartWrapper
          title="Taxa de Efetividade"
          description="Percentual por piloto"
        >
          <BarChart data={efetividadeChartData} height={300} color="#10b981" />
        </ChartWrapper>
      </div>

      {/* Lista de Pilotos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pilotos Cadastrados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockPilotos.map((piloto, index) => (
              <Card key={piloto.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {piloto.nome
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium truncate">{piloto.nome}</h3>
                        {index === 0 && (
                          <Award className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {piloto.email}
                      </p>
                      <Badge
                        variant={piloto.status === 'ativo' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {piloto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Atividades</p>
                        <p className="font-medium">{piloto.totalAtividades}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Hectares</p>
                        <p className="font-medium">
                          {piloto.hectaresMapeados.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Efetividade</p>
                        <p
                          className={cn(
                            'font-medium',
                            piloto.taxaEfetividade >= 90
                              ? 'text-emerald-600'
                              : piloto.taxaEfetividade >= 80
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          )}
                        >
                          {piloto.taxaEfetividade}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-muted-foreground">Média/Dia</p>
                        <p className="font-medium">{piloto.mediaHectaresDia} ha</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
