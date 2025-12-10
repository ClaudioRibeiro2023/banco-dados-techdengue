'use client';

import { type LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TrendInfo {
  value: number;
  direction: 'up' | 'down' | 'stable';
  isPositive?: boolean; // Se "up" é bom ou ruim
}

interface KPICardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: TrendInfo;
  loading?: boolean;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: '',
  success: 'border-l-4 border-l-emerald-500',
  warning: 'border-l-4 border-l-yellow-500',
  danger: 'border-l-4 border-l-red-500',
};

export function KPICard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  className,
  variant = 'default',
}: KPICardProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-2 h-3 w-28" />
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />;
      case 'down':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';

    const isGood =
      trend.isPositive !== undefined
        ? trend.isPositive
        : trend.direction === 'up';

    if (trend.direction === 'stable') return 'text-muted-foreground';
    return isGood ? 'text-green-600' : 'text-red-600';
  };

  return (
    <Card className={cn('transition-shadow hover:shadow-md', variantStyles[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center gap-2 mt-1">
          {trend && (
            <span className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Versão com sparkline (placeholder para futura implementação)
export function KPICardWithSparkline({
  title,
  value,
  description,
  icon: Icon,
  trend,
  loading,
  sparklineData,
  className,
}: KPICardProps & { sparklineData?: number[] }) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="mt-2 h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('transition-shadow hover:shadow-md', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {/* Placeholder para sparkline */}
        {sparklineData && (
          <div className="mt-2 h-12 w-full rounded bg-muted/50 flex items-end gap-0.5 p-1">
            {sparklineData.map((val, i) => (
              <div
                key={i}
                className="flex-1 bg-primary/60 rounded-t"
                style={{ height: `${(val / Math.max(...sparklineData)) * 100}%` }}
              />
            ))}
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
