'use client';

import { ResponsiveContainer, Treemap, Tooltip } from 'recharts';

interface TreemapDataPoint {
  name: string;
  value: number;
  fill?: string;
  [key: string]: string | number | undefined;
}

interface TreemapChartProps {
  data: TreemapDataPoint[];
  height?: number;
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  value?: number;
  fill?: string;
  index?: number;
}

function CustomContent({ x = 0, y = 0, width = 0, height = 0, name, value, fill, index = 0 }: CustomContentProps) {
  if (width < 50 || height < 30) return null;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill || COLORS[index % COLORS.length]}
        stroke="#fff"
        strokeWidth={2}
        rx={4}
      />
      {width > 60 && height > 40 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 8}
            textAnchor="middle"
            fill="#fff"
            fontSize={12}
            fontWeight="bold"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 10}
            textAnchor="middle"
            fill="#fff"
            fontSize={11}
            opacity={0.9}
          >
            {value?.toLocaleString('pt-BR')}
          </text>
        </>
      )}
    </g>
  );
}

export function TreemapChart({ data, height = 300 }: TreemapChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={data}
        dataKey="value"
        nameKey="name"
        aspectRatio={4 / 3}
        stroke="#fff"
        content={<CustomContent />}
      >
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '6px',
          }}
          formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Total']}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
