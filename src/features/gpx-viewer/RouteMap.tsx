'use client';

import { Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import type { Route, Track, TrackSegment, Waypoint } from '@/domain/activityDocument';
import { useEffect, useRef } from 'react';

import { initialiseRouteMap } from './initialiseRouteMap';

import 'maplibre-gl/dist/maplibre-gl.css';

type RouteMapProps =
  | Readonly<{ route?: never; track: Track; waypoint?: never; segment?: TrackSegment }>
  | Readonly<{ route: Route; track?: never; waypoint?: never; segment?: never }>
  | Readonly<{ route?: never; track?: never; waypoint: Waypoint; segment?: never }>;

export const RouteMap = ({ route, track, waypoint, segment }: RouteMapProps) => {
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
      ? (segment ? [segment] : track.segments).map(segment => {
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
  }, [route, routeColor, track, waypoint, segment]);

  const itemName = track
    ? track.name ?? 'Unnamed track'
    : route
      ? route.name ?? 'Unnamed route'
      : waypoint.name ?? 'Unnamed waypoint';

  const pointOrSegmentCount = track ? track.segments.length : route ? route.points.length : 1;

  const selectedSegmentIndex = track?.segments.findIndex(candidate => {
    return candidate.id === segment?.id;
  });

  const itemDescription =
    segment && selectedSegmentIndex !== undefined
      ? `Track segment ${selectedSegmentIndex + 1} of ${pointOrSegmentCount}`
      : track
        ? pointOrSegmentCount === 1
          ? '1 track segment'
          : `${pointOrSegmentCount} track segments`
        : route
          ? pointOrSegmentCount === 1
            ? '1 route point'
            : `${pointOrSegmentCount} route points`
          : '1 waypoint';

  const headingId = waypoint ? 'waypoint-map-heading' : 'route-map-heading';
  const description = track?.description ?? route?.description;

  return (
    <Box as='section' aria-labelledby={headingId} width='full'>
      <Stack gap={3}>
        <Stack gap={1}>
          <Heading as={track ? 'h3' : 'h4'} id={headingId} size='lg'>
            {waypoint ? 'Waypoint map' : 'Route map'}
          </Heading>
          <Text fontWeight='medium'>{itemName}</Text>
          {description ? (
            <Text overflowWrap='anywhere' whiteSpace='pre-wrap'>{description}</Text>
          ) : null}
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
