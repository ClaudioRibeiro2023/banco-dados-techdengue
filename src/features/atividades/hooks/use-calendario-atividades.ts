'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, useCallback } from 'react';
import { startOfMonth, endOfMonth, format, addMonths, subMonths } from 'date-fns';
import { atividadesService } from '@/lib/services/atividades.service';
import { useFilterStore } from '@/stores/filter.store';
import type { Atividade } from '@/types/api.types';

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource: Atividade;
  allDay: boolean;
}

const STATUS_COLORS: Record<Atividade['status'], string> = {
  planejada: '#3b82f6',
  em_andamento: '#f59e0b',
  concluida: '#10b981',
  cancelada: '#ef4444',
};

export function useCalendarioAtividades() {
  const { municipioId, contratoId } = useFilterStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const dateRange = useMemo(
    () => ({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate),
    }),
    [currentDate]
  );

  const params = useMemo(
    () => ({
      municipio_id: municipioId || undefined,
      contrato_id: contratoId || undefined,
      data_inicio: format(dateRange.start, 'yyyy-MM-dd'),
      data_fim: format(dateRange.end, 'yyyy-MM-dd'),
      limit: 500,
    }),
    [dateRange, municipioId, contratoId]
  );

  const { data: atividadesData, isLoading } = useQuery({
    queryKey: ['atividades', 'calendario', params],
    queryFn: () => atividadesService.getAtividades(params),
    staleTime: 2 * 60 * 1000,
  });

  // Mock data for demonstration
  const mockAtividades: Atividade[] = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    return [
      {
        id: '1',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '1',
        data_atividade: format(new Date(year, month, 5), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 245,
        hectares_efetivos: 220,
        status: 'concluida',
        observacoes: 'Mapeamento setor Norte',
        created_at: '',
        updated_at: '',
      },
      {
        id: '2',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '2',
        data_atividade: format(new Date(year, month, 5), 'yyyy-MM-dd'),
        turno: 'tarde',
        hectares_mapeados: 180,
        hectares_efetivos: 165,
        status: 'concluida',
        created_at: '',
        updated_at: '',
      },
      {
        id: '3',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '1',
        data_atividade: format(new Date(year, month, 8), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 300,
        hectares_efetivos: 285,
        status: 'concluida',
        created_at: '',
        updated_at: '',
      },
      {
        id: '4',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '3',
        data_atividade: format(new Date(year, month, 12), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 150,
        hectares_efetivos: 0,
        status: 'em_andamento',
        observacoes: 'Em execução - setor Sul',
        created_at: '',
        updated_at: '',
      },
      {
        id: '5',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '2',
        data_atividade: format(new Date(year, month, 15), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 200,
        hectares_efetivos: 0,
        status: 'planejada',
        observacoes: 'Área industrial',
        created_at: '',
        updated_at: '',
      },
      {
        id: '6',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '1',
        data_atividade: format(new Date(year, month, 15), 'yyyy-MM-dd'),
        turno: 'tarde',
        hectares_mapeados: 175,
        hectares_efetivos: 0,
        status: 'planejada',
        created_at: '',
        updated_at: '',
      },
      {
        id: '7',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '3',
        data_atividade: format(new Date(year, month, 18), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 250,
        hectares_efetivos: 0,
        status: 'planejada',
        created_at: '',
        updated_at: '',
      },
      {
        id: '8',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '2',
        data_atividade: format(new Date(year, month, 3), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 120,
        hectares_efetivos: 0,
        status: 'cancelada',
        observacoes: 'Cancelada por condições climáticas',
        created_at: '',
        updated_at: '',
      },
      {
        id: '9',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '1',
        data_atividade: format(new Date(year, month, 20), 'yyyy-MM-dd'),
        turno: 'manha',
        hectares_mapeados: 280,
        hectares_efetivos: 0,
        status: 'planejada',
        created_at: '',
        updated_at: '',
      },
      {
        id: '10',
        municipio_id: '1',
        contrato_id: '1',
        piloto_id: '2',
        data_atividade: format(new Date(year, month, 22), 'yyyy-MM-dd'),
        turno: 'tarde',
        hectares_mapeados: 190,
        hectares_efetivos: 0,
        status: 'planejada',
        created_at: '',
        updated_at: '',
      },
    ];
  }, [currentDate]);

  // Convert activities to calendar events
  const events = useMemo((): CalendarEvent[] => {
    const atividades = atividadesData?.data || mockAtividades;

    return atividades.map((atividade) => {
      const date = new Date(atividade.data_atividade + 'T00:00:00');
      const turnoLabel = atividade.turno === 'manha' ? 'Manhã' : 'Tarde';

      return {
        id: atividade.id,
        title: `${turnoLabel} - ${atividade.hectares_mapeados}ha`,
        start: date,
        end: date,
        resource: atividade,
        allDay: true,
      };
    });
  }, [atividadesData, mockAtividades]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate((prev) =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const status = event.resource.status;
    return {
      style: {
        backgroundColor: STATUS_COLORS[status],
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: 'none',
        display: 'block',
      },
    };
  }, []);

  return {
    events,
    currentDate,
    setCurrentDate,
    selectedEvent,
    setSelectedEvent,
    navigateMonth,
    goToToday,
    eventStyleGetter,
    isLoading,
    STATUS_COLORS,
  };
}
