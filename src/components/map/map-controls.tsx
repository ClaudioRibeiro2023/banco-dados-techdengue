'use client';

import { Layers, Map as MapIcon, Grid3X3, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useMapStore } from '@/stores/map.store';
import { MAP_STYLES, type MapStyleKey } from './map-container';
import { cn } from '@/lib/utils';

const STYLE_LABELS: Record<MapStyleKey, string> = {
  streets: 'Ruas',
  light: 'Claro',
  dark: 'Escuro',
  satellite: 'Satélite',
  outdoors: 'Terreno',
};

export function MapStyleSelector() {
  const { mapStyle, setMapStyle } = useMapStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8">
          <MapIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Estilo do Mapa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(Object.keys(MAP_STYLES) as MapStyleKey[]).map((style) => (
          <DropdownMenuItem
            key={style}
            onClick={() => setMapStyle(style)}
            className={cn(mapStyle === style && 'bg-accent')}
          >
            {STYLE_LABELS[style]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MapLayerToggle() {
  const { filters, toggleClusterView, toggleHeatmapView } = useMapStore();

  return (
    <div className="flex gap-1">
      <Button
        variant={filters.showClusters ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
        onClick={toggleClusterView}
        title="Visualização em Clusters"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button
        variant={filters.showHeatmap ? 'default' : 'outline'}
        size="icon"
        className="h-8 w-8"
        onClick={toggleHeatmapView}
        title="Visualização em Heatmap"
      >
        <Flame className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface MapLegendProps {
  className?: string;
}

export function MapLegend({ className }: MapLegendProps) {
  const { filters } = useMapStore();

  if (filters.showHeatmap) {
    return (
      <div className={cn('bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg', className)}>
        <h4 className="text-xs font-medium mb-2">Densidade de POIs</h4>
        <div className="flex items-center gap-1">
          <div className="w-full h-3 rounded" style={{
            background: 'linear-gradient(to right, rgb(33,102,172), rgb(103,169,207), rgb(209,229,240), rgb(253,219,199), rgb(239,138,98), rgb(178,24,43))'
          }} />
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>Baixa</span>
          <span>Alta</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-background/90 backdrop-blur rounded-lg p-3 shadow-lg', className)}>
      <h4 className="text-xs font-medium mb-2">Tipo de Criadouro</h4>
      <div className="space-y-1">
        {[
          { color: '#10b981', label: 'Pneu' },
          { color: '#3b82f6', label: 'Caixa d\'água' },
          { color: '#f59e0b', label: 'Calha' },
          { color: '#ef4444', label: 'Piscina' },
          { color: '#8b5cf6', label: 'Lixo/Entulho' },
          { color: '#6b7280', label: 'Outros' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[10px] text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MapStatsProps {
  totalPOIs: number;
  filteredCount: number;
  className?: string;
}

export function MapStats({ totalPOIs, filteredCount, className }: MapStatsProps) {
  return (
    <div className={cn('bg-background/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg', className)}>
      <div className="flex items-center gap-4 text-xs">
        <div>
          <span className="text-muted-foreground">Total: </span>
          <span className="font-medium">{totalPOIs.toLocaleString('pt-BR')}</span>
        </div>
        {filteredCount !== totalPOIs && (
          <div>
            <span className="text-muted-foreground">Exibindo: </span>
            <span className="font-medium">{filteredCount.toLocaleString('pt-BR')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
