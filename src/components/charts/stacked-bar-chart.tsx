'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface StackedBarChartProps {
  data: Record<string, unknown>[];
  categories: { key: string; name: string; color: string }[];
  xAxisKey: string;
  height?: number;
}

export function StackedBarChart({
  data,
  categories,
  xAxisKey,
  height = 300,
}: StackedBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey={xAxisKey}
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
          formatter={(value: number) => value.toLocaleString('pt-BR')}
        />
        <Legend
          formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
        />
        {categories.map((category) => (
          <Bar
            key={category.key}
            dataKey={category.key}
            name={category.name}
            stackId="a"
            fill={category.color}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
