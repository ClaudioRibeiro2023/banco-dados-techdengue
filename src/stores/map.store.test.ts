import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useMapStore } from './map.store';

describe('map.store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useMapStore());
    act(() => {
      result.current.resetFilters();
      result.current.setSelectedPOI(null);
      result.current.setIsLoading(false);
      result.current.setMapStyle('streets');
      result.current.setViewState({
        longitude: -49.2646,
        latitude: -16.6869,
        zoom: 5,
      });
    });
  });

  describe('initial state', () => {
    it('should have default view state', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.viewState).toEqual({
        longitude: -49.2646,
        latitude: -16.6869,
        zoom: 5,
      });
    });

    it('should have default map style', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.mapStyle).toBe('streets');
    });

    it('should have default filters', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.filters).toEqual({
        tipoCriadouro: [],
        statusDevolutiva: [],
        showClusters: true,
        showHeatmap: false,
      });
    });

    it('should have no selected POI', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.selectedPOI).toBeNull();
    });

    it('should not be loading', () => {
      const { result } = renderHook(() => useMapStore());
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setViewState', () => {
    it('should update view state', () => {
      const { result } = renderHook(() => useMapStore());
      const newViewState = {
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 12,
      };

      act(() => {
        result.current.setViewState(newViewState);
      });

      expect(result.current.viewState).toEqual(newViewState);
    });

    it('should update view state with pitch and bearing', () => {
      const { result } = renderHook(() => useMapStore());
      const newViewState = {
        longitude: -46.6333,
        latitude: -23.5505,
        zoom: 12,
        pitch: 45,
        bearing: 90,
      };

      act(() => {
        result.current.setViewState(newViewState);
      });

      expect(result.current.viewState.pitch).toBe(45);
      expect(result.current.viewState.bearing).toBe(90);
    });
  });

  describe('setMapStyle', () => {
    it('should update map style to satellite', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setMapStyle('satellite');
      });

      expect(result.current.mapStyle).toBe('satellite');
    });

    it('should update map style to dark', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setMapStyle('dark');
      });

      expect(result.current.mapStyle).toBe('dark');
    });

    it('should update map style to light', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setMapStyle('light');
      });

      expect(result.current.mapStyle).toBe('light');
    });

    it('should update map style to outdoors', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setMapStyle('outdoors');
      });

      expect(result.current.mapStyle).toBe('outdoors');
    });
  });

  describe('setFilters', () => {
    it('should update tipo criadouro filter', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ tipoCriadouro: ['Pneu', 'Caixa d\'água'] });
      });

      expect(result.current.filters.tipoCriadouro).toEqual(['Pneu', 'Caixa d\'água']);
    });

    it('should update status devolutiva filter', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ statusDevolutiva: ['pendente', 'concluido'] });
      });

      expect(result.current.filters.statusDevolutiva).toEqual(['pendente', 'concluido']);
    });

    it('should merge filters without overwriting others', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ tipoCriadouro: ['Pneu'] });
      });

      act(() => {
        result.current.setFilters({ statusDevolutiva: ['pendente'] });
      });

      expect(result.current.filters.tipoCriadouro).toEqual(['Pneu']);
      expect(result.current.filters.statusDevolutiva).toEqual(['pendente']);
    });

    it('should update showClusters', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ showClusters: false });
      });

      expect(result.current.filters.showClusters).toBe(false);
    });

    it('should update showHeatmap', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ showHeatmap: true });
      });

      expect(result.current.filters.showHeatmap).toBe(true);
    });
  });

  describe('setSelectedPOI', () => {
    it('should select a POI', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setSelectedPOI('poi-123');
      });

      expect(result.current.selectedPOI).toBe('poi-123');
    });

    it('should deselect POI by setting null', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setSelectedPOI('poi-123');
      });

      act(() => {
        result.current.setSelectedPOI(null);
      });

      expect(result.current.selectedPOI).toBeNull();
    });

    it('should change selected POI', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setSelectedPOI('poi-123');
      });

      act(() => {
        result.current.setSelectedPOI('poi-456');
      });

      expect(result.current.selectedPOI).toBe('poi-456');
    });
  });

  describe('setIsLoading', () => {
    it('should set loading to true', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setIsLoading(true);
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setIsLoading(true);
      });

      act(() => {
        result.current.setIsLoading(false);
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('toggleClusterView', () => {
    it('should toggle clusters from true to false', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.toggleClusterView();
      });

      expect(result.current.filters.showClusters).toBe(false);
    });

    it('should toggle clusters from false to true', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ showClusters: false });
      });

      act(() => {
        result.current.toggleClusterView();
      });

      expect(result.current.filters.showClusters).toBe(true);
    });

    it('should disable heatmap when enabling clusters', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ showHeatmap: true, showClusters: false });
      });

      act(() => {
        result.current.toggleClusterView();
      });

      expect(result.current.filters.showClusters).toBe(true);
      expect(result.current.filters.showHeatmap).toBe(false);
    });
  });

  describe('toggleHeatmapView', () => {
    it('should toggle heatmap from false to true', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.toggleHeatmapView();
      });

      expect(result.current.filters.showHeatmap).toBe(true);
    });

    it('should toggle heatmap from true to false', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setFilters({ showHeatmap: true });
      });

      act(() => {
        result.current.toggleHeatmapView();
      });

      expect(result.current.filters.showHeatmap).toBe(false);
    });

    it('should disable clusters when enabling heatmap', () => {
      const { result } = renderHook(() => useMapStore());

      // Start with clusters enabled (default)
      expect(result.current.filters.showClusters).toBe(true);

      act(() => {
        result.current.toggleHeatmapView();
      });

      expect(result.current.filters.showHeatmap).toBe(true);
      expect(result.current.filters.showClusters).toBe(false);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to default', () => {
      const { result } = renderHook(() => useMapStore());

      // Set custom filters
      act(() => {
        result.current.setFilters({
          tipoCriadouro: ['Pneu', 'Calha'],
          statusDevolutiva: ['pendente'],
          showClusters: false,
          showHeatmap: true,
        });
      });

      // Reset
      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.filters).toEqual({
        tipoCriadouro: [],
        statusDevolutiva: [],
        showClusters: true,
        showHeatmap: false,
      });
    });

    it('should not affect other state properties', () => {
      const { result } = renderHook(() => useMapStore());

      act(() => {
        result.current.setSelectedPOI('poi-123');
        result.current.setMapStyle('satellite');
        result.current.setViewState({
          longitude: -46.6333,
          latitude: -23.5505,
          zoom: 15,
        });
      });

      act(() => {
        result.current.resetFilters();
      });

      expect(result.current.selectedPOI).toBe('poi-123');
      expect(result.current.mapStyle).toBe('satellite');
      expect(result.current.viewState.zoom).toBe(15);
    });
  });
});
