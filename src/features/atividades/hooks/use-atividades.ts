'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  atividadesService,
  AtividadesParams,
  AtividadeCreateData,
  AtividadeUpdateData,
} from '@/lib/services/atividades.service';
import { useFilterStore } from '@/stores/filter.store';
import type { Atividade } from '@/types/api.types';

export function useAtividades(additionalParams?: AtividadesParams) {
  const { dateRange, municipioId, contratoId } = useFilterStore();

  const params = useMemo(
    () => ({
      municipio_id: municipioId || undefined,
      contrato_id: contratoId || undefined,
      data_inicio: dateRange.from?.toISOString().split('T')[0],
      data_fim: dateRange.to?.toISOString().split('T')[0],
      ...additionalParams,
    }),
    [dateRange, municipioId, contratoId, additionalParams]
  );

  return useQuery({
    queryKey: ['atividades', params],
    queryFn: () => atividadesService.getAtividades(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useAtividadeById(id: string) {
  return useQuery({
    queryKey: ['atividade', id],
    queryFn: () => atividadesService.getAtividadeById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAtividadesResumo() {
  const { dateRange, municipioId, contratoId } = useFilterStore();

  const params = useMemo(
    () => ({
      municipio_id: municipioId || undefined,
      contrato_id: contratoId || undefined,
      data_inicio: dateRange.from?.toISOString().split('T')[0],
      data_fim: dateRange.to?.toISOString().split('T')[0],
    }),
    [dateRange, municipioId, contratoId]
  );

  return useQuery({
    queryKey: ['atividades', 'resumo', params],
    queryFn: () => atividadesService.getResumo(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePerformancePilotos() {
  const { dateRange, municipioId, contratoId } = useFilterStore();

  const params = useMemo(
    () => ({
      municipio_id: municipioId || undefined,
      contrato_id: contratoId || undefined,
      data_inicio: dateRange.from?.toISOString().split('T')[0],
      data_fim: dateRange.to?.toISOString().split('T')[0],
    }),
    [dateRange, municipioId, contratoId]
  );

  return useQuery({
    queryKey: ['atividades', 'performance-pilotos', params],
    queryFn: () => atividadesService.getPerformancePilotos(params),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAtividade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AtividadeCreateData) => atividadesService.createAtividade(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
    },
  });
}

export function useUpdateAtividade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AtividadeUpdateData) => atividadesService.updateAtividade(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
      queryClient.invalidateQueries({ queryKey: ['atividade', variables.id] });
    },
  });
}

export function useDeleteAtividade() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => atividadesService.deleteAtividade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['atividades'] });
    },
  });
}
