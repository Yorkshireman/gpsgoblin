'use client';

import { Alert, Box, Heading, Stack, Text, useToken } from '@chakra-ui/react';
import type {
  GeographicSample,
  Route,
  Track,
  TrackSegment,
  Waypoint
} from '@/domain/activityDocument';
import { useMemo } from 'react';

import { MapCanvas } from './components/MapCanvas';

import 'maplibre-gl/dist/maplibre-gl.css';

type RouteMapProps = (
  | Readonly<{ route?: never; track: Track; waypoint?: never; segment?: TrackSegment }>
  | Readonly<{ route: Route; track?: never; waypoint?: never; segment?: never }>
  | Readonly<{ route?: never; track?: never; waypoint: Waypoint; segment?: never }>
) &
  Readonly<{ selectedPoint?: GeographicSample }>;

export const RouteMap = ({ route, track, waypoint, segment, selectedPoint }: RouteMapProps) => {
  const [routeColor] = useToken('colors', 'green.500');

  const paths = useMemo(() => {
    return track
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
  }, [route, track, segment]);

  const hasLine = paths.some(path => {
    return path.samples.length > 1;
  });
  const hasShortSegments =
    Boolean(track) &&
    paths.some(path => {
      return path.samples.length < 2;
    });
  const geometryMessage = waypoint
    ? undefined
    : !hasLine
      ? 'There are not enough points to draw a line. Each route or track segment needs at least two points; separate segments are not joined.'
      : hasShortSegments
        ? 'Some track segments have fewer than two points and are not shown as lines. The other segments are still displayed.'
        : undefined;

  const itemName = track
    ? (track.name ?? 'Unnamed track')
    : route
      ? (route.name ?? 'Unnamed route')
      : (waypoint.name ?? 'Unnamed waypoint');

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
            <Text overflowWrap='anywhere' whiteSpace='pre-wrap'>
              {description}
            </Text>
          ) : null}
          <Text color='fg.muted' fontSize='sm'>
            {itemDescription}
          </Text>
        </Stack>

        {geometryMessage ? (
          <Alert.Root status='info'>
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>
                {hasLine ? 'Some segments have no line' : 'No line to display'}
              </Alert.Title>
              <Alert.Description>{geometryMessage}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        ) : null}
        {waypoint || hasLine || selectedPoint ? (
          <MapCanvas
            paths={paths}
            point={waypoint}
            selectedPoint={selectedPoint}
            routeColor={routeColor}
          />
        ) : null}
      </Stack>
    </Box>
  );
};
