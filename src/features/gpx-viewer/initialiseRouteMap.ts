import type { Map as MapLibreMapInstance } from 'maplibre-gl';
import type { GeographicSample } from '@/domain/activityDocument';

type MapPath = Readonly<{
  id: string;
  samples: readonly GeographicSample[];
}>;

type InitialiseRouteMapOptions = Readonly<{
  container: HTMLDivElement;
  paths: readonly MapPath[];
  routeColor: string;
}>;

export const initialiseRouteMap = ({
  container,
  paths,
  routeColor
}: InitialiseRouteMapOptions) => {
  let map: MapLibreMapInstance | undefined;
  let cancelled = false;

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

    loadedMap.once('load', () => {
      if (cancelled) {
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

      return;
    });

    return;
  };

  void loadMap();

  return () => {
    cancelled = true;
    map?.remove();
    map = undefined;
  };
};
