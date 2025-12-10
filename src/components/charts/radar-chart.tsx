'use client';

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface RadarChartProps {
  data: Record<string, unknown>[];
  dataKeys: { key: string; name: string; color: string }[];
  angleAxisKey: string;
  height?: number;
}

export function RadarChart({
  data,
  dataKeys,
  angleAxisKey,
  height = 350,
}: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
        <PolarGrid className="stroke-muted" />
        <PolarAngleAxis
          dataKey={angleAxisKey}
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <PolarRadiusAxis
          angle={30}
          domain={[0, 'auto']}
          tick={{ fontSize: 10 }}
          className="text-muted-foreground"
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
          formatter={(value) => (
            <span className="text-sm text-muted-foreground">{value}</span>
          )}
        />
        {dataKeys.map((item) => (
          <Radar
            key={item.key}
            name={item.name}
            dataKey={item.key}
            stroke={item.color}
            fill={item.color}
            fillOpacity={0.2}
          />
        ))}
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
