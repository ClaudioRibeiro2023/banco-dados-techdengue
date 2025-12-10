import { create } from 'zustand';

export interface DateRange {
  from: Date;
  to: Date;
}

interface FilterState {
  // Filtros globais
  municipioId: string | null;
  contratoId: string | null;
  dateRange: DateRange;
  tiposCriadouro: string[];

  // Actions
  setMunicipio: (id: string | null) => void;
  setContrato: (id: string | null) => void;
  setDateRange: (range: DateRange) => void;
  setTiposCriadouro: (tipos: string[]) => void;
  resetFilters: () => void;
}

const getDefaultDateRange = (): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 30); // Últimos 30 dias
  return { from, to };
};

export const useFilterStore = create<FilterState>((set) => ({
  municipioId: null,
  contratoId: null,
  dateRange: getDefaultDateRange(),
  tiposCriadouro: [],

  setMunicipio: (municipioId) => set({ municipioId }),

  setContrato: (contratoId) => set({ contratoId }),

  setDateRange: (dateRange) => set({ dateRange }),

  setTiposCriadouro: (tiposCriadouro) => set({ tiposCriadouro }),

  resetFilters: () =>
    set({
      municipioId: null,
      contratoId: null,
      dateRange: getDefaultDateRange(),
      tiposCriadouro: [],
    }),
}));
