import { Alert, Box, Link, Stack, Text } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import type { GeographicSample } from '@/domain/activityDocument';

import { initialiseRouteMap } from '../initialiseRouteMap';
import type { MapPath, MapStatus } from '../initialiseRouteMap';
import type { BasemapStatus } from '../basemap';

type MapCanvasProps = Readonly<{
  paths: readonly MapPath[];
  point?: GeographicSample;
  selectedPoint?: GeographicSample;
  routeColor: string;
}>;

export const MapCanvas = ({ paths, point, selectedPoint, routeColor }: MapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof initialiseRouteMap> | null>(null);
  const [basemapStatus, setBasemapStatus] = useState<BasemapStatus>('loading');
  const [status, setStatus] = useState<MapStatus>('loading');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const controller = initialiseRouteMap({
      container,
      paths,
      point,
      routeColor,
      onStatusChange: setStatus,
      onBasemapStatusChange: setBasemapStatus
    });
    mapRef.current = controller;
    return () => {
      mapRef.current = null;
      controller.dispose();
    };
  }, [paths, point, routeColor]);

  useEffect(() => {
    mapRef.current?.selectPoint(selectedPoint);
  }, [paths, point, routeColor, selectedPoint]);

  const failure =
    status === 'unsupported'
      ? 'This browser cannot display the map. Try another browser or enable graphics acceleration.'
      : status === 'failed'
        ? 'The map could not be displayed. You can clear and reopen the file to try again.'
        : undefined;

  return (
    <Stack gap={2}>
      <Box position='relative'>
        <Box
          aria-label='Interactive route map'
          bg='bg.muted'
          borderWidth='1px'
          minH={{ base: 'xs', md: 'sm' }}
          overflow='hidden'
          ref={containerRef}
          rounded='lg'
          visibility={failure ? 'hidden' : 'visible'}
        />
        {failure ? (
          <Stack position='absolute' inset={0} justify='center' p={{ base: 3, md: 6 }}>
            <Alert.Root status='warning'>
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Map unavailable</Alert.Title>
                <Alert.Description>
                  {failure} Your file details and any calculated results are still available.
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          </Stack>
        ) : null}
      </Box>
      {!failure ? (
        <Text role='status' fontSize='sm' color='fg.muted'>
          {basemapStatus === 'unavailable'
            ? 'Background map unavailable. Your route and selected position are still shown.'
            : basemapStatus === 'disabled'
              ? 'Background map is turned off. Your route and selected position are still shown.'
              : basemapStatus === 'loading'
                ? 'Loading background map…'
                : null}
        </Text>
      ) : null}
      <Text fontSize='xs' color='fg.muted'>
        Your file stays on your device. Map requests reveal the viewed area to OpenStreetMap.{' '}
        <Link href='https://osmfoundation.org/wiki/Privacy_Policy'>Map privacy</Link>
      </Text>
    </Stack>
  );
};
