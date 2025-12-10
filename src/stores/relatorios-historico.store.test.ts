import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import {
  useRelatoriosHistoricoStore,
  getTipoRelatorioLabel,
  getFormatoLabel,
  formatFileSize,
  type TipoRelatorio,
} from './relatorios-historico.store';

describe('relatorios-historico.store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { result } = renderHook(() => useRelatoriosHistoricoStore());
    act(() => {
      result.current.clearHistorico();
    });
  });

  describe('initial state', () => {
    it('should have empty historico', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());
      expect(result.current.historico).toEqual([]);
    });

    it('should have default maxHistorico of 50', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());
      expect(result.current.maxHistorico).toBe(50);
    });
  });

  describe('addRelatorio', () => {
    it('should add a new relatorio', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório Municipal Curitiba',
          filtros: { municipio: 'Curitiba' },
          status: 'concluido',
        });
      });

      expect(result.current.historico).toHaveLength(1);
      expect(result.current.historico[0].tipo).toBe('municipal');
      expect(result.current.historico[0].titulo).toBe('Relatório Municipal Curitiba');
    });

    it('should generate unique id', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id: string;
      act(() => {
        id = result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório 1',
          filtros: {},
          status: 'concluido',
        });
      });

      expect(id!).toMatch(/^rel-\d+-[a-z0-9]+$/);
    });

    it('should set dataCriacao automatically', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'atividades',
          formato: 'excel',
          titulo: 'Relatório Atividades',
          filtros: {},
          status: 'concluido',
        });
      });

      expect(result.current.historico[0].dataCriacao).toBeDefined();
      expect(new Date(result.current.historico[0].dataCriacao).getTime()).not.toBeNaN();
    });

    it('should add new relatorios at the beginning', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório 1',
          filtros: {},
          status: 'concluido',
        });
      });

      act(() => {
        result.current.addRelatorio({
          tipo: 'executivo',
          formato: 'pdf',
          titulo: 'Relatório 2',
          filtros: {},
          status: 'concluido',
        });
      });

      expect(result.current.historico[0].titulo).toBe('Relatório 2');
      expect(result.current.historico[1].titulo).toBe('Relatório 1');
    });

    it('should add relatorio with all fields', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'devolutivas',
          formato: 'excel',
          titulo: 'Relatório Completo',
          filtros: {
            municipio: 'São Paulo',
            contrato: 'CT-001',
            dataInicio: '2024-01-01',
            dataFim: '2024-12-31',
          },
          status: 'concluido',
          tamanho: 1024000,
          downloadUrl: 'https://example.com/download',
        });
      });

      const relatorio = result.current.historico[0];
      expect(relatorio.filtros.municipio).toBe('São Paulo');
      expect(relatorio.filtros.contrato).toBe('CT-001');
      expect(relatorio.tamanho).toBe(1024000);
      expect(relatorio.downloadUrl).toBe('https://example.com/download');
    });
  });

  describe('updateRelatorio', () => {
    it('should update existing relatorio', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id: string;
      act(() => {
        id = result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório Original',
          filtros: {},
          status: 'processando',
        });
      });

      act(() => {
        result.current.updateRelatorio(id!, {
          status: 'concluido',
          tamanho: 512000,
        });
      });

      const relatorio = result.current.historico.find(r => r.id === id);
      expect(relatorio?.status).toBe('concluido');
      expect(relatorio?.tamanho).toBe(512000);
    });

    it('should update status to erro with message', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id: string;
      act(() => {
        id = result.current.addRelatorio({
          tipo: 'executivo',
          formato: 'pdf',
          titulo: 'Relatório com Erro',
          filtros: {},
          status: 'processando',
        });
      });

      act(() => {
        result.current.updateRelatorio(id!, {
          status: 'erro',
          erro: 'Falha ao gerar relatório',
        });
      });

      const relatorio = result.current.historico.find(r => r.id === id);
      expect(relatorio?.status).toBe('erro');
      expect(relatorio?.erro).toBe('Falha ao gerar relatório');
    });

    it('should not affect other relatorios', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id1: string;
      let id2: string;
      act(() => {
        id1 = result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório 1',
          filtros: {},
          status: 'concluido',
        });
        id2 = result.current.addRelatorio({
          tipo: 'atividades',
          formato: 'excel',
          titulo: 'Relatório 2',
          filtros: {},
          status: 'concluido',
        });
      });

      act(() => {
        result.current.updateRelatorio(id1!, { titulo: 'Título Atualizado' });
      });

      const relatorio2 = result.current.historico.find(r => r.id === id2);
      expect(relatorio2?.titulo).toBe('Relatório 2');
    });
  });

  describe('removeRelatorio', () => {
    it('should remove a relatorio by id', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id: string;
      act(() => {
        id = result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório a Remover',
          filtros: {},
          status: 'concluido',
        });
      });

      expect(result.current.historico).toHaveLength(1);

      act(() => {
        result.current.removeRelatorio(id!);
      });

      expect(result.current.historico).toHaveLength(0);
    });

    it('should not affect other relatorios when removing', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      let id1 = '';
      let id2 = '';
      act(() => {
        id1 = result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório 1',
          filtros: {},
          status: 'concluido',
        });
        id2 = result.current.addRelatorio({
          tipo: 'atividades',
          formato: 'excel',
          titulo: 'Relatório 2',
          filtros: {},
          status: 'concluido',
        });
      });

      act(() => {
        result.current.removeRelatorio(id1);
      });

      expect(result.current.historico).toHaveLength(1);
      expect(result.current.historico[0].id).toBe(id2);
    });

    it('should do nothing if id not found', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório',
          filtros: {},
          status: 'concluido',
        });
      });

      act(() => {
        result.current.removeRelatorio('non-existent-id');
      });

      expect(result.current.historico).toHaveLength(1);
    });
  });

  describe('clearHistorico', () => {
    it('should remove all relatorios', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Relatório 1',
          filtros: {},
          status: 'concluido',
        });
        result.current.addRelatorio({
          tipo: 'atividades',
          formato: 'excel',
          titulo: 'Relatório 2',
          filtros: {},
          status: 'concluido',
        });
        result.current.addRelatorio({
          tipo: 'executivo',
          formato: 'pdf',
          titulo: 'Relatório 3',
          filtros: {},
          status: 'concluido',
        });
      });

      expect(result.current.historico).toHaveLength(3);

      act(() => {
        result.current.clearHistorico();
      });

      expect(result.current.historico).toHaveLength(0);
    });
  });

  describe('getRelatoriosPorTipo', () => {
    it('should return relatorios of specific type', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Municipal 1',
          filtros: {},
          status: 'concluido',
        });
        result.current.addRelatorio({
          tipo: 'atividades',
          formato: 'excel',
          titulo: 'Atividades 1',
          filtros: {},
          status: 'concluido',
        });
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'excel',
          titulo: 'Municipal 2',
          filtros: {},
          status: 'concluido',
        });
      });

      const municipais = result.current.getRelatoriosPorTipo('municipal');
      expect(municipais).toHaveLength(2);
      expect(municipais.every(r => r.tipo === 'municipal')).toBe(true);
    });

    it('should return empty array if no relatorios of type', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Municipal',
          filtros: {},
          status: 'concluido',
        });
      });

      const executivos = result.current.getRelatoriosPorTipo('executivo');
      expect(executivos).toHaveLength(0);
    });
  });

  describe('getRelatoriosRecentes', () => {
    it('should return most recent relatorios', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.addRelatorio({
            tipo: 'municipal',
            formato: 'pdf',
            titulo: `Relatório ${i + 1}`,
            filtros: {},
            status: 'concluido',
          });
        }
      });

      const recentes = result.current.getRelatoriosRecentes(5);
      expect(recentes).toHaveLength(5);
      expect(recentes[0].titulo).toBe('Relatório 15');
    });

    it('should use default limit of 10', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        for (let i = 0; i < 20; i++) {
          result.current.addRelatorio({
            tipo: 'municipal',
            formato: 'pdf',
            titulo: `Relatório ${i + 1}`,
            filtros: {},
            status: 'concluido',
          });
        }
      });

      const recentes = result.current.getRelatoriosRecentes();
      expect(recentes).toHaveLength(10);
    });

    it('should return all if less than limit', () => {
      const { result } = renderHook(() => useRelatoriosHistoricoStore());

      act(() => {
        result.current.addRelatorio({
          tipo: 'municipal',
          formato: 'pdf',
          titulo: 'Único Relatório',
          filtros: {},
          status: 'concluido',
        });
      });

      const recentes = result.current.getRelatoriosRecentes(10);
      expect(recentes).toHaveLength(1);
    });
  });
});

