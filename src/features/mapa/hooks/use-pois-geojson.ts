'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { bancoTechdengueService } from '@/lib/services/banco-techdengue.service';
import { useFilterStore } from '@/stores/filter.store';
import { useMapStore } from '@/stores/map.store';
import type { BancoTechdengue } from '@/types/api.types';

// Cores por tipo de criadouro
export const CRIADOURO_COLORS: Record<string, string> = {
  pneu: '#10b981',
  caixa_dagua: '#3b82f6',
  calha: '#f59e0b',
  piscina: '#ef4444',
  lixo: '#8b5cf6',
  outros: '#6b7280',
};

// Cores por status de devolutiva
export const DEVOLUTIVA_COLORS: Record<string, string> = {
  pendente: '#f59e0b',
  em_analise: '#3b82f6',
  tratado: '#10b981',
  descartado: '#6b7280',
};

interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    id: string;
    tipo_criadouro: string;
    status_devolutiva: string;
    data_identificacao: string;
    color: string;
    [key: string]: string | number | boolean;
  };
}

interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

function convertToGeoJSON(pois: BancoTechdengue[]): GeoJSONCollection {
  return {
    type: 'FeatureCollection',
    features: pois.map((poi) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [poi.longitude, poi.latitude],
      },
      properties: {
        id: poi.id,
        tipo_criadouro: poi.tipo_criadouro,
        status_devolutiva: poi.status_devolutiva,
        data_identificacao: poi.data_identificacao,
        color: CRIADOURO_COLORS[poi.tipo_criadouro] || CRIADOURO_COLORS.outros,
        atividade_id: poi.atividade_id || '',
        observacoes: poi.observacoes || '',
        foto_url: poi.foto_url || '',
      },
    })),
  };
}

export function usePOIsGeoJSON() {
  const { municipioId, contratoId, dateRange } = useFilterStore();
  const { filters } = useMapStore();

  // Parâmetros compatíveis com nova API v2.0
  const params = useMemo(
    () => ({
      q: municipioId || undefined,
      limit: 1000,
    }),
    [municipioId]
  );

  const { data: pois, isLoading, error } = useQuery({
    queryKey: ['pois', 'geojson', params],
    queryFn: () => bancoTechdengueService.list(params),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
  });

  const geojson = useMemo(() => {
    if (!pois?.data) {
      return { type: 'FeatureCollection', features: [] } as GeoJSONCollection;
    }

    let filteredPOIs = pois.data;

    // Filtrar por tipo de criadouro
    if (filters.tipoCriadouro.length > 0) {
      filteredPOIs = filteredPOIs.filter((poi) =>
        filters.tipoCriadouro.includes(poi.tipo_criadouro)
      );
    }

    // Filtrar por status de devolutiva
    if (filters.statusDevolutiva.length > 0) {
      filteredPOIs = filteredPOIs.filter((poi) =>
        filters.statusDevolutiva.includes(poi.status_devolutiva)
      );
    }

    return convertToGeoJSON(filteredPOIs);
  }, [pois, filters.tipoCriadouro, filters.statusDevolutiva]);

  return {
    geojson,
    isLoading,
    error,
    totalPOIs: pois?.total || 0,
    filteredCount: geojson.features.length,
  };
}
