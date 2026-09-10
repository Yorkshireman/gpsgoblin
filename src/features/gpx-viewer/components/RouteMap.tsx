'use client';

import type { Map as MapLibreMapInstance } from 'maplibre-gl';
import { Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import type { Route, Track } from '@/domain/activityDocument';
import { useEffect, useRef } from 'react';

import 'maplibre-gl/dist/maplibre-gl.css';

type RouteMapProps =
  | Readonly<{ route?: never; track: Track }>
  | Readonly<{ route: Route; track?: never }>;

export const RouteMap = ({ route, track }: RouteMapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [routeColor] = useToken('colors', 'green.500');

  useEffect(() => {
    const mapContainer = mapContainerRef.current;

    if (!mapContainer || typeof WebGLRenderingContext === 'undefined') {
      return;
    }

    mapContainer.scrollIntoView({
      block: 'nearest'
    });

    let map: MapLibreMapInstance | undefined;
    let cancelled = false;

    const paths = track
      ? track.segments.map(segment => {
          return {
            id: segment.id,
            samples: segment.samples
          };
        })
      : [
          {
            id: route.id,
            samples: route.points
          }
        ];

    const initialiseMap = async () => {
      const { LngLatBounds, Map: MapLibreMap, setWorkerUrl } = await import('maplibre-gl');

      setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');

      if (cancelled) return;

      map = new MapLibreMap({
        attributionControl: false,
        container: mapContainer,
        cooperativeGestures: true,
        style: {
          version: 8,
          sources: {},
          layers: []
        }
      });

      map.once('load', () => {
        map?.addSource('route', {
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

        map?.addLayer({
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
          map?.fitBounds(bounds, {
            duration: 0,
            padding: 32
          });
        }
      });

      return;
    };

    void initialiseMap();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [route, routeColor, track]);

  const itemName = track ? (track.name ?? 'Unnamed track') : (route.name ?? 'Unnamed route');

  const pointOrSegmentCount = track ? track.segments.length : route.points.length;

  const itemDescription = track
    ? pointOrSegmentCount === 1
      ? '1 track segment'
      : `${pointOrSegmentCount} track segments`
    : pointOrSegmentCount === 1
      ? '1 route point'
      : `${pointOrSegmentCount} route points`;

  return (
    <Box as='section' aria-labelledby='route-map-heading' width='full'>
      <Stack gap={3}>
        <Stack gap={1}>
          <Heading as='h3' id='route-map-heading' size='lg'>
            Route map
          </Heading>
          <Text fontWeight='medium'>{itemName ?? 'Unnamed track'}</Text>
          <Text color='fg.muted' fontSize='sm'>
            {itemDescription}
          </Text>
        </Stack>

        <Box
          bg='bg.muted'
          borderWidth='1px'
          minH={{ base: 'xs', md: 'sm' }}
          overflow='hidden'
          ref={mapContainerRef}
          rounded='lg'
        />
      </Stack>
    </Box>
  );
};
