'use client';

import { Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import type { Route, Track, Waypoint } from '@/domain/activityDocument';
import { useEffect, useRef } from 'react';

import { initialiseRouteMap } from './initialiseRouteMap';

import 'maplibre-gl/dist/maplibre-gl.css';

type RouteMapProps =
  | Readonly<{ route?: never; track: Track; waypoint?: never }>
  | Readonly<{ route: Route; track?: never; waypoint?: never }>
  | Readonly<{ route?: never; track?: never; waypoint: Waypoint }>;

export const RouteMap = ({ route, track, waypoint }: RouteMapProps) => {
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
      : route
        ? [
            {
              id: route.id,
              samples: route.points
            }
          ]
        : [];

    return initialiseRouteMap({ container: mapContainer, paths, routeColor, point: waypoint });
  }, [route, routeColor, track, waypoint]);

  const itemName = track
    ? track.name ?? 'Unnamed track'
    : route
      ? route.name ?? 'Unnamed route'
      : waypoint.name ?? 'Unnamed waypoint';

  const pointOrSegmentCount = track ? track.segments.length : route ? route.points.length : 1;

  const itemDescription = track
    ? pointOrSegmentCount === 1
      ? '1 track segment'
      : `${pointOrSegmentCount} track segments`
    : route
      ? pointOrSegmentCount === 1
        ? '1 route point'
        : `${pointOrSegmentCount} route points`
      : '1 waypoint';

  const headingId = waypoint ? 'waypoint-map-heading' : 'route-map-heading';

  return (
    <Box as='section' aria-labelledby={headingId} width='full'>
      <Stack gap={3}>
        <Stack gap={1}>
          <Heading as={track ? 'h3' : 'h4'} id={headingId} size='lg'>
            {waypoint ? 'Waypoint map' : 'Route map'}
          </Heading>
          <Text fontWeight='medium'>{itemName}</Text>
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
