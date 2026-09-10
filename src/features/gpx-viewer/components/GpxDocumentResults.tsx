import { Alert, Heading, Stack, Stat } from '@chakra-ui/react';

import {
  calculatePathDistanceMetres,
  calculateTrackDistanceMetres
} from '@/analysis/geometry/calculateTrackDistanceMetres';
import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { RouteMap } from '../RouteMap';
import type { SelectedGpxItem } from '../selectedGpxItem';
import { GpxItemSelector } from './GpxItemSelector';

type GpxDocumentResultsProps = Readonly<{
  document: ImportedGpxDocument;
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

const formatDistance = (distanceMetres: number) => {
  return `${(distanceMetres / 1000).toFixed(1)} km`;
};

export const GpxDocumentResults = ({
  document,
  selectedItem,
  onItemChange
}: GpxDocumentResultsProps) => {
  const track =
    selectedItem?.kind === 'track'
      ? document.tracks.find(candidate => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const route =
    selectedItem?.kind === 'route'
      ? document.routes.find(candidate => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const distanceMetres = track
    ? calculateTrackDistanceMetres(track.segments)
    : route
      ? calculatePathDistanceMetres(route.points)
      : undefined;

  return (
    <Stack gap={4} width='full'>
      <Alert.Root status='success'>
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Title>Your GPX file is ready</Alert.Title>
        </Alert.Content>
      </Alert.Root>
      <GpxItemSelector
        tracks={document.tracks}
        routes={document.routes}
        selectedItem={selectedItem}
        onItemChange={onItemChange}
      />
      {distanceMetres !== undefined ? (
        <Stat.Root>
          <Stat.Label>Calculated distance</Stat.Label>
          <Stat.ValueText>{formatDistance(distanceMetres)}</Stat.ValueText>
          <Stat.HelpText>
            {track
              ? 'Based on the recorded GPS points'
              : 'Based on straight lines between route points'}
          </Stat.HelpText>
        </Stat.Root>
      ) : null}
      {track ? <RouteMap track={track} /> : null}
      {route ? (
        <Stack as='section' aria-labelledby='planned-route-heading' gap={3}>
          <Heading as='h3' id='planned-route-heading' size='lg'>
            Planned route
          </Heading>
          <RouteMap route={route} />
        </Stack>
      ) : null}
    </Stack>
  );
};