describe('Helper Functions', () => {
  describe('getTipoRelatorioLabel', () => {
    it('should return correct label for municipal', () => {
      expect(getTipoRelatorioLabel('municipal')).toBe('Relatório Municipal');
    });

    it('should return correct label for atividades', () => {
      expect(getTipoRelatorioLabel('atividades')).toBe('Relatório de Atividades');
    });

    it('should return correct label for devolutivas', () => {
      expect(getTipoRelatorioLabel('devolutivas')).toBe('Relatório de Devolutivas');
    });

    it('should return correct label for executivo', () => {
      expect(getTipoRelatorioLabel('executivo')).toBe('Relatório Executivo');
    });
  });

  describe('getFormatoLabel', () => {
    it('should return correct label for pdf', () => {
      expect(getFormatoLabel('pdf')).toBe('PDF');
    });

    it('should return correct label for excel', () => {
      expect(getFormatoLabel('excel')).toBe('Excel');
    });

    it('should return correct label for preview', () => {
      expect(getFormatoLabel('preview')).toBe('Visualização');
    });
  });

  describe('formatFileSize', () => {
    it('should return dash for undefined', () => {
      expect(formatFileSize(undefined)).toBe('—');
    });

    it('should return dash for zero', () => {
      expect(formatFileSize(0)).toBe('—');
    });

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes', () => {
      expect(formatFileSize(2048)).toBe('2.0 KB');
    });

    it('should format megabytes', () => {
      expect(formatFileSize(1572864)).toBe('1.5 MB');
    });

    it('should handle boundary at 1024 bytes', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB');
    });

    it('should handle boundary at 1MB', () => {
      expect(formatFileSize(1048576)).toBe('1.0 MB');
    });
  });
});
