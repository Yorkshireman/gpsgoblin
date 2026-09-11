import { Heading, Stack, Text } from '@chakra-ui/react';

import type { Waypoint } from '@/domain/activityDocument';

import { RouteMap } from '../RouteMap';
import { displayUnits } from '../measurementDisplay';
import type { DisplayUnits } from '../measurementDisplay';

type WaypointDetailsProps = Readonly<{
  waypoint: Waypoint;
  units: DisplayUnits;
}>;

export const WaypointDetails = ({ waypoint, units }: WaypointDetailsProps) => {
  const labels = displayUnits(units);
  return (
    <Stack as='section' aria-labelledby='waypoint-heading' gap={3}>
      <Heading as='h3' id='waypoint-heading' size='lg'>
        Waypoint
      </Heading>
      {waypoint.description ? <Text>{waypoint.description}</Text> : null}
      <Stack gap={1}>
        <Text>Latitude: {waypoint.latitudeDegrees}°</Text>
        <Text>Longitude: {waypoint.longitudeDegrees}°</Text>
        {waypoint.elevationMetres !== undefined ? (
          <Text>
            Elevation:{' '}
            {units === 'metric'
              ? waypoint.elevationMetres
              : (waypoint.elevationMetres / labels.metresPerElevation).toFixed(1)}{' '}
            {labels.elevation}
          </Text>
        ) : null}
      </Stack>
      <RouteMap waypoint={waypoint} />
    </Stack>
  );
};
