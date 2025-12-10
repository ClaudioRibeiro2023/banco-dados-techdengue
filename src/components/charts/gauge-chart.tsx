'use client';

import { cn } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  max?: number;
  label?: string;
  size?: number;
  className?: string;
}

export function GaugeChart({
  value,
  max = 100,
  label = '%',
  size = 180,
  className,
}: GaugeChartProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 70; // radius = 70
  const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.75; // 270 degrees = 0.75

  // Determine color based on percentage
  const getColor = (pct: number) => {
    if (pct >= 80) return '#10b981'; // green
    if (pct >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  };

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size * 0.6}
        viewBox="0 0 180 120"
        className="transform -rotate-0"
      >
        {/* Background arc */}
        <path
          d="M 20 100 A 70 70 0 0 1 160 100"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d="M 20 100 A 70 70 0 0 1 160 100"
          fill="none"
          stroke={getColor(percentage)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(percentage / 100) * 220} 220`}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
        <span className="text-3xl font-bold">{value}</span>
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
