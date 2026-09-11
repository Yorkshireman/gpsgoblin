import { useState } from 'react';
import type { DisplayUnits } from '../measurementDisplay';
import { Alert, Field, NativeSelect, Stack } from '@chakra-ui/react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { MeasurementExplorer } from './MeasurementExplorer';
import type { SelectedGpxItem } from '../selectedGpxItem';
import { GpxItemSelector } from './GpxItemSelector';
import { WaypointDetails } from './WaypointDetails';
import { TrackSegmentSelector } from './TrackSegmentSelector';
import { GpxFileDetails } from './GpxFileDetails';

type GpxDocumentResultsProps = Readonly<{
  document: ImportedGpxDocument;
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

export const GpxDocumentResults = ({
  document,
  selectedItem,
  onItemChange
}: GpxDocumentResultsProps) => {
  const [units, setUnits] = useState<DisplayUnits>('metric');
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

  const waypoint =
    selectedItem?.kind === 'waypoint'
      ? document.waypoints.find(candidate => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const selectedSegment =
    selectedItem?.kind === 'track'
      ? track?.segments.find(segment => {
          return segment.id === selectedItem.segmentId;
        })
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
        waypoints={document.waypoints}
        selectedItem={selectedItem}
        onItemChange={onItemChange}
      />
      {track ? (
        <TrackSegmentSelector
          track={track}
          selectedSegmentId={selectedSegment?.id}
          onSegmentChange={segmentId => {
            onItemChange({ kind: 'track', id: track.id, segmentId });
          }}
        />
      ) : null}
      {track || route || waypoint?.elevationMetres !== undefined ? (
        <Field.Root>
          <Field.Label>Display units</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={units}
              onChange={event => {
                setUnits(event.currentTarget.value === 'imperial' ? 'imperial' : 'metric');
              }}
            >
              <option value='metric'>Metric</option>
              <option value='imperial'>Imperial</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      ) : null}
      {track ? (
        <MeasurementExplorer
          units={units}
          key={`${track.id}-${selectedSegment?.id ?? 'all'}`}
          track={track}
          segment={selectedSegment}
        />
      ) : null}
      {route ? <MeasurementExplorer units={units} key={route.id} route={route} /> : null}
      {waypoint ? <WaypointDetails units={units} waypoint={waypoint} /> : null}
      <GpxFileDetails document={document} />
    </Stack>
  );
};
