'use client';

import { useState, useMemo } from 'react';
import {
  CloudSun,
  Droplets,
  Thermometer,
  Wind,
  Bug,
  TrendingUp,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { ChartWrapper } from '@/components/charts/chart-wrapper';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis,
  ReferenceLine,
} from 'recharts';

// Mock data for demonstration
const correlationData = [
  { semana: 'S1', temperatura: 28, precipitacao: 120, umidade: 85, criadouros: 245, risco: 'alto' },
  { semana: 'S2', temperatura: 29, precipitacao: 150, umidade: 88, criadouros: 312, risco: 'alto' },
  { semana: 'S3', temperatura: 30, precipitacao: 180, umidade: 90, criadouros: 398, risco: 'critico' },
  { semana: 'S4', temperatura: 28, precipitacao: 80, umidade: 75, criadouros: 267, risco: 'alto' },
  { semana: 'S5', temperatura: 27, precipitacao: 45, umidade: 68, criadouros: 189, risco: 'medio' },
  { semana: 'S6', temperatura: 25, precipitacao: 30, umidade: 62, criadouros: 145, risco: 'medio' },
  { semana: 'S7', temperatura: 24, precipitacao: 20, umidade: 58, criadouros: 98, risco: 'baixo' },
  { semana: 'S8', temperatura: 23, precipitacao: 15, umidade: 55, criadouros: 76, risco: 'baixo' },
  { semana: 'S9', temperatura: 25, precipitacao: 40, umidade: 65, criadouros: 112, risco: 'medio' },
  { semana: 'S10', temperatura: 27, precipitacao: 90, umidade: 78, criadouros: 198, risco: 'alto' },
  { semana: 'S11', temperatura: 29, precipitacao: 140, umidade: 85, criadouros: 287, risco: 'alto' },
  { semana: 'S12', temperatura: 30, precipitacao: 160, umidade: 88, criadouros: 356, risco: 'critico' },
];

const scatterData = correlationData.map((d, i) => ({
  x: d.precipitacao,
  y: d.criadouros,
  z: d.temperatura,
  name: d.semana,
}));

const riskPrediction = [
  { periodo: 'Próx. 7 dias', risco: 'alto', probabilidade: 78, fatores: ['Chuvas previstas', 'Temperatura elevada'] },
  { periodo: 'Próx. 14 dias', risco: 'critico', probabilidade: 85, fatores: ['Período chuvoso', 'Umidade alta'] },
  { periodo: 'Próx. 30 dias', risco: 'alto', probabilidade: 72, fatores: ['Estação chuvosa', 'Temperatura estável'] },
];

const correlationIndexes = [
  { fator: 'Precipitação', correlacao: 0.87, tipo: 'positiva', lag: '7 dias' },
  { fator: 'Temperatura', correlacao: 0.72, tipo: 'positiva', lag: '14 dias' },
  { fator: 'Umidade', correlacao: 0.65, tipo: 'positiva', lag: '10 dias' },
  { fator: 'Vento', correlacao: -0.34, tipo: 'negativa', lag: '3 dias' },
];

