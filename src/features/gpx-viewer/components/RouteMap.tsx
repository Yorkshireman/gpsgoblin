'use client';

import type { Map as MapLibreMapInstance } from 'maplibre-gl';
import { Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import { useEffect, useRef } from 'react';

import type { Track } from '@/domain/activityDocument';

import 'maplibre-gl/dist/maplibre-gl.css';

type RouteMapProps = Readonly<{
  track: Track;
}>;

export const RouteMap = ({ track }: RouteMapProps) => {
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
            features: track.segments
              .filter(segment => {
                return segment.samples.length > 1;
              })
              .map(segment => {
                return {
                  type: 'Feature',
                  properties: {
                    segmentId: segment.id
                  },
                  geometry: {
                    type: 'LineString',
                    coordinates: segment.samples.map(sample => {
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

        for (const segment of track.segments) {
          for (const sample of segment.samples) {
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
  }, [routeColor, track]);

  const segmentCount = track.segments.length;
  const segmentDescription =
    segmentCount === 1 ? '1 track segment' : `${segmentCount} track segments`;

  return (
    <Box as='section' aria-labelledby='route-map-heading' width='full'>
      <Stack gap={3}>
        <Stack gap={1}>
          <Heading as='h3' id='route-map-heading' size='lg'>
            Route map
          </Heading>
          <Text fontWeight='medium'>{track.name ?? 'Unnamed track'}</Text>
          <Text color='fg.muted' fontSize='sm'>
            {segmentDescription}
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
