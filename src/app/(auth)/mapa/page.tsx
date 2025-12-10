'use client';

import { useState, useCallback } from 'react';
import {
  MapContainer,
  ClusterLayer,
  HeatmapLayer,
  POIPopup,
  MapStyleSelector,
  MapLayerToggle,
  MapLegend,
  MapStats,
  MapFiltersPanel,
} from '@/components/map';
import { usePOIsGeoJSON } from '@/features/mapa/hooks/use-pois-geojson';
import { useMapStore } from '@/stores/map.store';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import { Skeleton } from '@/components/ui/skeleton';

interface SelectedPOI {
  longitude: number;
  latitude: number;
  properties: {
    id: string;
    tipo_criadouro: string;
    status_devolutiva: string;
    data_identificacao: string;
    observacoes?: string;
    foto_url?: string;
  };
}

export default function MapaPage() {
  const { geojson, isLoading, totalPOIs, filteredCount } = usePOIsGeoJSON();
  const { filters, mapStyle } = useMapStore();
  const [selectedPOI, setSelectedPOI] = useState<SelectedPOI | null>(null);

  const handleClosePopup = useCallback(() => {
    setSelectedPOI(null);
  }, []);

  const handleViewDetails = useCallback((id: string) => {
    // TODO: Navegar para página de detalhes ou abrir modal
    console.log('Ver detalhes do POI:', id);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mapa de POIs</h1>
          <p className="text-muted-foreground">
            Visualização geoespacial dos criadouros identificados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DashboardFilters />
          <MapLayerToggle />
          <MapStyleSelector />
        </div>
      </div>

      {/* Map Container */}
      <div className="relative flex-1 rounded-lg overflow-hidden border">
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <MapContainer
            className="w-full h-full"
            mapStyle={mapStyle}
            initialViewState={{
              longitude: -49.2646,
              latitude: -16.6869,
              zoom: 5,
            }}
          >
            {/* Filtros laterais */}
            <MapFiltersPanel />

            {/* Camada de Clusters */}
            {filters.showClusters && (
              <ClusterLayer data={geojson} />
            )}

            {/* Camada de Heatmap */}
            {filters.showHeatmap && (
              <HeatmapLayer data={geojson} visible={filters.showHeatmap} />
            )}

            {/* Popup do POI selecionado */}
            {selectedPOI && (
              <POIPopup
                longitude={selectedPOI.longitude}
                latitude={selectedPOI.latitude}
                properties={selectedPOI.properties}
                onClose={handleClosePopup}
                onViewDetails={handleViewDetails}
              />
            )}

            {/* Legenda */}
            <MapLegend className="absolute bottom-4 right-4" />

            {/* Estatísticas */}
            <MapStats
              totalPOIs={totalPOIs}
              filteredCount={filteredCount}
              className="absolute bottom-4 left-4"
            />
          </MapContainer>
        )}
      </div>
    </div>
  );
}
