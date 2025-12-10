'use client';

import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/features/atividades/hooks/use-calendario-atividades';

import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales,
});

const messages = {
  allDay: 'Dia inteiro',
  previous: 'Anterior',
  next: 'Próximo',
  today: 'Hoje',
  month: 'Mês',
  week: 'Semana',
  day: 'Dia',
  agenda: 'Agenda',
  date: 'Data',
  time: 'Hora',
  event: 'Evento',
  noEventsInRange: 'Não há atividades neste período.',
  showMore: (total: number) => `+${total} mais`,
};

interface ActivityCalendarProps {
  events: CalendarEvent[];
  currentDate: Date;
  onDateChange: (date: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
  eventStyleGetter: (event: CalendarEvent) => { style: React.CSSProperties };
  isLoading?: boolean;
}

export function ActivityCalendar({
  events,
  currentDate,
  onDateChange,
  onSelectEvent,
  eventStyleGetter,
  isLoading,
}: ActivityCalendarProps) {
  const [view, setView] = useState<View>(Views.MONTH);

  const handleNavigate = useCallback(
    (newDate: Date) => {
      onDateChange(newDate);
    },
    [onDateChange]
  );

  const handleViewChange = useCallback((newView: View) => {
    setView(newView);
  }, []);

  const CustomToolbar = useCallback(
    ({ onNavigate, label }: { onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void; label: string }) => (
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => onNavigate('PREV')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => onNavigate('NEXT')}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
            Hoje
          </Button>
        </div>
        <h2 className="text-lg font-semibold capitalize">{label}</h2>
        <div className="flex items-center gap-1">
          <Button
            variant={view === Views.MONTH ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView(Views.MONTH)}
          >
            Mês
          </Button>
          <Button
            variant={view === Views.WEEK ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView(Views.WEEK)}
          >
            Semana
          </Button>
          <Button
            variant={view === Views.AGENDA ? 'default' : 'outline'}
            size="sm"
            onClick={() => setView(Views.AGENDA)}
          >
            Agenda
          </Button>
        </div>
      </div>
    ),
    [view]
  );

  return (
    <div className={cn('h-[600px]', isLoading && 'opacity-50 pointer-events-none')}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        date={currentDate}
        view={view}
        onNavigate={handleNavigate}
        onView={handleViewChange}
        onSelectEvent={onSelectEvent}
        eventPropGetter={eventStyleGetter}
        messages={messages}
        culture="pt-BR"
        components={{
          toolbar: CustomToolbar,
        }}
        popup
        selectable
        className="rounded-lg"
      />
    </div>
  );
}
