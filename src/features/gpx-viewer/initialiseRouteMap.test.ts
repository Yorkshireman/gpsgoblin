import { waitFor } from '@testing-library/react';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';

import { initialiseRouteMap } from './initialiseRouteMap';

const mockMap = {
  addLayer: jest.fn(),
  addSource: jest.fn(),
  fitBounds: jest.fn(),
  jumpTo: jest.fn(),
  once: jest.fn<void, [string, () => void]>(),
  remove: jest.fn()
};

const mockBounds = {
  extend: jest.fn(),
  isEmpty: jest.fn()
};

// MapLibre only exposes an ESM entry point, which Jest's CommonJS resolver cannot load.
jest.mock(
  'maplibre-gl',
  () => {
    return {
      LngLatBounds: jest.fn().mockImplementation(() => {
        return mockBounds;
      }),
      Map: jest.fn().mockImplementation(() => {
        return mockMap;
      }),
      setWorkerUrl: jest.fn()
    };
  },
  { virtual: true }
);

const emitMapLoad = () => {
  const handleLoad = mockMap.once.mock.calls[0]?.[1];

  if (!handleLoad) {
    throw new Error('The map has no load handler.');
  }

  handleLoad();
  return;
};

describe('initialiseRouteMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockBounds.isEmpty.mockReturnValue(false);
  });

  it('draws separate paths without bridging gaps and fits all supplied points', async () => {
    const container = document.createElement('div');
    const dispose = initialiseRouteMap({
      container,
      routeColor: '#22c55e',
      paths: [
        {
          id: 'segment-0',
          samples: [
            { id: 'sample-0', longitudeDegrees: -1, latitudeDegrees: 53 },
            { id: 'sample-1', longitudeDegrees: -2, latitudeDegrees: 54 }
          ]
        },
        {
          id: 'segment-1',
          samples: [
            { id: 'sample-2', longitudeDegrees: -3, latitudeDegrees: 55 },
            { id: 'sample-3', longitudeDegrees: -4, latitudeDegrees: 56 }
          ]
        },
        {
          id: 'segment-2',
          samples: [{ id: 'sample-4', longitudeDegrees: -5, latitudeDegrees: 57 }]
        }
      ]
    });

    await waitFor(() => {
      expect(MapLibreMap).toHaveBeenCalledTimes(1);
    });
    emitMapLoad();

    expect(setWorkerUrl).toHaveBeenCalledWith('/maplibre/maplibre-gl-worker.mjs');
    expect(MapLibreMap).toHaveBeenCalledWith(
      expect.objectContaining({ container, cooperativeGestures: true })
    );
    expect(mockMap.addSource).toHaveBeenCalledWith('route', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: { pathId: 'segment-0' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-1, 53],
                [-2, 54]
              ]
            }
          },
          {
            type: 'Feature',
            properties: { pathId: 'segment-1' },
            geometry: {
              type: 'LineString',
              coordinates: [
                [-3, 55],
                [-4, 56]
              ]
            }
          }
        ]
      }
    });
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'route',
        type: 'line',
        paint: {
          'line-color': '#22c55e',
          'line-opacity': 0.9,
          'line-width': 4
        }
      })
    );
    expect(mockBounds.extend.mock.calls).toEqual([
      [[-1, 53]],
      [[-2, 54]],
      [[-3, 55]],
      [[-4, 56]],
      [[-5, 57]]
    ]);
    expect(mockMap.fitBounds).toHaveBeenCalledWith(mockBounds, { duration: 0, padding: 32 });

    dispose();
    expect(mockMap.remove).toHaveBeenCalledTimes(1);
  });

  it('renders a waypoint as a centred point without drawing a line', async () => {
    const dispose = initialiseRouteMap({
      container: document.createElement('div'),
      routeColor: '#22c55e',
      paths: [],
      point: { id: 'waypoint-0', longitudeDegrees: -1.2, latitudeDegrees: 53.1 }
    });

    await waitFor(() => {
      expect(MapLibreMap).toHaveBeenCalledTimes(1);
    });
    emitMapLoad();

    expect(mockMap.addSource).toHaveBeenCalledTimes(1);
    expect(mockMap.addSource).toHaveBeenCalledWith('waypoint', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: { waypointId: 'waypoint-0' },
        geometry: { type: 'Point', coordinates: [-1.2, 53.1] }
      }
    });
    expect(mockMap.addLayer).toHaveBeenCalledTimes(1);
    expect(mockMap.addLayer).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'waypoint',
        type: 'circle'
      })
    );
    expect(mockMap.jumpTo).toHaveBeenCalledWith({ center: [-1.2, 53.1], zoom: 14 });
    expect(mockMap.fitBounds).not.toHaveBeenCalled();

    dispose();
    expect(mockMap.remove).toHaveBeenCalledTimes(1);
  });

  it('does not create a map when disposed before the library finishes loading', async () => {
    const dispose = initialiseRouteMap({
      container: document.createElement('div'),
      paths: [],
      routeColor: '#22c55e'
    });

    dispose();
    await import('maplibre-gl');

    expect(MapLibreMap).not.toHaveBeenCalled();
    expect(mockMap.remove).not.toHaveBeenCalled();
  });

  it('removes the map and ignores a late load event after disposal', async () => {
    const dispose = initialiseRouteMap({
      container: document.createElement('div'),
      paths: [],
      routeColor: '#22c55e'
    });

    await waitFor(() => {
      expect(MapLibreMap).toHaveBeenCalledTimes(1);
    });

    dispose();
    emitMapLoad();

    expect(mockMap.remove).toHaveBeenCalledTimes(1);
    expect(mockMap.addSource).not.toHaveBeenCalled();
    expect(mockMap.addLayer).not.toHaveBeenCalled();
    expect(mockMap.fitBounds).not.toHaveBeenCalled();
  });

  it('does not fit empty bounds when no points were supplied', async () => {
    mockBounds.isEmpty.mockReturnValue(true);

    const dispose = initialiseRouteMap({
      container: document.createElement('div'),
      paths: [],
      routeColor: '#22c55e'
    });

    await waitFor(() => {
      expect(MapLibreMap).toHaveBeenCalledTimes(1);
    });
    emitMapLoad();

    expect(mockMap.fitBounds).not.toHaveBeenCalled();

    dispose();
  });
});
