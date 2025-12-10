'use client';

import { ResponsiveContainer, Funnel, FunnelChart as RechartsFunnelChart, Tooltip, LabelList } from 'recharts';

interface FunnelDataPoint {
  name: string;
  value: number;
  fill: string;
}

interface FunnelChartProps {
  data: FunnelDataPoint[];
  height?: number;
}

export function FunnelChart({ data, height = 300 }: FunnelChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnelChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Total']}
        />
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive
        >
          <LabelList
            position="center"
            fill="#fff"
            stroke="none"
            dataKey="name"
            fontSize={12}
            fontWeight="bold"
          />
        </Funnel>
      </RechartsFunnelChart>
    </ResponsiveContainer>
  );
}
