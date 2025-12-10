'use client';

import { Layer, Source } from 'react-map-gl/mapbox';
import type { GeoJSON } from 'geojson';

interface HeatmapLayerProps {
  data: GeoJSON.FeatureCollection;
  visible?: boolean;
}

export function HeatmapLayer({ data, visible = true }: HeatmapLayerProps) {
  if (!visible) return null;

  return (
    <Source id="heatmap-source" type="geojson" data={data}>
      <Layer
        id="heatmap-layer"
        type="heatmap"
        paint={{
          // Peso do heatmap baseado no número de pontos
          'heatmap-weight': 1,

          // Intensidade do heatmap baseada no zoom
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3,
          ],

          // Gradiente de cores do heatmap
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.2, 'rgb(103,169,207)',
            0.4, 'rgb(209,229,240)',
            0.6, 'rgb(253,219,199)',
            0.8, 'rgb(239,138,98)',
            1, 'rgb(178,24,43)',
          ],

          // Raio do heatmap baseado no zoom
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            9, 20,
            15, 40,
          ],

          // Opacidade baseada no zoom
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            15, 0.5,
          ],
        }}
      />
    </Source>
  );
}
