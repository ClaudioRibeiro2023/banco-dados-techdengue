'use client';

import { useCallback, useRef, useState } from 'react';
import Map, {
  NavigationControl,
  GeolocateControl,
  ScaleControl,
  FullscreenControl,
  MapRef,
  ViewStateChangeEvent,
} from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { cn } from '@/lib/utils';
import { MAPBOX_CONFIG } from '@/lib/config';

const MAPBOX_TOKEN = MAPBOX_CONFIG.accessToken;

// Estilos de mapa disponíveis
export const MAP_STYLES = {
  streets: 'mapbox://styles/mapbox/streets-v12',
  light: 'mapbox://styles/mapbox/light-v11',
  dark: 'mapbox://styles/mapbox/dark-v11',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
} as const;

export type MapStyleKey = keyof typeof MAP_STYLES;

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch?: number;
  bearing?: number;
}

interface MapContainerProps {
  children?: React.ReactNode;
  className?: string;
  initialViewState?: Partial<ViewState>;
  mapStyle?: MapStyleKey;
  onMove?: (viewState: ViewState) => void;
  onLoad?: () => void;
  interactive?: boolean;
}

// Centro padrão: Brasil
const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -49.2646,
  latitude: -16.6869,
  zoom: 5,
  pitch: 0,
  bearing: 0,
};

export function MapContainer({
  children,
  className,
  initialViewState,
  mapStyle = 'streets',
  onMove,
  onLoad,
  interactive = true,
}: MapContainerProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<ViewState>({
    ...DEFAULT_VIEW_STATE,
    ...initialViewState,
  });

  const handleMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewState(evt.viewState as ViewState);
      onMove?.(evt.viewState as ViewState);
    },
    [onMove]
  );

  const handleLoad = useCallback(() => {
    onLoad?.();
  }, [onLoad]);

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-muted text-muted-foreground',
          className
        )}
      >
        <div className="text-center p-4">
          <p className="font-medium">Mapbox Token não configurado</p>
          <p className="text-sm mt-1">
            Configure NEXT_PUBLIC_MAPBOX_TOKEN no arquivo .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <Map
        ref={mapRef}
        {...viewState}
        onMove={handleMove}
        onLoad={handleLoad}
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle={MAP_STYLES[mapStyle]}
        style={{ width: '100%', height: '100%' }}
        interactive={interactive}
        attributionControl={false}
      >
        {/* Controles de navegação */}
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <FullscreenControl position="top-right" />
        <ScaleControl position="bottom-left" />

        {/* Conteúdo customizado (layers, markers, etc) */}
        {children}
      </Map>
    </div>
  );
}

// Hook para acessar o mapa
export function useMapRef() {
  return useRef<MapRef>(null);
}
