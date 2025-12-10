'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useMapStore } from '@/stores/map.store';
import { cn } from '@/lib/utils';

const TIPOS_CRIADOURO = [
  { id: 'pneu', label: 'Pneu', color: '#10b981' },
  { id: 'caixa_dagua', label: 'Caixa d\'água', color: '#3b82f6' },
  { id: 'calha', label: 'Calha', color: '#f59e0b' },
  { id: 'piscina', label: 'Piscina', color: '#ef4444' },
  { id: 'lixo', label: 'Lixo/Entulho', color: '#8b5cf6' },
  { id: 'outros', label: 'Outros', color: '#6b7280' },
];

const STATUS_DEVOLUTIVA = [
  { id: 'pendente', label: 'Pendente', color: '#f59e0b' },
  { id: 'em_analise', label: 'Em Análise', color: '#3b82f6' },
  { id: 'tratado', label: 'Tratado', color: '#10b981' },
  { id: 'descartado', label: 'Descartado', color: '#6b7280' },
];

interface MapFiltersPanelProps {
  className?: string;
}

export function MapFiltersPanel({ className }: MapFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { filters, setFilters, resetFilters } = useMapStore();

  const handleTipoChange = (tipo: string, checked: boolean) => {
    const newTipos = checked
      ? [...filters.tipoCriadouro, tipo]
      : filters.tipoCriadouro.filter((t) => t !== tipo);
    setFilters({ tipoCriadouro: newTipos });
  };

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked
      ? [...filters.statusDevolutiva, status]
      : filters.statusDevolutiva.filter((s) => s !== status);
    setFilters({ statusDevolutiva: newStatus });
  };

  const hasActiveFilters =
    filters.tipoCriadouro.length > 0 || filters.statusDevolutiva.length > 0;

  return (
    <div
      className={cn(
        'absolute top-4 left-4 z-10 transition-all duration-300',
        isOpen ? 'w-64' : 'w-10',
        className
      )}
    >
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 top-2 z-20 h-6 w-6 rounded-full shadow-md bg-background"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </Button>

      {/* Panel Content */}
      <div
        className={cn(
          'bg-background/95 backdrop-blur rounded-lg shadow-lg overflow-hidden transition-all duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium text-sm">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={resetFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Limpar
            </Button>
          )}
        </div>

        {/* Filters Content */}
        <div className="p-3 space-y-4 max-h-[400px] overflow-y-auto">
          {/* Tipo de Criadouro */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tipo de Criadouro
            </Label>
            <div className="mt-2 space-y-2">
              {TIPOS_CRIADOURO.map((tipo) => (
                <div key={tipo.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`tipo-${tipo.id}`}
                    checked={filters.tipoCriadouro.includes(tipo.id)}
                    onCheckedChange={(checked) =>
                      handleTipoChange(tipo.id, checked as boolean)
                    }
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tipo.color }}
                  />
                  <Label
                    htmlFor={`tipo-${tipo.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {tipo.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Status de Devolutiva */}
          <div>
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Status da Devolutiva
            </Label>
            <div className="mt-2 space-y-2">
              {STATUS_DEVOLUTIVA.map((status) => (
                <div key={status.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`status-${status.id}`}
                    checked={filters.statusDevolutiva.includes(status.id)}
                    onCheckedChange={(checked) =>
                      handleStatusChange(status.id, checked as boolean)
                    }
                  />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: status.color }}
                  />
                  <Label
                    htmlFor={`status-${status.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsed state indicator */}
      {!isOpen && hasActiveFilters && (
        <div className="bg-primary text-primary-foreground rounded-lg p-2 flex items-center justify-center">
          <Filter className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
