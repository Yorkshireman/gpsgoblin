import type { Map as MapLibreMap } from 'maplibre-gl';

export type BasemapStatus = 'loading' | 'ready' | 'disabled' | 'unavailable';

export const addBasemap = (
  map: MapLibreMap,
  beforeLayer: string,
  onStatusChange?: (status: BasemapStatus) => void
) => {
  let disposed = false;
  let unavailable = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const fail = () => {
    if (disposed || unavailable) {
      return;
    }
    unavailable = true;
    clearTimeout(timeout);
    timeout = undefined;
    if (map.getLayer('basemap')) {
      map.removeLayer('basemap');
    }
    if (map.getSource('basemap')) {
      map.removeSource('basemap');
    }
    onStatusChange?.('unavailable');
    return;
  };

  const dispose = () => {
    disposed = true;
    clearTimeout(timeout);
    timeout = undefined;
    return;
  };

  if (process.env.NEXT_PUBLIC_BASEMAP_DISABLED === 'true') {
    onStatusChange?.('disabled');
    return { dispose };
  }

  onStatusChange?.('loading');
  map.on('error', (event) => {
    if ('sourceId' in event && event.sourceId === 'basemap') {
      fail();
    }
    return;
  });
  map.on('sourcedata', (event) => {
    if (
      !disposed &&
      !unavailable &&
      event.sourceId === 'basemap' &&
      event.coord &&
      event.isSourceLoaded
    ) {
      clearTimeout(timeout);
      timeout = undefined;
      onStatusChange?.('ready');
    }
    return;
  });
  timeout = setTimeout(fail, 15000);
  try {
    map.addSource('basemap', {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>'
    });
    map.addLayer(
      { id: 'basemap', type: 'raster', source: 'basemap' },
      beforeLayer
    );
  } catch {
    fail();
  }
  return { dispose };
};
