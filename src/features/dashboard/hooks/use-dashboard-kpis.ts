'use client';

import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '@/stores/filter.store';
import { dadosGerenciaisService } from '@/lib/services';
import { format } from 'date-fns';

export function useDashboardKPIs() {
  const { municipioId } = useFilterStore();

  // Parâmetros compatíveis com nova API v2.0
  const params = {
    municipio: municipioId || undefined,
  };

  return useQuery({
    queryKey: ['dashboard', 'kpis', params],
    queryFn: () => dadosGerenciaisService.getResumo(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: true,
  });
}

export function useHectaresMapeados() {
  const { municipioId } = useFilterStore();

  // Parâmetros compatíveis com nova API v2.0
  const params = {
    municipio: municipioId || undefined,
  };

  return useQuery({
    queryKey: ['dashboard', 'hectares-mapeados', params],
    queryFn: () => dadosGerenciaisService.getHectaresMapeados(params),
    staleTime: 5 * 60 * 1000,
  });
}

// Função auxiliar para calcular tendência
export function calculateTrend(current: number, previous: number): { value: number; direction: 'up' | 'down' | 'stable' } {
  if (previous === 0) return { value: 0, direction: 'stable' };

  const percentChange = ((current - previous) / previous) * 100;

  if (percentChange > 1) return { value: Math.round(percentChange), direction: 'up' };
  if (percentChange < -1) return { value: Math.round(Math.abs(percentChange)), direction: 'down' };
  return { value: 0, direction: 'stable' };
}
