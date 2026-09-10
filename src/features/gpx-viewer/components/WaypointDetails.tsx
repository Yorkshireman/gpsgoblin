import { Heading, Stack, Text } from '@chakra-ui/react';

import type { Waypoint } from '@/domain/activityDocument';

import { RouteMap } from '../RouteMap';

type WaypointDetailsProps = Readonly<{
  waypoint: Waypoint;
}>;

export const WaypointDetails = ({ waypoint }: WaypointDetailsProps) => {
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
          <Text>Elevation: {waypoint.elevationMetres} m</Text>
        ) : null}
      </Stack>
      <RouteMap waypoint={waypoint} />
    </Stack>
  );
};
