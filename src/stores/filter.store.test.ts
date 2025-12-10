import { describe, it, expect, beforeEach } from 'vitest';
import { useFilterStore } from './filter.store';

describe('Filter Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useFilterStore.getState().resetFilters();
  });

  describe('setMunicipio', () => {
    it('should set municipio ID', () => {
      const { setMunicipio } = useFilterStore.getState();

      setMunicipio('mun-123');

      expect(useFilterStore.getState().municipioId).toBe('mun-123');
    });

    it('should allow setting null', () => {
      const { setMunicipio } = useFilterStore.getState();

      setMunicipio('mun-123');
      setMunicipio(null);

      expect(useFilterStore.getState().municipioId).toBeNull();
    });
  });

  describe('setContrato', () => {
    it('should set contrato ID', () => {
      const { setContrato } = useFilterStore.getState();

      setContrato('cont-456');

      expect(useFilterStore.getState().contratoId).toBe('cont-456');
    });
  });

  describe('setDateRange', () => {
    it('should set date range', () => {
      const { setDateRange } = useFilterStore.getState();

      const from = new Date('2024-01-01');
      const to = new Date('2024-01-31');

      setDateRange({ from, to });

      const state = useFilterStore.getState();
      expect(state.dateRange.from).toEqual(from);
      expect(state.dateRange.to).toEqual(to);
    });
  });

  describe('setTiposCriadouro', () => {
    it('should set tipos de criadouro', () => {
      const { setTiposCriadouro } = useFilterStore.getState();

      setTiposCriadouro(['tipo1', 'tipo2']);

      expect(useFilterStore.getState().tiposCriadouro).toEqual(['tipo1', 'tipo2']);
    });

    it('should allow empty array', () => {
      const { setTiposCriadouro } = useFilterStore.getState();

      setTiposCriadouro(['tipo1']);
      setTiposCriadouro([]);

      expect(useFilterStore.getState().tiposCriadouro).toEqual([]);
    });
  });

  describe('resetFilters', () => {
    it('should reset all filters to default', () => {
      const { setMunicipio, setContrato, setTiposCriadouro, resetFilters } = useFilterStore.getState();

      setMunicipio('mun-123');
      setContrato('cont-456');
      setTiposCriadouro(['tipo1']);

      resetFilters();

      const state = useFilterStore.getState();
      expect(state.municipioId).toBeNull();
      expect(state.contratoId).toBeNull();
      expect(state.tiposCriadouro).toEqual([]);
    });

    it('should set default date range (last 30 days)', () => {
      const { resetFilters } = useFilterStore.getState();

      resetFilters();

      const state = useFilterStore.getState();
      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Check that dates are roughly correct (within 1 second)
      expect(Math.abs(state.dateRange.to.getTime() - now.getTime())).toBeLessThan(1000);
      expect(Math.abs(state.dateRange.from.getTime() - thirtyDaysAgo.getTime())).toBeLessThan(1000);
    });
  });

  describe('initial state', () => {
    it('should have default date range of last 30 days', () => {
      const state = useFilterStore.getState();

      const now = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      expect(state.dateRange.from.getDate()).toBe(thirtyDaysAgo.getDate());
      expect(state.dateRange.to.getDate()).toBe(now.getDate());
    });

    it('should have null municipio and contrato', () => {
      const state = useFilterStore.getState();

      expect(state.municipioId).toBeNull();
      expect(state.contratoId).toBeNull();
    });

    it('should have empty tiposCriadouro array', () => {
      const state = useFilterStore.getState();

      expect(state.tiposCriadouro).toEqual([]);
    });
  });
});
