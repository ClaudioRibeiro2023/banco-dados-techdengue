'use client';

import { useMemo, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  TipoRelatorio,
  RelatorioMunicipal,
  RelatorioAtividades,
  RelatorioDevolutivas,
  RelatorioExecutivo,
} from '@/lib/services/relatorios.service';
import { useFilterStore } from '@/stores/filter.store';

// Mock data generators
function generateMockRelatorioMunicipal(): RelatorioMunicipal {
  return {
    municipio: {
      id: '1',
      nome: 'São Paulo',
      cod_ibge: '3550308',
    },
    periodo: {
      inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd'),
    },
    resumo: {
      hectares_mapeados: 15420,
      hectares_efetivos: 13878,
      total_criadouros: 4521,
      total_devolutivas: 3890,
      taxa_efetividade: 90,
      taxa_devolutivas: 86,
    },
    criadouros_por_tipo: [
      { tipo: 'Caixa d\'água', quantidade: 1245, percentual: 27.5 },
      { tipo: 'Pneu', quantidade: 892, percentual: 19.7 },
      { tipo: 'Vaso de planta', quantidade: 756, percentual: 16.7 },
      { tipo: 'Lixo', quantidade: 634, percentual: 14.0 },
      { tipo: 'Piscina', quantidade: 512, percentual: 11.3 },
      { tipo: 'Outros', quantidade: 482, percentual: 10.8 },
    ],
    devolutivas_por_status: [
      { status: 'Tratado', quantidade: 2890, percentual: 74.3 },
      { status: 'Em análise', quantidade: 456, percentual: 11.7 },
      { status: 'Pendente', quantidade: 389, percentual: 10.0 },
      { status: 'Descartado', quantidade: 155, percentual: 4.0 },
    ],
    atividades: [
      { data: '2024-12-01', piloto: 'João Silva', turno: 'Manhã', hectares: 245, status: 'Concluída' },
      { data: '2024-12-02', piloto: 'Maria Santos', turno: 'Tarde', hectares: 180, status: 'Concluída' },
      { data: '2024-12-03', piloto: 'Carlos Oliveira', turno: 'Manhã', hectares: 220, status: 'Concluída' },
      { data: '2024-12-04', piloto: 'João Silva', turno: 'Tarde', hectares: 195, status: 'Concluída' },
      { data: '2024-12-05', piloto: 'Ana Costa', turno: 'Manhã', hectares: 260, status: 'Concluída' },
    ],
  };
}

function generateMockRelatorioAtividades(): RelatorioAtividades {
  return {
    periodo: {
      inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd'),
    },
    resumo: {
      total_atividades: 156,
      atividades_concluidas: 142,
      atividades_canceladas: 8,
      taxa_conclusao: 91,
      total_hectares: 42500,
      hectares_efetivos: 38250,
    },
    por_piloto: [
      { piloto_id: '1', piloto_nome: 'João Silva', atividades: 45, hectares: 12500, efetividade: 90 },
      { piloto_id: '2', piloto_nome: 'Maria Santos', atividades: 38, hectares: 10200, efetividade: 92 },
      { piloto_id: '3', piloto_nome: 'Carlos Oliveira', atividades: 42, hectares: 11800, efetividade: 88 },
      { piloto_id: '4', piloto_nome: 'Ana Costa', atividades: 31, hectares: 8000, efetividade: 95 },
    ],
    por_municipio: [
      { municipio_id: '1', municipio_nome: 'São Paulo', atividades: 65, hectares: 18500 },
      { municipio_id: '2', municipio_nome: 'Campinas', atividades: 42, hectares: 11200 },
      { municipio_id: '3', municipio_nome: 'Ribeirão Preto', atividades: 28, hectares: 7400 },
      { municipio_id: '4', municipio_nome: 'Sorocaba', atividades: 21, hectares: 5400 },
    ],
    detalhes: [
      { id: '1', data: '2024-12-01', municipio: 'São Paulo', piloto: 'João Silva', turno: 'Manhã', hectares_mapeados: 245, hectares_efetivos: 220, status: 'Concluída' },
      { id: '2', data: '2024-12-01', municipio: 'Campinas', piloto: 'Maria Santos', turno: 'Tarde', hectares_mapeados: 180, hectares_efetivos: 165, status: 'Concluída' },
      { id: '3', data: '2024-12-02', municipio: 'São Paulo', piloto: 'Carlos Oliveira', turno: 'Manhã', hectares_mapeados: 300, hectares_efetivos: 285, status: 'Concluída' },
      { id: '4', data: '2024-12-02', municipio: 'Ribeirão Preto', piloto: 'Ana Costa', turno: 'Tarde', hectares_mapeados: 210, hectares_efetivos: 200, status: 'Concluída' },
      { id: '5', data: '2024-12-03', municipio: 'Sorocaba', piloto: 'João Silva', turno: 'Manhã', hectares_mapeados: 175, hectares_efetivos: 0, status: 'Cancelada' },
    ],
  };
}

