'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface DashboardSkeletonProps {
  className?: string;
}

/**
 * Skeleton para KPI Cards - Loading state mais rico
 */
export function KPICardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-8 w-24" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
      {/* Barra de progresso animada no fundo */}
      <div className="h-1 w-full bg-muted">
        <div className="h-full w-1/3 animate-pulse bg-primary/30" />
      </div>
    </Card>
  );
}

/**
 * Skeleton para Grid de KPIs
 */
export function KPIGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton para gráficos com barras animadas
 */
export function ChartSkeleton({ className, type = 'bar' }: DashboardSkeletonProps & { type?: 'bar' | 'pie' | 'line' }) {
  if (type === 'pie') {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56 mt-1" />
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center">
            <div className="relative">
              {/* Círculo externo */}
              <Skeleton className="h-48 w-48 rounded-full" />
              {/* Círculo interno (donut) */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-24 w-24 rounded-full bg-background" />
              </div>
            </div>
            {/* Legenda */}
            <div className="ml-8 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Alturas fixas para as barras (evita Math.random impuro)
  const barHeights = [35, 55, 75, 45, 85, 60, 90, 50, 70, 40];

  // Tipo bar ou line
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-56 mt-1" />
          </div>
          <Skeleton className="h-6 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-[300px] items-end gap-2 pt-4">
          {/* Eixo Y */}
          <div className="flex h-full flex-col justify-between pr-2 text-right">
            {[100, 75, 50, 25, 0].map((v) => (
              <Skeleton key={v} className="h-3 w-8" />
            ))}
          </div>
          {/* Barras animadas */}
          {barHeights.map((height, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end">
              <Skeleton
                className="w-full rounded-t animate-pulse"
                style={{
                  height: `${height}%`,
                  animationDelay: `${i * 100}ms`,
                }}
              />
              <Skeleton className="h-3 w-full mt-2" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Posições fixas para os pontos do mapa (evita Math.random impuro)
const mapPoints = [
  { left: 15, top: 20 }, { left: 45, top: 35 }, { left: 75, top: 25 },
  { left: 25, top: 55 }, { left: 55, top: 45 }, { left: 85, top: 60 },
  { left: 35, top: 75 }, { left: 65, top: 70 }, { left: 20, top: 40 },
  { left: 50, top: 80 }, { left: 80, top: 45 }, { left: 30, top: 30 },
  { left: 60, top: 55 }, { left: 40, top: 65 }, { left: 70, top: 85 },
];

/**
 * Skeleton para mapa
 */
export function MapSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent>
        <div className="relative h-[400px] w-full overflow-hidden rounded-lg bg-muted">
          {/* Linhas de grid simulando mapa */}
          <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 gap-px opacity-20">
            {Array.from({ length: 48 }).map((_, i) => (
              <div key={i} className="bg-foreground/10" />
            ))}
          </div>
          {/* Pontos simulando POIs */}
          <div className="absolute inset-0">
            {mapPoints.map((pos, i) => (
              <Skeleton
                key={i}
                className="absolute h-3 w-3 rounded-full animate-pulse"
                style={{
                  left: `${pos.left}%`,
                  top: `${pos.top}%`,
                  animationDelay: `${i * 150}ms`,
                }}
              />
            ))}
          </div>
          {/* Texto central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-2">
              <Skeleton className="h-10 w-10 rounded-full mx-auto" />
              <Skeleton className="h-4 w-32 mx-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Skeleton completo do Dashboard
 */
export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* KPIs */}
      <KPIGridSkeleton count={4} />

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <ChartSkeleton type="bar" />
        <ChartSkeleton type="pie" />
      </div>

      {/* Map */}
      <MapSkeleton />
    </div>
  );
}
