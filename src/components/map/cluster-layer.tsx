'use client';

import { Layer, Source } from 'react-map-gl/mapbox';
import type { GeoJSON } from 'geojson';

interface ClusterLayerProps {
  data: GeoJSON.FeatureCollection;
}

export function ClusterLayer({ data }: ClusterLayerProps) {
  return (
    <Source
      id="pois-source"
      type="geojson"
      data={data}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      {/* Camada de círculos para clusters */}
      <Layer
        id="clusters"
        type="circle"
        filter={['has', 'point_count']}
        paint={{
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#10b981', // até 100
            100,
            '#3b82f6', // até 500
            500,
            '#f59e0b', // até 1000
            1000,
            '#ef4444', // acima de 1000
          ],
          'circle-radius': [
            'step',
            ['get', 'point_count'],
            20, // até 100
            100,
            30, // até 500
            500,
            40, // até 1000
            1000,
            50, // acima de 1000
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        }}
      />

      {/* Contagem de pontos no cluster */}
      <Layer
        id="cluster-count"
        type="symbol"
        filter={['has', 'point_count']}
        layout={{
          'text-field': ['get', 'point_count_abbreviated'],
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 14,
        }}
        paint={{
          'text-color': '#ffffff',
        }}
      />

      {/* Pontos individuais (não clusterizados) */}
      <Layer
        id="unclustered-point"
        type="circle"
        filter={['!', ['has', 'point_count']]}
        paint={{
          'circle-color': ['coalesce', ['get', 'color'], '#6b7280'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
          'circle-opacity': 0.9,
        }}
      />
    </Source>
  );
}
