import { Button, Field, Heading, Input, NativeSelect, Stack, Stat, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { analyseMeasurements } from '@/analysis/measurements';
import type { Route, Track, TrackSegment } from '@/domain/activityDocument';
import { RouteMap } from '../RouteMap';
import {
  chartMeasurements,
  displayUnits,
  formatMeasurement,
  motionValue
} from '../measurementDisplay';
import type { DisplayUnits, MotionDisplay } from '../measurementDisplay';
import { MeasurementChart } from './MeasurementChart';

type MeasurementExplorerProps = (
  | Readonly<{ track: Track; segment?: TrackSegment; route?: never }>
  | Readonly<{ route: Route; track?: never; segment?: never }>
) &
  Readonly<{ units: DisplayUnits }>;

export const MeasurementExplorer = ({ track, segment, route, units }: MeasurementExplorerProps) => {
  const [motion, setMotion] = useState<MotionDisplay>('speed');
  const analysis = useMemo(() => {
    return analyseMeasurements(
      track ? (segment ? [segment] : track.segments) : [{ id: route.id, samples: route.points }]
    );
  }, [track, segment, route]);
  const [selection, setSelection] = useState<{ analysis: typeof analysis; id: string }>();
  const selectedId = selection?.analysis === analysis ? selection.id : undefined;
  const setSelectedId = (id: string) => {
    setSelection({ analysis, id });
    return;
  };
  const data = useMemo(() => {
    return chartMeasurements(analysis.points, units, motion);
  }, [analysis, units, motion]);
  const labels = displayUnits(units);
  const selectedIndex = analysis.points.findIndex(point => {
    return point.sample.id === selectedId;
  });
  const selected = analysis.points[selectedIndex];
  const hasElevation = data.some(point => {
    return point.elevation !== null;
  });
  const hasMotion = data.some(point => {
    return point.motion !== null;
  });
  const motionUnit = motion === 'speed' ? labels.speed : labels.pace;

  return (
    <Stack gap={5} width='full' minW={0}>
      <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
        <Field.Root>
          <Field.Label>Speed or pace</Field.Label>
          <NativeSelect.Root>
            <NativeSelect.Field
              value={motion}
              onChange={event => {
                setMotion(event.currentTarget.value === 'pace' ? 'pace' : 'speed');
              }}
            >
              <option value='speed'>Speed</option>
              <option value='pace'>Pace</option>
            </NativeSelect.Field>
            <NativeSelect.Indicator />
          </NativeSelect.Root>
        </Field.Root>
      </Stack>
      <Stack direction={{ base: 'column', md: 'row' }} gap={4}>
        <Stat.Root>
          <Stat.Label>Calculated distance</Stat.Label>
          <Stat.ValueText>
            {formatMeasurement(analysis.distanceMetres / labels.metresPerDistance, labels.distance)}
          </Stat.ValueText>
          <Stat.HelpText>
            {track
              ? 'Based on the recorded GPS points'
              : 'Based on straight lines between route points'}
          </Stat.HelpText>
        </Stat.Root>
        <Stat.Root>
          <Stat.Label>Calculated timed duration</Stat.Label>
          <Stat.ValueText>{formatMeasurement(analysis.timedDurationSeconds, 's')}</Stat.ValueText>
          <Stat.HelpText>
            {analysis.timedIntervalCount} of {analysis.intervalCount} adjacent intervals timed. Sum
            of valid intervals; excludes segment gaps and unusable time. This is not moving time or
            total elapsed time.
          </Stat.HelpText>
        </Stat.Root>
      </Stack>
      <Text fontSize='sm' color='fg.muted'>
        GPX source totals are not interpreted. Distance, duration and interval speed/pace are
        calculated; elevations and timestamps come from source points. Original values are retained.
      </Text>
      {route ? (
        <Text>
          Planned route: timing between route points does not establish that this journey was
          completed.
        </Text>
      ) : null}
      {analysis.warnings.length ? (
        <Stack as='section' aria-label='Measurement warnings' gap={1}>
          {analysis.warnings.map(warning => {
            return (
              <Text key={warning} fontSize='sm'>
                {warning}
              </Text>
            );
          })}
        </Stack>
      ) : null}
      {track ? (
        <RouteMap track={track} segment={segment} selectedPoint={selected?.sample} />
      ) : (
        <Stack as='section' aria-labelledby='planned-route-heading' gap={3}>
          <Heading as='h3' id='planned-route-heading' size='lg'>
            Planned route
          </Heading>
          <RouteMap route={route} selectedPoint={selected?.sample} />
        </Stack>
      )}
      {hasElevation ? (
        <MeasurementChart
          data={data}
          metric='elevation'
          title='Elevation profile'
          unit={labels.elevation}
          distanceUnit={labels.distance}
          selectedId={selected?.sample.id}
          onSelect={setSelectedId}
        />
      ) : (
        <Text>No elevation measurements available.</Text>
      )}
      {hasMotion ? (
        <MeasurementChart
          data={data}
          metric='motion'
          title={motion === 'speed' ? 'Interval speed' : 'Interval pace'}
          unit={motionUnit}
          distanceUnit={labels.distance}
          selectedId={selected?.sample.id}
          onSelect={setSelectedId}
        />
      ) : (
        <Text>
          {motion === 'pace' && analysis.timedIntervalCount
            ? 'No pace to display: stationary intervals have no finite pace.'
            : 'No speed or pace chart: insufficient valid adjacent timestamps.'}
        </Text>
      )}
      {hasElevation || hasMotion ? (
        <Text fontSize='sm' color='fg.muted'>
          Select a chart position or use Inspect point. Charts use every source point in order.
          Lines guide the eye between measurements; no missing measurements are interpolated.
          Segment gaps and null values remain breaks. Speed/pace is an interval average shown at its
          ending point; stationary pace is unavailable.
          {motion === 'pace'
            ? ' Pace uses decimal minutes: 1.5 minutes is 1 minute 30 seconds.'
            : ''}
        </Text>
      ) : null}
      {analysis.points.length ? (
        <Field.Root>
          <Field.Label>Inspect point</Field.Label>
          <Input
            type='range'
            min={0}
            max={analysis.points.length - 1}
            step={1}
            value={selectedIndex < 0 ? 0 : selectedIndex}
            aria-valuetext={selected ? `Point ${selectedIndex + 1}` : 'No point selected'}
            onChange={event => {
              const point = analysis.points[Number(event.currentTarget.value)];
              if (point) {
                setSelectedId(point.sample.id);
              }
            }}
          />
          <Button
            size='sm'
            variant='outline'
            onClick={() => {
              setSelectedId(analysis.points[0].sample.id);
            }}
          >
            Inspect first point
          </Button>
          <Field.HelperText>
            Use arrow keys to inspect source points, including missing measurements.
          </Field.HelperText>
        </Field.Root>
      ) : null}
      {selected ? (
        <Stack as='section' aria-label='Selected measurement' gap={1} aria-live='polite'>
          <Heading as='h3' size='md'>
            Selected measurement
          </Heading>
          <Text>
            Point {selectedIndex + 1} of {analysis.points.length}
          </Text>
          <Text>
            Latitude: {selected.sample.latitudeDegrees}°; Longitude:{' '}
            {selected.sample.longitudeDegrees}°
          </Text>
          <Text>Elevation:</Text>
          <Text>
            {formatMeasurement(
              selected.elevationMetres === null
                ? null
                : selected.elevationMetres / labels.metresPerElevation,
              labels.elevation
            )}
          </Text>
          <Text>{motion === 'speed' ? 'Interval speed:' : 'Interval pace:'}</Text>
          <Text>
            {formatMeasurement(
              motionValue(selected.speedMetresPerSecond, units, motion),
              motionUnit
            )}
          </Text>
          <Text>Source timestamp:</Text>
          <Text overflowWrap='anywhere'>
            {selected.sample.sourceTime === ''
              ? '(empty)'
              : (selected.sample.sourceTime ?? 'Missing')}
          </Text>
          {selected.timeIssue ? <Text>{selected.timeIssue}</Text> : null}
        </Stack>
      ) : null}
    </Stack>
  );
};
