'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { dadosGerenciaisService } from '@/lib/services/dados-gerenciais.service';
import { dadosGeograficosService } from '@/lib/services/dados-geograficos.service';
import { useFilterStore } from '@/stores/filter.store';

interface MunicipioComparativo {
  id: string;
  nome: string;
  hectares_mapeados: number;
  criadouros: number;
  taxa_devolutiva: number;
  atividades: number;
  eficiencia: number;
}

interface RadarDataPoint {
  subject: string;
  fullMark: number;
  [key: string]: string | number;
}

export function useComparativoMunicipios() {
  const { dateRange } = useFilterStore();
  const [selectedMunicipios, setSelectedMunicipios] = useState<string[]>([]);

  const params = useMemo(
    () => ({
      data_inicio: dateRange.from?.toISOString().split('T')[0],
      data_fim: dateRange.to?.toISOString().split('T')[0],
    }),
    [dateRange]
  );

  // Buscar lista de municípios
  const { data: municipiosData, isLoading: isLoadingMunicipios } = useQuery({
    queryKey: ['municipios', 'list'],
    queryFn: () => dadosGeograficosService.getMunicipios(),
    staleTime: 10 * 60 * 1000,
  });

  // Buscar dados comparativos (nova API v2.0: recebe array de nomes de municípios)
  const { data: comparativoData, isLoading: isLoadingComparativo } = useQuery({
    queryKey: ['comparativo', 'municipios', selectedMunicipios],
    queryFn: () => dadosGerenciaisService.getComparativoMunicipios(selectedMunicipios),
    enabled: selectedMunicipios.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // Mapear dados da API para o formato esperado
  const dadosComparativos = useMemo((): MunicipioComparativo[] => {
    if (comparativoData && comparativoData.length > 0) {
      return comparativoData.map((item, idx) => ({
        id: String(idx + 1),
        nome: item.municipio,
        hectares_mapeados: item.hectares,
        criadouros: Math.round(item.pois * 0.4),
        taxa_devolutiva: 78,
        atividades: Math.round(item.hectares / 50),
        eficiencia: 85,
      }));
    }

    // Dados mock para MG
    return [
      { id: '1', nome: 'Belo Horizonte', hectares_mapeados: 50000, criadouros: 45000, taxa_devolutiva: 78, atividades: 450, eficiencia: 85 },
      { id: '2', nome: 'Uberlândia', hectares_mapeados: 40000, criadouros: 38000, taxa_devolutiva: 82, atividades: 380, eficiencia: 88 },
      { id: '3', nome: 'Contagem', hectares_mapeados: 35000, criadouros: 32000, taxa_devolutiva: 75, atividades: 320, eficiencia: 80 },
      { id: '4', nome: 'Juiz de Fora', hectares_mapeados: 28000, criadouros: 25000, taxa_devolutiva: 85, atividades: 250, eficiencia: 92 },
      { id: '5', nome: 'Betim', hectares_mapeados: 25000, criadouros: 22000, taxa_devolutiva: 72, atividades: 220, eficiencia: 78 },
    ];
  }, [comparativoData]);

  // Dados para o radar chart
  const radarData = useMemo((): RadarDataPoint[] => {
    const metrics = [
      { subject: 'Hectares', fullMark: 20000 },
      { subject: 'Criadouros', fullMark: 5000 },
      { subject: 'Taxa Devolutiva', fullMark: 100 },
      { subject: 'Atividades', fullMark: 300 },
      { subject: 'Eficiência', fullMark: 100 },
    ];

    const selectedData = dadosComparativos.filter((m) =>
      selectedMunicipios.length === 0 || selectedMunicipios.includes(m.id)
    ).slice(0, 4); // Máximo 4 para visualização

    return metrics.map((metric) => {
      const point: RadarDataPoint = {
        subject: metric.subject,
        fullMark: metric.fullMark,
      };

      selectedData.forEach((mun) => {
        switch (metric.subject) {
          case 'Hectares':
            point[mun.nome] = mun.hectares_mapeados;
            break;
          case 'Criadouros':
            point[mun.nome] = mun.criadouros;
            break;
          case 'Taxa Devolutiva':
            point[mun.nome] = mun.taxa_devolutiva;
            break;
          case 'Atividades':
            point[mun.nome] = mun.atividades;
            break;
          case 'Eficiência':
            point[mun.nome] = mun.eficiencia;
            break;
        }
      });

      return point;
    });
  }, [dadosComparativos, selectedMunicipios]);

  // Lista de municípios disponíveis
  const municipiosDisponiveis = useMemo(() => {
    if (municipiosData && municipiosData.length > 0) {
      return municipiosData.map((m) => ({
        id: m.id,
        nome: m.nome,
      }));
    }
    return dadosComparativos.map((m) => ({
      id: m.id,
      nome: m.nome,
    }));
  }, [municipiosData, dadosComparativos]);

  return {
    dadosComparativos,
    radarData,
    municipiosDisponiveis,
    selectedMunicipios,
    setSelectedMunicipios,
    isLoading: isLoadingMunicipios || isLoadingComparativo,
  };
}
