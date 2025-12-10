'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface EvolutionDataPoint {
  date: string;
  hectares?: number;
  atividades?: number;
  pois?: number;
}

interface EvolutionChartProps {
  data: EvolutionDataPoint[];
  dataKey: 'hectares' | 'atividades' | 'pois';
  color?: string;
  height?: number;
}

const colorMap = {
  hectares: '#10b981',
  atividades: '#3b82f6',
  pois: '#f59e0b',
};

const labelMap = {
  hectares: 'Hectares',
  atividades: 'Atividades',
  pois: 'POIs',
};

export function EvolutionChart({
  data,
  dataKey,
  color,
  height = 300,
}: EvolutionChartProps) {
  const chartColor = color || colorMap[dataKey];
  const label = labelMap[dataKey];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 12 }}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground"
          tickFormatter={(value) => value.toLocaleString('pt-BR')}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          labelStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: number) => [value.toLocaleString('pt-BR'), label]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={chartColor}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
