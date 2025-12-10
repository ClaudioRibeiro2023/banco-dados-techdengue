'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Ruler,
  Square,
  Circle,
  Trash2,
  Download,
  MapPin,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import * as turf from '@turf/turf';
import type { Feature, Polygon, LineString, Point, Position } from 'geojson';

export type MeasurementMode = 'none' | 'distance' | 'area' | 'radius';

export interface Measurement {
  id: string;
  type: 'distance' | 'area' | 'radius';
  geometry: Feature<Polygon | LineString | Point>;
  value: number;
  unit: string;
  coordinates: Position[];
  createdAt: Date;
}

interface MapMeasurementToolsProps {
  onModeChange: (mode: MeasurementMode) => void;
  currentMode: MeasurementMode;
  measurements: Measurement[];
  onClearMeasurements: () => void;
  onDeleteMeasurement: (id: string) => void;
  onExportMeasurements: () => void;
  className?: string;
}

export function MapMeasurementTools({
  onModeChange,
  currentMode,
  measurements,
  onClearMeasurements,
  onDeleteMeasurement,
  onExportMeasurements,
  className,
}: MapMeasurementToolsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const tools = [
    {
      id: 'distance' as MeasurementMode,
      label: 'Medir Distância',
      icon: Ruler,
      description: 'Clique nos pontos para medir distância',
    },
    {
      id: 'area' as MeasurementMode,
      label: 'Medir Área',
      icon: Square,
      description: 'Desenhe um polígono para medir área',
    },
    {
      id: 'radius' as MeasurementMode,
      label: 'Raio/Buffer',
      icon: Circle,
      description: 'Clique para criar um buffer circular',
    },
  ];

  const handleCopyCoordinates = useCallback((measurement: Measurement) => {
    const coordsText = measurement.coordinates
      .map((c) => `${c[1].toFixed(6)}, ${c[0].toFixed(6)}`)
      .join('\n');
    navigator.clipboard.writeText(coordsText);
    setCopiedId(measurement.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const formatValue = (measurement: Measurement) => {
    if (measurement.type === 'distance') {
      if (measurement.value >= 1000) {
        return `${(measurement.value / 1000).toFixed(2)} km`;
      }
      return `${measurement.value.toFixed(1)} m`;
    }
    if (measurement.type === 'area') {
      if (measurement.value >= 10000) {
        return `${(measurement.value / 10000).toFixed(2)} ha`;
      }
      return `${measurement.value.toFixed(1)} m²`;
    }
    if (measurement.type === 'radius') {
      return `${measurement.value.toFixed(0)} m`;
    }
    return `${measurement.value} ${measurement.unit}`;
  };

  const totalArea = useMemo(() => {
    return measurements
      .filter((m) => m.type === 'area')
      .reduce((acc, m) => acc + m.value, 0);
  }, [measurements]);

  const totalDistance = useMemo(() => {
    return measurements
      .filter((m) => m.type === 'distance')
      .reduce((acc, m) => acc + m.value, 0);
  }, [measurements]);

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col gap-2', className)}>
        {/* Tool Buttons */}
        <div className="flex gap-1 bg-card rounded-lg p-1 shadow-lg border">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = currentMode === tool.id;

            return (
              <Tooltip key={tool.id}>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={cn(
                      'h-9 w-9 p-0',
                      isActive && 'bg-primary text-primary-foreground'
                    )}
                    onClick={() => onModeChange(isActive ? 'none' : tool.id)}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="font-medium">{tool.label}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {measurements.length > 0 && (
            <>
              <div className="w-px bg-border mx-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                    onClick={onClearMeasurements}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Limpar medições</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 p-0"
                    onClick={onExportMeasurements}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Exportar medições</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        {/* Active Mode Indicator */}
        {currentMode !== 'none' && (
          <div className="bg-primary/10 text-primary rounded-lg px-3 py-2 text-sm flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>
              {currentMode === 'distance' && 'Clique nos pontos para medir. Duplo clique para finalizar.'}
              {currentMode === 'area' && 'Clique para adicionar vértices. Duplo clique para fechar.'}
              {currentMode === 'radius' && 'Clique no centro e arraste para definir o raio.'}
            </span>
          </div>
        )}

        {/* Measurements List */}
        {measurements.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <MapPin className="h-4 w-4" />
                {measurements.length} medição(ões)
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Medições</h4>
                  <div className="flex gap-2">
                    {totalArea > 0 && (
                      <Badge variant="secondary">
                        {(totalArea / 10000).toFixed(2)} ha total
                      </Badge>
                    )}
                    {totalDistance > 0 && (
                      <Badge variant="secondary">
                        {(totalDistance / 1000).toFixed(2)} km total
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between rounded-lg border p-2"
                    >
                      <div className="flex items-center gap-2">
                        {measurement.type === 'distance' && <Ruler className="h-4 w-4 text-blue-500" />}
                        {measurement.type === 'area' && <Square className="h-4 w-4 text-green-500" />}
                        {measurement.type === 'radius' && <Circle className="h-4 w-4 text-purple-500" />}
                        <div>
                          <p className="text-sm font-medium">
                            {formatValue(measurement)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {measurement.coordinates.length} ponto(s)
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => handleCopyCoordinates(measurement)}
                            >
                              {copiedId === measurement.id ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copiar coordenadas</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              onClick={() => onDeleteMeasurement(measurement.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Remover</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </TooltipProvider>
  );
}

// Hook for measurement calculations
export function useMeasurementCalculations() {
  const calculateDistance = useCallback((coordinates: Position[]): number => {
    if (coordinates.length < 2) return 0;

    const line = turf.lineString(coordinates);
    return turf.length(line, { units: 'meters' });
  }, []);

  const calculateArea = useCallback((coordinates: Position[]): number => {
    if (coordinates.length < 3) return 0;

    // Close the polygon if not already closed
    const closedCoords = [...coordinates];
    if (
      closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
      closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
    ) {
      closedCoords.push(closedCoords[0]);
    }

    const polygon = turf.polygon([closedCoords]);
    return turf.area(polygon);
  }, []);

  const createBuffer = useCallback(
    (center: Position, radiusMeters: number): Feature<Polygon> => {
      const point = turf.point(center);
      return turf.buffer(point, radiusMeters, { units: 'meters' }) as Feature<Polygon>;
    },
    []
  );

  const getCenter = useCallback((coordinates: Position[]): Position => {
    if (coordinates.length === 0) return [0, 0];
    if (coordinates.length === 1) return coordinates[0];

    const features = turf.featureCollection(
      coordinates.map((c) => turf.point(c))
    );
    const center = turf.center(features);
    return center.geometry.coordinates as Position;
  }, []);

  const getBoundingBox = useCallback(
    (coordinates: Position[]): [number, number, number, number] | null => {
      if (coordinates.length === 0) return null;

      const features = turf.featureCollection(
        coordinates.map((c) => turf.point(c))
      );
      return turf.bbox(features) as [number, number, number, number];
    },
    []
  );

  const pointInPolygon = useCallback(
    (point: Position, polygon: Position[]): boolean => {
      const closedCoords = [...polygon];
      if (
        closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
        closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
      ) {
        closedCoords.push(closedCoords[0]);
      }

      const pt = turf.point(point);
      const poly = turf.polygon([closedCoords]);
      return turf.booleanPointInPolygon(pt, poly);
    },
    []
  );

  const getPointsInPolygon = useCallback(
    <T extends { coordinates: Position }>(
      points: T[],
      polygon: Position[]
    ): T[] => {
      const closedCoords = [...polygon];
      if (
        closedCoords[0][0] !== closedCoords[closedCoords.length - 1][0] ||
        closedCoords[0][1] !== closedCoords[closedCoords.length - 1][1]
      ) {
        closedCoords.push(closedCoords[0]);
      }

      const poly = turf.polygon([closedCoords]);

      return points.filter((p) => {
        const pt = turf.point(p.coordinates);
        return turf.booleanPointInPolygon(pt, poly);
      });
    },
    []
  );

  const distanceBetweenPoints = useCallback(
    (from: Position, to: Position, unit: 'meters' | 'kilometers' = 'meters'): number => {
      const fromPoint = turf.point(from);
      const toPoint = turf.point(to);
      return turf.distance(fromPoint, toPoint, { units: unit });
    },
    []
  );

  return {
    calculateDistance,
    calculateArea,
    createBuffer,
    getCenter,
    getBoundingBox,
    pointInPolygon,
    getPointsInPolygon,
    distanceBetweenPoints,
  };
}

// Export measurements to GeoJSON
export function exportMeasurementsToGeoJSON(measurements: Measurement[]): string {
  const features = measurements.map((m) => ({
    type: 'Feature' as const,
    properties: {
      id: m.id,
      type: m.type,
      value: m.value,
      unit: m.unit,
      createdAt: m.createdAt.toISOString(),
    },
    geometry: m.geometry.geometry,
  }));

  const featureCollection = {
    type: 'FeatureCollection' as const,
    features,
  };

  return JSON.stringify(featureCollection, null, 2);
}

// Export measurements to CSV
export function exportMeasurementsToCSV(measurements: Measurement[]): string {
  const headers = ['ID', 'Tipo', 'Valor', 'Unidade', 'Coordenadas', 'Data'];
  const rows = measurements.map((m) => [
    m.id,
    m.type,
    m.value.toString(),
    m.unit,
    m.coordinates.map((c) => `${c[1].toFixed(6)},${c[0].toFixed(6)}`).join('; '),
    m.createdAt.toISOString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
