import { create } from 'zustand';
import type { MapStyleKey } from '@/components/map/map-container';

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

interface MapFilters {
  tipoCriadouro: string[];
  statusDevolutiva: string[];
  showClusters: boolean;
  showHeatmap: boolean;
}

interface MapState {
  viewState: ViewState;
  mapStyle: MapStyleKey;
  filters: MapFilters;
  selectedPOI: string | null;
  isLoading: boolean;

  // Actions
  setViewState: (viewState: ViewState) => void;
  setMapStyle: (style: MapStyleKey) => void;
  setFilters: (filters: Partial<MapFilters>) => void;
  setSelectedPOI: (poiId: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  toggleClusterView: () => void;
  toggleHeatmapView: () => void;
  resetFilters: () => void;
}

const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -49.2646,
  latitude: -16.6869,
  zoom: 5,
};

const DEFAULT_FILTERS: MapFilters = {
  tipoCriadouro: [],
  statusDevolutiva: [],
  showClusters: true,
  showHeatmap: false,
};

export const useMapStore = create<MapState>((set) => ({
  viewState: DEFAULT_VIEW_STATE,
  mapStyle: 'streets',
  filters: DEFAULT_FILTERS,
  selectedPOI: null,
  isLoading: false,

  setViewState: (viewState) => set({ viewState }),

  setMapStyle: (mapStyle) => set({ mapStyle }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  setSelectedPOI: (selectedPOI) => set({ selectedPOI }),

  setIsLoading: (isLoading) => set({ isLoading }),

  toggleClusterView: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        showClusters: !state.filters.showClusters,
        showHeatmap: false,
      },
    })),

  toggleHeatmapView: () =>
    set((state) => ({
      filters: {
        ...state.filters,
        showHeatmap: !state.filters.showHeatmap,
        showClusters: false,
      },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
}));
