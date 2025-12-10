'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  PenTool,
  Trash2,
  Download,
  Filter,
  Square,
  X,
  Check,
  FileJson,
  Table,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as turf from '@turf/turf';
import type { Position, Feature, Polygon, Point } from 'geojson';

export type DrawMode = 'none' | 'polygon' | 'rectangle';

export interface SelectedArea {
  id: string;
  type: 'polygon' | 'rectangle';
  coordinates: Position[];
  area: number; // in square meters
  center: Position;
  bbox: [number, number, number, number];
  createdAt: Date;
}

export interface PointFeature {
  id: string;
  coordinates: Position;
  properties?: Record<string, unknown>;
}

interface MapPolygonSelectProps {
  onModeChange: (mode: DrawMode) => void;
  currentMode: DrawMode;
  selectedArea: SelectedArea | null;
  onClearSelection: () => void;
  pointsInArea: number;
  onExportSelection: (format: 'geojson' | 'csv') => void;
  onFilterBySelection: () => void;
  className?: string;
}

export function MapPolygonSelect({
  onModeChange,
  currentMode,
  selectedArea,
  onClearSelection,
  pointsInArea,
  onExportSelection,
  onFilterBySelection,
  className,
}: MapPolygonSelectProps) {
  const formatArea = (areaM2: number) => {
    if (areaM2 >= 10000) {
      return `${(areaM2 / 10000).toFixed(2)} ha`;
    }
    return `${areaM2.toFixed(0)} m²`;
  };

  return (
    <TooltipProvider>
      <div className={cn('flex items-center gap-2', className)}>
        {/* Draw Tools */}
        <div className="flex gap-1 bg-card rounded-lg p-1 shadow-lg border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === 'polygon' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => onModeChange(currentMode === 'polygon' ? 'none' : 'polygon')}
              >
                <PenTool className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Desenhar Polígono</p>
              <p className="text-xs text-muted-foreground">
                Clique para adicionar vértices, duplo clique para fechar
              </p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={currentMode === 'rectangle' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 w-9 p-0"
                onClick={() => onModeChange(currentMode === 'rectangle' ? 'none' : 'rectangle')}
              >
                <Square className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Desenhar Retângulo</p>
              <p className="text-xs text-muted-foreground">
                Clique e arraste para criar retângulo de seleção
              </p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Drawing Mode Indicator */}
        {currentMode !== 'none' && (
          <Badge variant="secondary" className="gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            {currentMode === 'polygon' ? 'Desenhando polígono...' : 'Desenhando retângulo...'}
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 -mr-1"
              onClick={() => onModeChange('none')}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        )}

        {/* Selection Info & Actions */}
        {selectedArea && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {pointsInArea} POIs selecionados
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72" align="start">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Área Selecionada</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-muted-foreground text-xs">Área</p>
                      <p className="font-medium">{formatArea(selectedArea.area)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <p className="text-muted-foreground text-xs">POIs</p>
                      <p className="font-medium">{pointsInArea}</p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-muted p-2">
                      <p className="text-muted-foreground text-xs">Centro</p>
                      <p className="font-medium text-xs">
                        {selectedArea.center[1].toFixed(6)}, {selectedArea.center[0].toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full gap-2"
                    onClick={onFilterBySelection}
                  >
                    <Filter className="h-4 w-4" />
                    Filtrar por Seleção
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Exportar Seleção
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onExportSelection('geojson')}>
                        <FileJson className="h-4 w-4 mr-2" />
                        Exportar como GeoJSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onExportSelection('csv')}>
                        <Table className="h-4 w-4 mr-2" />
                        Exportar como CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2 text-destructive hover:text-destructive"
                    onClick={onClearSelection}
                  >
                    <Trash2 className="h-4 w-4" />
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}

// Hook for polygon selection logic
export function usePolygonSelection<T extends PointFeature>(allPoints: T[]) {
  const [selectedArea, setSelectedArea] = useState<SelectedArea | null>(null);
  const [drawingCoordinates, setDrawingCoordinates] = useState<Position[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  const startDrawing = useCallback((point: Position) => {
    setIsDrawing(true);
    setDrawingCoordinates([point]);
  }, []);

  const addPoint = useCallback((point: Position) => {
    if (!isDrawing) return;
    setDrawingCoordinates((prev) => [...prev, point]);
  }, [isDrawing]);

  const finishPolygon = useCallback(() => {
    if (drawingCoordinates.length < 3) {
      setDrawingCoordinates([]);
      setIsDrawing(false);
      return null;
    }

    // Close the polygon
    const closedCoords = [...drawingCoordinates, drawingCoordinates[0]];
    const polygon = turf.polygon([closedCoords]);
    const area = turf.area(polygon);
    const center = turf.center(polygon);
    const bbox = turf.bbox(polygon);

    const newArea: SelectedArea = {
      id: `area-${Date.now()}`,
      type: 'polygon',
      coordinates: closedCoords,
      area,
      center: center.geometry.coordinates as Position,
      bbox: bbox as [number, number, number, number],
      createdAt: new Date(),
    };

    setSelectedArea(newArea);
    setDrawingCoordinates([]);
    setIsDrawing(false);

    return newArea;
  }, [drawingCoordinates]);

  const createRectangle = useCallback((start: Position, end: Position) => {
    const minLng = Math.min(start[0], end[0]);
    const maxLng = Math.max(start[0], end[0]);
    const minLat = Math.min(start[1], end[1]);
    const maxLat = Math.max(start[1], end[1]);

    const coordinates: Position[] = [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat],
    ];

    const polygon = turf.polygon([coordinates]);
    const area = turf.area(polygon);
    const center = turf.center(polygon);

    const newArea: SelectedArea = {
      id: `area-${Date.now()}`,
      type: 'rectangle',
      coordinates,
      area,
      center: center.geometry.coordinates as Position,
      bbox: [minLng, minLat, maxLng, maxLat],
      createdAt: new Date(),
    };

    setSelectedArea(newArea);
    return newArea;
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedArea(null);
    setDrawingCoordinates([]);
    setIsDrawing(false);
  }, []);

  const getPointsInSelection = useCallback((): T[] => {
    if (!selectedArea) return [];

    const polygon = turf.polygon([selectedArea.coordinates]);

    return allPoints.filter((point) => {
      const pt = turf.point(point.coordinates);
      return turf.booleanPointInPolygon(pt, polygon);
    });
  }, [selectedArea, allPoints]);

  const pointsInArea = selectedArea ? getPointsInSelection() : [];

  return {
    selectedArea,
    drawingCoordinates,
    isDrawing,
    startDrawing,
    addPoint,
    finishPolygon,
    createRectangle,
    clearSelection,
    getPointsInSelection,
    pointsInArea,
    pointsInAreaCount: pointsInArea.length,
  };
}

// Export selection to GeoJSON with included points
export function exportSelectionToGeoJSON<T extends PointFeature>(
  area: SelectedArea,
  points: T[]
): string {
  const areaFeature = {
    type: 'Feature' as const,
    properties: {
      type: 'selection-area',
      areaType: area.type,
      areaSqMeters: area.area,
      pointCount: points.length,
      createdAt: area.createdAt.toISOString(),
    },
    geometry: {
      type: 'Polygon' as const,
      coordinates: [area.coordinates],
    },
  };

  const pointFeatures = points.map((p) => ({
    type: 'Feature' as const,
    properties: {
      id: p.id,
      ...p.properties,
    },
    geometry: {
      type: 'Point' as const,
      coordinates: p.coordinates,
    },
  }));

  const featureCollection = {
    type: 'FeatureCollection' as const,
    features: [areaFeature, ...pointFeatures],
  };

  return JSON.stringify(featureCollection, null, 2);
}

// Export selection points to CSV
export function exportSelectionToCSV<T extends PointFeature>(
  points: T[],
  additionalFields?: (keyof T['properties'])[]
): string {
  const baseHeaders = ['ID', 'Latitude', 'Longitude'];
  const extraHeaders = additionalFields || [];
  const headers = [...baseHeaders, ...extraHeaders.map(String)];

  const rows = points.map((p) => {
    const baseRow = [
      p.id,
      p.coordinates[1].toFixed(6),
      p.coordinates[0].toFixed(6),
    ];
    const extraRow = extraHeaders.map((field) =>
      String(p.properties?.[field as string] ?? '')
    );
    return [...baseRow, ...extraRow];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
