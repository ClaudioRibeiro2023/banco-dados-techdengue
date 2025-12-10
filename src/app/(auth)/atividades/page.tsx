'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, User, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KPICard } from '@/components/data-display/kpi-card';
import { ActivityCalendar } from '@/components/calendar';
import { DashboardFilters } from '@/features/dashboard/components/dashboard-filters';
import {
  useCalendarioAtividades,
  CalendarEvent,
} from '@/features/atividades/hooks/use-calendario-atividades';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  planejada: 'Planejada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  planejada: 'outline',
  em_andamento: 'secondary',
  concluida: 'default',
  cancelada: 'destructive',
};

export default function CalendarioPage() {
  const {
    events,
    currentDate,
    setCurrentDate,
    selectedEvent,
    setSelectedEvent,
    eventStyleGetter,
    isLoading,
    STATUS_COLORS,
  } = useCalendarioAtividades();

  // Stats from events
  const stats = {
    total: events.length,
    concluidas: events.filter((e) => e.resource.status === 'concluida').length,
    emAndamento: events.filter((e) => e.resource.status === 'em_andamento').length,
    planejadas: events.filter((e) => e.resource.status === 'planejada').length,
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-end">
        <DashboardFilters />
      </div>

      {/* KPIs do mês */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total no Mês"
          value={stats.total.toString()}
          description="Atividades programadas"
          icon={Calendar}
          loading={isLoading}
        />
        <KPICard
          title="Concluídas"
          value={stats.concluidas.toString()}
          description={`${Math.round((stats.concluidas / stats.total) * 100) || 0}% do total`}
          icon={Calendar}
          loading={isLoading}
          variant="success"
        />
        <KPICard
          title="Em Andamento"
          value={stats.emAndamento.toString()}
          description="Atividades em execução"
          icon={Clock}
          loading={isLoading}
          variant="warning"
        />
        <KPICard
          title="Planejadas"
          value={stats.planejadas.toString()}
          description="Aguardando execução"
          icon={Calendar}
          loading={isLoading}
        />
      </div>

      {/* Legenda */}
      <Card>
        <CardContent className="py-3">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm font-medium">Legenda:</span>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm capitalize">
                  {STATUS_LABELS[status]}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Calendário e Detalhes */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <ActivityCalendar
              events={events}
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              onSelectEvent={handleSelectEvent}
              eventStyleGetter={eventStyleGetter}
              isLoading={isLoading}
            />
          </CardContent>
        </Card>

        {/* Painel de Detalhes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Detalhes da Atividade</CardTitle>
            {selectedEvent && (
              <Button variant="ghost" size="icon" onClick={handleCloseDetail}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {selectedEvent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={STATUS_VARIANTS[selectedEvent.resource.status]}>
                    {STATUS_LABELS[selectedEvent.resource.status]}
                  </Badge>
                  <Badge variant="outline">
                    {selectedEvent.resource.turno === 'manha' ? 'Manhã' : 'Tarde'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(selectedEvent.start, "dd 'de' MMMM 'de' yyyy", {
                        locale: ptBR,
                      })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {selectedEvent.resource.hectares_mapeados} hectares mapeados
                    </span>
                  </div>

                  {selectedEvent.resource.hectares_efetivos > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {selectedEvent.resource.hectares_efetivos} hectares efetivos
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Piloto ID: {selectedEvent.resource.piloto_id}</span>
                  </div>
                </div>

                {selectedEvent.resource.observacoes && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Observações:</p>
                    <p className="text-sm">{selectedEvent.resource.observacoes}</p>
                  </div>
                )}

                {selectedEvent.resource.hectares_efetivos > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground mb-1">Efetividade:</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full',
                            selectedEvent.resource.hectares_efetivos /
                              selectedEvent.resource.hectares_mapeados >=
                            0.9
                              ? 'bg-emerald-500'
                              : selectedEvent.resource.hectares_efetivos /
                                  selectedEvent.resource.hectares_mapeados >=
                                0.7
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          )}
                          style={{
                            width: `${Math.min(
                              100,
                              (selectedEvent.resource.hectares_efetivos /
                                selectedEvent.resource.hectares_mapeados) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(
                          (selectedEvent.resource.hectares_efetivos /
                            selectedEvent.resource.hectares_mapeados) *
                            100
                        )}
                        %
                      </span>
                    </div>
                  </div>
                )}

                <div className="pt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Editar
                  </Button>
                  <Button variant="default" size="sm" className="flex-1">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Selecione uma atividade no calendário para ver os detalhes</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