function generateMockRelatorioDevolutivas(): RelatorioDevolutivas {
  return {
    periodo: {
      inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd'),
    },
    resumo: {
      total_criadouros: 4521,
      devolutivas_pendentes: 389,
      devolutivas_em_analise: 456,
      devolutivas_tratadas: 3521,
      devolutivas_descartadas: 155,
      taxa_conclusao: 78,
      tempo_medio_resposta: 3.5,
    },
    por_tipo: [
      { tipo: 'Caixa d\'água', total: 1245, tratados: 1120, pendentes: 125, taxa: 90 },
      { tipo: 'Pneu', total: 892, tratados: 714, pendentes: 178, taxa: 80 },
      { tipo: 'Vaso de planta', total: 756, tratados: 680, pendentes: 76, taxa: 90 },
      { tipo: 'Lixo', total: 634, tratados: 507, pendentes: 127, taxa: 80 },
      { tipo: 'Piscina', total: 512, tratados: 461, pendentes: 51, taxa: 90 },
      { tipo: 'Outros', total: 482, tratados: 386, pendentes: 96, taxa: 80 },
    ],
    por_municipio: [
      { municipio: 'São Paulo', total: 2100, tratados: 1785, taxa: 85 },
      { municipio: 'Campinas', total: 980, tratados: 833, taxa: 85 },
      { municipio: 'Ribeirão Preto', total: 756, tratados: 605, taxa: 80 },
      { municipio: 'Sorocaba', total: 685, tratados: 548, taxa: 80 },
    ],
  };
}

function generateMockRelatorioExecutivo(): RelatorioExecutivo {
  return {
    periodo: {
      inicio: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      fim: format(new Date(), 'yyyy-MM-dd'),
    },
    kpis: {
      hectares_mapeados: 42500,
      variacao_hectares: 12.5,
      criadouros_identificados: 4521,
      variacao_criadouros: -5.2,
      taxa_devolutivas: 78,
      variacao_devolutivas: 8.3,
      atividades_realizadas: 156,
      variacao_atividades: 15.8,
    },
    ranking_municipios: [
      { posicao: 1, municipio: 'São Paulo', hectares: 15420, eficiencia: 92 },
      { posicao: 2, municipio: 'Campinas', hectares: 10200, eficiencia: 88 },
      { posicao: 3, municipio: 'Ribeirão Preto', hectares: 8500, eficiencia: 85 },
      { posicao: 4, municipio: 'Sorocaba', hectares: 5200, eficiencia: 90 },
      { posicao: 5, municipio: 'Santos', hectares: 3180, eficiencia: 82 },
    ],
    tendencias: {
      hectares: [
        { mes: 'Jul', valor: 32000 },
        { mes: 'Ago', valor: 35000 },
        { mes: 'Set', valor: 38000 },
        { mes: 'Out', valor: 36500 },
        { mes: 'Nov', valor: 40000 },
        { mes: 'Dez', valor: 42500 },
      ],
      criadouros: [
        { mes: 'Jul', valor: 5200 },
        { mes: 'Ago', valor: 4800 },
        { mes: 'Set', valor: 4600 },
        { mes: 'Out', valor: 4900 },
        { mes: 'Nov', valor: 4700 },
        { mes: 'Dez', valor: 4521 },
      ],
      devolutivas: [
        { mes: 'Jul', valor: 68 },
        { mes: 'Ago', valor: 71 },
        { mes: 'Set', valor: 73 },
        { mes: 'Out', valor: 75 },
        { mes: 'Nov', valor: 76 },
        { mes: 'Dez', valor: 78 },
      ],
    },
  };
}

// Hook para buscar relatório da API (para uso futuro)
// export function useRelatorio(tipo: TipoRelatorio) { ... }

export function useRelatorioData(tipo: TipoRelatorio) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { dateRange, municipioId } = useFilterStore();

  // Use mock data for demonstration
  const data = useMemo(() => {
    switch (tipo) {
      case 'municipal':
        return generateMockRelatorioMunicipal();
      case 'atividades':
        return generateMockRelatorioAtividades();
      case 'devolutivas':
        return generateMockRelatorioDevolutivas();
      case 'executivo':
        return generateMockRelatorioExecutivo();
    }
  }, [tipo]);

  const periodoFormatado = useMemo(() => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} a ${format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}`;
    }
    return 'Últimos 30 dias';
  }, [dateRange]);

  return {
    data,
    isLoading: false,
    isGenerating,
    setIsGenerating,
    periodoFormatado,
    params: {
      municipio_id: municipioId,
      data_inicio: dateRange.from?.toISOString().split('T')[0],
      data_fim: dateRange.to?.toISOString().split('T')[0],
    },
  };
}