export default function CorrelacaoClimaticaPage() {
  const [selectedVariable, setSelectedVariable] = useState<'precipitacao' | 'temperatura' | 'umidade'>('precipitacao');
  const [lagDays, setLagDays] = useState<string>('7');

  const getRiskColor = (risco: string) => {
    switch (risco) {
      case 'critico': return 'bg-red-500';
      case 'alto': return 'bg-orange-500';
      case 'medio': return 'bg-yellow-500';
      case 'baixo': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskBadge = (risco: string) => {
    switch (risco) {
      case 'critico': return <Badge variant="destructive">Crítico</Badge>;
      case 'alto': return <Badge className="bg-orange-500">Alto</Badge>;
      case 'medio': return <Badge className="bg-yellow-500 text-black">Médio</Badge>;
      case 'baixo': return <Badge className="bg-green-500">Baixo</Badge>;
      default: return <Badge variant="secondary">{risco}</Badge>;
    }
  };

  const getCorrelationColor = (value: number) => {
    const abs = Math.abs(value);
    if (abs >= 0.7) return 'text-green-600';
    if (abs >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const variableConfig = {
    precipitacao: { label: 'Precipitação (mm)', color: '#3b82f6', icon: Droplets },
    temperatura: { label: 'Temperatura (°C)', color: '#ef4444', icon: Thermometer },
    umidade: { label: 'Umidade (%)', color: '#10b981', icon: Wind },
  };

  const SelectedIcon = variableConfig[selectedVariable].icon;

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {/* Filters */}
        <DashboardFilters />

        {/* Alert Banner */}
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="flex items-center gap-4 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-orange-800 dark:text-orange-200">
                Alerta de Risco Elevado
              </p>
              <p className="text-sm text-orange-600 dark:text-orange-300">
                Previsão de chuvas acima da média nos próximos 14 dias. Probabilidade de 85% de
                aumento significativo de criadouros.
              </p>
            </div>
            <Button variant="outline" className="border-orange-500 text-orange-700">
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>

        {/* KPIs Row */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Droplets className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Precipitação Média</p>
                <p className="text-2xl font-bold">127mm</p>
                <p className="text-xs text-green-600">+23% vs. média histórica</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <Thermometer className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Temperatura Média</p>
                <p className="text-2xl font-bold">27.5°C</p>
                <p className="text-xs text-orange-600">+1.2°C vs. média histórica</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Correlação Principal</p>
                <p className="text-2xl font-bold">0.87</p>
                <p className="text-xs text-muted-foreground">Precipitação → Criadouros</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900">
                <Bug className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Criadouros Projetados</p>
                <p className="text-2xl font-bold">+34%</p>
                <p className="text-xs text-red-600">Próximas 2 semanas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Dual Axis Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CloudSun className="h-5 w-5" />
                    Evolução Clima x Criadouros
                  </CardTitle>
                  <CardDescription>
                    Correlação temporal entre fatores climáticos e identificação de criadouros
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={selectedVariable} onValueChange={(v) => setSelectedVariable(v as typeof selectedVariable)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="precipitacao">
                        <span className="flex items-center gap-2">
                          <Droplets className="h-4 w-4" />
                          Precipitação
                        </span>
                      </SelectItem>
                      <SelectItem value="temperatura">
                        <span className="flex items-center gap-2">
                          <Thermometer className="h-4 w-4" />
                          Temperatura
                        </span>
                      </SelectItem>
                      <SelectItem value="umidade">
                        <span className="flex items-center gap-2">
                          <Wind className="h-4 w-4" />
                          Umidade
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={lagDays} onValueChange={setLagDays}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Sem lag</SelectItem>
                      <SelectItem value="7">Lag 7 dias</SelectItem>
                      <SelectItem value="14">Lag 14 dias</SelectItem>
                      <SelectItem value="21">Lag 21 dias</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartWrapper>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={correlationData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="semana" className="text-xs" />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      className="text-xs"
                      label={{
                        value: variableConfig[selectedVariable].label,
                        angle: -90,
                        position: 'insideLeft',
                        style: { textAnchor: 'middle', fontSize: 12 },
                      }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      className="text-xs"
                      label={{
                        value: 'Criadouros',
                        angle: 90,
                        position: 'insideRight',
                        style: { textAnchor: 'middle', fontSize: 12 },
                      }}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                    <Bar
                      yAxisId="left"
                      dataKey={selectedVariable}
                      fill={variableConfig[selectedVariable].color}
                      opacity={0.7}
                      name={variableConfig[selectedVariable].label}
                      radius={[4, 4, 0, 0]}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="criadouros"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      name="Criadouros"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </ChartWrapper>
            </CardContent>
          </Card>

          {/* Scatter Plot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Scatter Plot de Correlação
              </CardTitle>
              <CardDescription>
                Relação entre precipitação e criadouros (tamanho = temperatura)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartWrapper>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      type="number"
                      dataKey="x"
                      name="Precipitação"
                      unit="mm"
                      className="text-xs"
                    />
                    <YAxis
                      type="number"
                      dataKey="y"
                      name="Criadouros"
                      className="text-xs"
                    />
                    <ZAxis
                      type="number"
                      dataKey="z"
                      range={[50, 400]}
                      name="Temperatura"
                    />
                    <RechartsTooltip
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                      formatter={(value, name) => {
                        if (name === 'Precipitação') return [`${value}mm`, name];
                        if (name === 'Temperatura') return [`${value}°C`, name];
                        return [value, name];
                      }}
                    />
                    <Scatter
                      name="Correlação"
                      data={scatterData}
                      fill="#8b5cf6"
                    />
                    <ReferenceLine
                      stroke="#ef4444"
                      strokeDasharray="3 3"
                      segment={[{ x: 0, y: 50 }, { x: 200, y: 400 }]}
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </ChartWrapper>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span>R² = 0.76</span>
                <span>|</span>
                <span>p-value &lt; 0.001</span>
              </div>
            </CardContent>
          </Card>

          {/* Correlation Indexes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Índices de Correlação
              </CardTitle>
              <CardDescription>
                Análise de lag entre fatores climáticos e criadouros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {correlationIndexes.map((index) => (
                  <div
                    key={index.fator}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          index.tipo === 'positiva' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <div>
                        <p className="font-medium">{index.fator}</p>
                        <p className="text-xs text-muted-foreground">Lag: {index.lag}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getCorrelationColor(index.correlacao)}`}>
                        {index.correlacao > 0 ? '+' : ''}{index.correlacao.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Correlação {index.tipo}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Risk Prediction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Previsão de Risco
            </CardTitle>
            <CardDescription>
              Projeção de risco baseada em dados climáticos e correlações históricas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {riskPrediction.map((pred) => (
                <div
                  key={pred.periodo}
                  className="rounded-lg border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{pred.periodo}</span>
                    {getRiskBadge(pred.risco)}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Probabilidade</span>
                      <span className="font-medium">{pred.probabilidade}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full ${getRiskColor(pred.risco)} transition-all`}
                        style={{ width: `${pred.probabilidade}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Fatores:</p>
                    <div className="flex flex-wrap gap-1">
                      {pred.fatores.map((fator) => (
                        <Badge key={fator} variant="outline" className="text-xs">
                          {fator}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Methodology Info */}
        <Card className="border-dashed">
          <CardContent className="flex items-start gap-4 py-4">
            <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Metodologia</p>
              <p>
                As análises de correlação utilizam dados históricos de criadouros identificados
                em campo e dados meteorológicos do INMET. O modelo preditivo considera um lag
                temporal de 7-14 dias entre eventos de precipitação e aumento de criadouros,
                baseado em estudos epidemiológicos sobre o ciclo de vida do Aedes aegypti.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
