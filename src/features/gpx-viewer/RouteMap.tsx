'use client';

import { Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import type { Route, Track } from '@/domain/activityDocument';
import { useEffect, useRef } from 'react';

import { initialiseRouteMap } from './initialiseRouteMap';

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

    return initialiseRouteMap({ container: mapContainer, paths, routeColor });
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
