import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoRelatorio = 'municipal' | 'atividades' | 'devolutivas' | 'executivo';
export type FormatoExportacao = 'pdf' | 'excel' | 'preview';

export interface RelatorioHistorico {
  id: string;
  tipo: TipoRelatorio;
  formato: FormatoExportacao;
  titulo: string;
  filtros: {
    municipio?: string;
    contrato?: string;
    dataInicio?: string;
    dataFim?: string;
  };
  dataCriacao: string;
  tamanho?: number; // bytes
  status: 'concluido' | 'erro' | 'processando';
  erro?: string;
  downloadUrl?: string;
}

interface RelatoriosHistoricoState {
  historico: RelatorioHistorico[];
  maxHistorico: number;

  // Actions
  addRelatorio: (relatorio: Omit<RelatorioHistorico, 'id' | 'dataCriacao'>) => string;
  updateRelatorio: (id: string, updates: Partial<RelatorioHistorico>) => void;
  removeRelatorio: (id: string) => void;
  clearHistorico: () => void;
  getRelatoriosPorTipo: (tipo: TipoRelatorio) => RelatorioHistorico[];
  getRelatoriosRecentes: (limite?: number) => RelatorioHistorico[];
}

export const useRelatoriosHistoricoStore = create<RelatoriosHistoricoState>()(
  persist(
    (set, get) => ({
      historico: [],
      maxHistorico: 50,

      addRelatorio: (relatorio) => {
        const id = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const novoRelatorio: RelatorioHistorico = {
          ...relatorio,
          id,
          dataCriacao: new Date().toISOString(),
        };

        set((state) => {
          const novoHistorico = [novoRelatorio, ...state.historico];
          // Limitar ao máximo de histórico
          if (novoHistorico.length > state.maxHistorico) {
            novoHistorico.pop();
          }
          return { historico: novoHistorico };
        });

        return id;
      },

      updateRelatorio: (id, updates) => {
        set((state) => ({
          historico: state.historico.map((rel) =>
            rel.id === id ? { ...rel, ...updates } : rel
          ),
        }));
      },

      removeRelatorio: (id) => {
        set((state) => ({
          historico: state.historico.filter((rel) => rel.id !== id),
        }));
      },

      clearHistorico: () => {
        set({ historico: [] });
      },

      getRelatoriosPorTipo: (tipo) => {
        return get().historico.filter((rel) => rel.tipo === tipo);
      },

      getRelatoriosRecentes: (limite = 10) => {
        return get().historico.slice(0, limite);
      },
    }),
    {
      name: 'relatorios-historico-storage',
      partialize: (state) => ({
        historico: state.historico,
      }),
    }
  )
);

// Helper functions
export function getTipoRelatorioLabel(tipo: TipoRelatorio): string {
  const labels: Record<TipoRelatorio, string> = {
    municipal: 'Relatório Municipal',
    atividades: 'Relatório de Atividades',
    devolutivas: 'Relatório de Devolutivas',
    executivo: 'Relatório Executivo',
  };
  return labels[tipo];
}

export function getFormatoLabel(formato: FormatoExportacao): string {
  const labels: Record<FormatoExportacao, string> = {
    pdf: 'PDF',
    excel: 'Excel',
    preview: 'Visualização',
  };
  return labels[formato];
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
