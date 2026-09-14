import type { Map as MapLibreMapInstance, Marker as MapLibreMarker } from 'maplibre-gl';
import type { GeographicSample } from '@/domain/activityDocument';
import { addBasemap, type BasemapStatus } from './basemap';

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
  onBasemapStatusChange?: (status: BasemapStatus) => void;
}>;

export const initialiseRouteMap = ({
  container,
  paths,
  routeColor,
  point,
  onStatusChange,
  onBasemapStatusChange
}: InitialiseRouteMapOptions) => {
  let map: MapLibreMapInstance | undefined;
  let cancelled = false;
  let failed = false;
  let selectedPoint: GeographicSample | undefined;
  let marker: MapLibreMarker | undefined;
  let mapModule: typeof import('maplibre-gl') | undefined;
  let ready = false;
  let basemap: ReturnType<typeof addBasemap> | undefined;

  const removeMap = () => {
    basemap?.dispose();
    const currentMap = map;
    map = undefined;
    marker?.remove();
    marker = undefined;
    currentMap?.remove();
  };

  const renderSelection = () => {
    marker?.remove();
    marker = undefined;
    if (cancelled || failed || !ready || !map || !mapModule || !selectedPoint) {
      return;
    }
    const element = document.createElement('div');
    element.setAttribute('role', 'img');
    element.setAttribute(
      'aria-label',
      `Selected map position: ${selectedPoint.latitudeDegrees}, ${selectedPoint.longitudeDegrees}`
    );
    element.style.cssText = `width:18px;height:18px;border-radius:50%;background:${routeColor};border:3px solid white;box-shadow:0 0 0 2px black;`;
    marker = new mapModule.Marker({ element })
      .setLngLat([selectedPoint.longitudeDegrees, selectedPoint.latitudeDegrees])
      .addTo(map);
    return;
  };

  const dispose = () => {
    cancelled = true;
    removeMap();
    return;
  };
  const selectPoint = (point: GeographicSample | undefined) => {
    selectedPoint = point;
    renderSelection();
    return;
  };
  const controller = { dispose, selectPoint };

  const reportFailure = () => {
    if (cancelled || failed) {
      return;
    }
    failed = true;
    removeMap();
    onStatusChange?.('failed');
  };

  onStatusChange?.('loading');
  onBasemapStatusChange?.('loading');
  if (typeof WebGLRenderingContext === 'undefined') {
    onStatusChange?.('unsupported');
    return controller;
  }

  const loadMap = async () => {
    mapModule = await import('maplibre-gl');
    const { LngLatBounds, Map: MapLibreMap, setWorkerUrl } = mapModule;

    if (cancelled) {
      return;
    }

    setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

    const loadedMap = new MapLibreMap({
      attributionControl: { compact: false },
      container,
      cooperativeGestures: true,
      style: {
        version: 8,
        sources: {},
        layers: []
      }
    });

    map = loadedMap;
    loadedMap.on('error', (event) => {
      if (!event || !('sourceId' in event) || event.sourceId !== 'basemap') {
        reportFailure();
      }
      return;
    });

    loadedMap.once('load', () => {
      if (cancelled || failed) {
        return;
      }

      try {
        ready = true;
        renderSelection();
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
            basemap = addBasemap(loadedMap, 'waypoint', onBasemapStatusChange);
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
          id: 'route-casing',
          type: 'line',
          source: 'route',
          paint: { 'line-color': '#ffffff', 'line-width': 7 }
        });
        loadedMap.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          paint: {
            'line-color': routeColor,
            'line-opacity': 1,
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
          basemap = addBasemap(loadedMap, 'route-casing', onBasemapStatusChange);
        }
      } catch {
        reportFailure();
      }

      return;
    });

    return;
  };

  void loadMap().catch(reportFailure);

  return controller;
};
