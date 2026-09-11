import { Alert, Box, Stack } from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';

import type { GeographicSample } from '@/domain/activityDocument';

import { initialiseRouteMap } from '../initialiseRouteMap';
import type { MapPath, MapStatus } from '../initialiseRouteMap';

type MapCanvasProps = Readonly<{
  paths: readonly MapPath[];
  point?: GeographicSample;
  selectedPoint?: GeographicSample;
  routeColor: string;
}>;

export const MapCanvas = ({ paths, point, selectedPoint, routeColor }: MapCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof initialiseRouteMap> | null>(null);
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
      onStatusChange: setStatus
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
    <Box position='relative'>
      <Box
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
  );
};
