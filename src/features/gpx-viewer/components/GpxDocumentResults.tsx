import { useState } from 'react';
import type { ReactNode } from 'react';
import type { DisplayUnits } from '../measurementDisplay';
import { Box, Field, Heading, NativeSelect, Stack, Text } from '@chakra-ui/react';

import type { ImportedGpxDocument } from '@/domain/activityDocument';

import { MeasurementExplorer } from '../measurement-explorer';
import type { SelectedGpxItem } from '../selectedGpxItem';
import { GpxItemSelector } from './GpxItemSelector';
import { WaypointDetails } from './WaypointDetails';
import { TrackSegmentSelector } from './TrackSegmentSelector';
import { GpxFileDetails } from './GpxFileDetails';
import type { MeasurementSession } from '../import-processing';

type GpxDocumentResultsProps = Readonly<{
  document: ImportedGpxDocument;
  measurements: MeasurementSession;
  filename?: string;
  children?: ReactNode;
  selectedItem: SelectedGpxItem | undefined;
  onItemChange: (item: SelectedGpxItem) => void;
}>;

export const GpxDocumentResults = ({
  document,
  measurements,
  filename,
  selectedItem,
  onItemChange,
  children
}: GpxDocumentResultsProps) => {
  const [units, setUnits] = useState<DisplayUnits>('metric');
  const [detailsOpen, setDetailsOpen] = useState(false);
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

  const details = (
    <Stack gap={1} width='full'>
      <Box asChild>
        <details
          open={detailsOpen}
          onToggle={event => {
            if (event.target === event.currentTarget) setDetailsOpen(event.currentTarget.open);
          }}
        >
          <Box as='summary' cursor='pointer' fontWeight='medium' fontSize='sm'>
            File details
          </Box>
          <Text overflowWrap='anywhere' py={2}>
            Filename: {filename}
          </Text>
          <Text fontSize='sm' mb={2}>
            Your file stays on your device. Refreshing closes it and resets your choices.
          </Text>
          <GpxFileDetails document={document} />
        </details>
      </Box>
      {children}
    </Stack>
  );

  return (
    <Stack gap={4} width='full'>
      <Heading as='h2' srOnly>
        Your file
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
            onSegmentChange={segmentId => {
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
          measurements={measurements}
          onUnitsChange={setUnits}
          key={`${track.id}-${selectedSegment?.id ?? 'all'}`}
          track={track}
          segment={selectedSegment}
        >
          {details}
        </MeasurementExplorer>
      ) : null}
      {route ? (
        <MeasurementExplorer
          units={units}
          measurements={measurements}
          onUnitsChange={setUnits}
          key={route.id}
          route={route}
        >
          {details}
        </MeasurementExplorer>
      ) : null}
      {waypoint ? (
        <Stack
          bg='bg'
          borderWidth='1px'
          borderColor='border.subtle'
          rounded='xl'
          p={{ base: 3, md: 4 }}
        >
          <WaypointDetails units={units} waypoint={waypoint} />
          {details}
        </Stack>
      ) : null}
    </Stack>
  );
};
