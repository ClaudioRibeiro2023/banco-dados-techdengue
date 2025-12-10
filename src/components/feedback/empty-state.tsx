'use client';

import {
  Inbox,
  Search,
  FileText,
  MapPin,
  Calendar,
  Users,
  BarChart3,
  Filter,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type EmptyType =
  | 'generic'
  | 'search'
  | 'filter'
  | 'data'
  | 'map'
  | 'calendar'
  | 'users'
  | 'reports';

interface EmptyStateProps {
  type?: EmptyType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

const emptyConfig: Record<EmptyType, { icon: typeof Inbox; title: string; description: string }> = {
  generic: {
    icon: Inbox,
    title: 'Nenhum dado encontrado',
    description: 'Não há dados para exibir no momento.',
  },
  search: {
    icon: Search,
    title: 'Nenhum resultado',
    description: 'Sua busca não retornou resultados. Tente termos diferentes.',
  },
  filter: {
    icon: Filter,
    title: 'Nenhum resultado com esses filtros',
    description: 'Tente ajustar os filtros para ver mais resultados.',
  },
  data: {
    icon: BarChart3,
    title: 'Sem dados disponíveis',
    description: 'Os dados ainda não foram carregados ou não existem para o período selecionado.',
  },
  map: {
    icon: MapPin,
    title: 'Nenhum ponto no mapa',
    description: 'Não há criadouros identificados para a área e período selecionados.',
  },
  calendar: {
    icon: Calendar,
    title: 'Nenhuma atividade',
    description: 'Não há atividades programadas para este período.',
  },
  users: {
    icon: Users,
    title: 'Nenhum piloto encontrado',
    description: 'Não há pilotos cadastrados ou ativos no momento.',
  },
  reports: {
    icon: FileText,
    title: 'Nenhum relatório',
    description: 'Você ainda não gerou nenhum relatório.',
  },
};

export function EmptyState({
  type = 'generic',
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  const config = emptyConfig[type];
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={cn('flex items-center gap-3 p-4 rounded-lg bg-muted/50 text-muted-foreground', className)}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground">{title || config.title}</p>
          <p className="text-xs truncate">{description || config.description}</p>
        </div>
        {action && (
          <Button size="sm" variant="outline" onClick={action.onClick}>
            {action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={cn('border-dashed', className)}>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 rounded-full bg-muted mb-4">
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-2">{title || config.title}</h3>
        <p className="text-muted-foreground max-w-sm mb-6">
          {description || config.description}
        </p>
        {action && (
          <Button onClick={action.onClick}>
            <Plus className="h-4 w-4 mr-2" />
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function InlineEmpty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center gap-2 p-6 text-muted-foreground text-sm">
      <Inbox className="h-4 w-4" />
      <span>{message}</span>
    </div>
  );
}
