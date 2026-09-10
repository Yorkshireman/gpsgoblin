import type { Map as MapLibreMapInstance } from 'maplibre-gl';
import type { GeographicSample } from '@/domain/activityDocument';

export type MapPath = Readonly<{
  id: string;
  samples: readonly GeographicSample[];
}>;

export type MapStatus = 'loading' | 'ready' | 'unsupported' | 'failed';

type InitialiseRouteMapOptions = Readonly<{
  container: HTMLDivElement;
  paths: readonly MapPath[];
  routeColor: string;
  point?: GeographicSample;
  onStatusChange?: (status: MapStatus) => void;
}>;

export const initialiseRouteMap = ({
  container,
  paths,
  routeColor,
  point,
  onStatusChange
}: InitialiseRouteMapOptions) => {
  let map: MapLibreMapInstance | undefined;
  let cancelled = false;
  let failed = false;

  const removeMap = () => {
    const currentMap = map;
    map = undefined;
    currentMap?.remove();
  };

  const dispose = () => {
    cancelled = true;
    removeMap();
  };

  const reportFailure = () => {
    if (cancelled || failed) {
      return;
    }
    failed = true;
    removeMap();
    onStatusChange?.('failed');
  };

  onStatusChange?.('loading');
  if (typeof WebGLRenderingContext === 'undefined') {
    onStatusChange?.('unsupported');
    return dispose;
  }

  container.scrollIntoView({ block: 'nearest' });

  const loadMap = async () => {
    const { LngLatBounds, Map: MapLibreMap, setWorkerUrl } = await import('maplibre-gl');

    if (cancelled) {
      return;
    }

    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

    const loadedMap = new MapLibreMap({
      attributionControl: false,
      container,
      cooperativeGestures: true,
      style: {
        version: 8,
        sources: {},
        layers: []
      }
    });

    map = loadedMap;
    loadedMap.on('error', reportFailure);

    loadedMap.once('load', () => {
      if (cancelled || failed) {
        return;
      }

      try {
        if (point) {
          loadedMap.addSource('waypoint', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: { waypointId: point.id },
              geometry: {
                type: 'Point',
                coordinates: [point.longitudeDegrees, point.latitudeDegrees]
              }
            }
          });

          loadedMap.addLayer({
            id: 'waypoint',
            type: 'circle',
            source: 'waypoint',
            paint: {
              'circle-color': routeColor,
              'circle-radius': 7,
              'circle-stroke-color': '#ffffff',
              'circle-stroke-width': 2
            }
          });

          loadedMap.jumpTo({
            center: [point.longitudeDegrees, point.latitudeDegrees],
            zoom: 14
          });
          if (!failed) {
            onStatusChange?.('ready');
          }
          return;
        }

        loadedMap.addSource('route', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: paths
              .filter(path => {
                return path.samples.length > 1;
              })
              .map(path => {
                return {
                  type: 'Feature',
                  properties: {
                    pathId: path.id
                  },
                  geometry: {
                    type: 'LineString',
                    coordinates: path.samples.map(sample => {
                      return [sample.longitudeDegrees, sample.latitudeDegrees];
                    })
                  }
                };
              })
          }
        });

        loadedMap.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': routeColor,
            'line-opacity': 0.9,
            'line-width': 4
          }
        });

        const bounds = new LngLatBounds();

        for (const path of paths) {
          for (const sample of path.samples) {
            bounds.extend([sample.longitudeDegrees, sample.latitudeDegrees]);
          }
        }

        if (!bounds.isEmpty()) {
          loadedMap.fitBounds(bounds, {
            duration: 0,
            padding: 32
          });
        }

        if (!failed) {
          onStatusChange?.('ready');
        }
      } catch {
        reportFailure();
      }

      return;
    });

    return;
  };

  void loadMap().catch(reportFailure);

  return dispose;
};
