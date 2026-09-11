import { useState } from 'react';
import type { DisplayUnits } from '../measurementDisplay';
import { Box, Field, Heading, NativeSelect, Stack, Text } from '@chakra-ui/react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { MeasurementExplorer } from '../measurement-explorer';
import type { SelectedGpxItem } from '../selectedGpxItem';
import { GpxItemSelector } from './GpxItemSelector';
import { WaypointDetails } from './WaypointDetails';
import { TrackSegmentSelector } from './TrackSegmentSelector';
import { GpxFileDetails } from './GpxFileDetails';

type GpxDocumentResultsProps = Readonly<{
  document: ImportedGpxDocument;
  filename?: string;
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

export const GpxDocumentResults = ({
  document,
  filename,
  selectedItem,
  onItemChange
}: GpxDocumentResultsProps) => {
  const [units, setUnits] = useState<DisplayUnits>('metric');
  const track =
    selectedItem?.kind === 'track'
      ? document.tracks.find((candidate) => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const route =
    selectedItem?.kind === 'route'
      ? document.routes.find((candidate) => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const waypoint =
    selectedItem?.kind === 'waypoint'
      ? document.waypoints.find((candidate) => {
          return candidate.id === selectedItem.id;
        })
      : undefined;

  const selectedSegment =
    selectedItem?.kind === 'track'
      ? track?.segments.find((segment) => {
          return segment.id === selectedItem.segmentId;
        })
      : undefined;

  return (
    <Stack gap={4} width='full'>
      <Heading as='h2' srOnly>
        File workspace
      </Heading>
      <Stack direction={{ base: 'column', md: 'row' }} gap={2}>
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
            onSegmentChange={(segmentId) => {
              onItemChange({ kind: 'track', id: track.id, segmentId });
            }}
          />
        ) : null}
      </Stack>
      {waypoint?.elevationMetres !== undefined ? (
        <Field.Root>
          <Field.Label>Display units</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={units}
              onChange={(event) => {
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
          onUnitsChange={setUnits}
          key={`${track.id}-${selectedSegment?.id ?? 'all'}`}
          track={track}
          segment={selectedSegment}
        />
      ) : null}
      {route ? (
        <MeasurementExplorer units={units} onUnitsChange={setUnits} key={route.id} route={route} />
      ) : null}
      {waypoint ? <WaypointDetails units={units} waypoint={waypoint} /> : null}
      <Box as='details'>
        <Box as='summary' cursor='pointer' fontWeight='medium'>
          File details
        </Box>
        <Text overflowWrap='anywhere' py={2}>
          Filename: {filename}
        </Text>
        <GpxFileDetails document={document} />
      </Box>
    </Stack>
  );
};
