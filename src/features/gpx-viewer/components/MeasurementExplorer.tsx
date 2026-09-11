import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  NativeSelect,
  Stack,
  Stat,
  Text
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { analyseMeasurements, SPEED_AVERAGE_SECONDS } from '@/analysis/measurements';
import type { Route, Track, TrackSegment } from '@/domain/activityDocument';
import { RouteMap } from '../RouteMap';
import {
  chartMeasurements,
  displayUnits,
  formatMeasurement,
  formatChartValue,
  formatChartMeasurement
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
  const [smoothingSeconds, setSmoothingSeconds] = useState(SPEED_AVERAGE_SECONDS);
  const [fullPaceRange, setFullPaceRange] = useState(false);
  const analysis = useMemo(() => {
    return analyseMeasurements(
      track ? (segment ? [segment] : track.segments) : [{ id: route.id, samples: route.points }]
    );
  }, [track, segment, route]);
  const [selection, setSelection] = useState<{
    analysis: typeof analysis;
    id: string;
  }>();
  const selectedId = selection?.analysis === analysis ? selection.id : undefined;
  const setSelectedId = (id: string) => {
    setSelection({ analysis, id });
    return;
  };
  const data = useMemo(() => {
    return chartMeasurements(analysis.points, units, motion, smoothingSeconds);
  }, [analysis, units, motion, smoothingSeconds]);
  const labels = displayUnits(units);
  const selectedIndex = analysis.points.findIndex(point => {
    return point.sample.id === selectedId;
  });
  const selected = analysis.points[selectedIndex];
  const selectedChartPoint = data.find(point => {
    return point.sampleId === selectedId;
  });
  const selectedMotion = selectedChartPoint?.motion ?? null;
  const hasElevation = data.some(point => {
    return point.elevation !== null;
  });
  const hasMotion = data.some(point => {
    return point.motion !== null;
  });
  const motionUnit = motion === 'speed' ? labels.speed : labels.pace;

  const paceLimit = (30 * labels.metresPerDistance) / 1000;
  const hasSlowPace =
    motion === 'pace' &&
    data.some(point => {
      return point.motion !== null && point.motion > paceLimit;
    });

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
          <Stat.Label>Calculated duration</Stat.Label>
          <Stat.ValueText>{formatMeasurement(analysis.timedDurationSeconds, 's')}</Stat.ValueText>
          <Stat.HelpText>
            Calculated from the recorded times. Gaps and unusable times aren’t counted.
          </Stat.HelpText>
        </Stat.Root>
      </Stack>
      {route ? <Text>This is a planned route. Its times may be estimates.</Text> : null}
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
        <Stack gap={3}>
          <MeasurementChart
            data={data}
            metric='motion'
            title={motion === 'speed' ? 'Speed' : 'Pace'}
            description={smoothingSeconds ? `${smoothingSeconds}-second average` : 'Unsmoothed'}
            reference={
              motion === 'speed' && analysis.averageSpeedMetresPerSecond !== null
                ? {
                    value: (analysis.averageSpeedMetresPerSecond * 3600) / labels.metresPerDistance,
                    label: 'Average speed'
                  }
                : undefined
            }
            maximum={hasSlowPace && !fullPaceRange ? paceLimit : undefined}
            unit={motionUnit}
            distanceUnit={labels.distance}
            selectedId={selected?.sample.id}
            onSelect={setSelectedId}
          />
          <Field.Root>
            <Field.Label>Smoothing</Field.Label>
            <Input
              type='range'
              appearance='auto'
              accentColor='green.solid'
              borderWidth={0}
              p={0}
              min={0}
              max={120}
              step={5}
              value={smoothingSeconds}
              aria-valuetext={
                smoothingSeconds ? `${smoothingSeconds} seconds` : '0 seconds (unsmoothed)'
              }
              onChange={event => {
                setSmoothingSeconds(Number(event.currentTarget.value));
              }}
            />
            <Field.HelperText alignSelf='center'>
              {smoothingSeconds} seconds
              {smoothingSeconds === 0 ? ' (unsmoothed)' : ''}
            </Field.HelperText>
            <Text fontSize='sm' color='fg.muted'>
              Move right for a smoother line; left for more detail.
            </Text>
          </Field.Root>
          {hasSlowPace ? (
            <Stack align='start' gap={2}>
              {!fullPaceRange ? (
                <Text fontSize='sm' color='fg.muted'>
                  Paces slower than {formatChartValue(paceLimit, motionUnit)} {motionUnit} are shown
                  at the top. Select a point to see its value.
                </Text>
              ) : null}
              <Button
                size='sm'
                variant='outline'
                onClick={() => {
                  setFullPaceRange(!fullPaceRange);
                }}
              >
                {fullPaceRange ? 'Show normal pace range' : 'Show full pace range'}
              </Button>
            </Stack>
          ) : null}
        </Stack>
      ) : (
        <Text>
          {motion === 'pace' && analysis.timedIntervalCount
            ? 'Pace is unavailable while stopped.'
            : 'Speed and pace need recorded times. This section doesn’t have enough usable times.'}
        </Text>
      )}
      {hasElevation || hasMotion ? (
        <Text fontSize='sm' color='fg.muted'>
          Select a point on the chart to see its location on the map. Gaps show where measurements
          are missing.
        </Text>
      ) : null}
      {analysis.points.length ? (
        <Field.Root>
          <Field.Label>Position on route</Field.Label>
          <Input
            type='range'
            appearance='auto'
            accentColor='green.solid'
            borderWidth={0}
            p={0}
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
            Start of route
          </Button>
          <Field.HelperText>Use the slider or arrow keys to move along the route.</Field.HelperText>
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
          <Text>
            {motion === 'speed' ? 'Speed:' : 'Pace:'}
            {smoothingSeconds ? ` (${smoothingSeconds}-second average)` : ''}
          </Text>
          <Text>
            {selectedMotion === null
              ? 'Unavailable'
              : formatChartMeasurement(selectedMotion, motionUnit)}
          </Text>
          {motion === 'speed' && selectedChartPoint?.trendSpeed != null ? (
            <Text>
              5-minute average: {formatChartMeasurement(selectedChartPoint.trendSpeed, motionUnit)}
            </Text>
          ) : null}
          <Text>Recorded time:</Text>
          <Text overflowWrap='anywhere'>
            {selected.sample.sourceTime === ''
              ? '(empty)'
              : (selected.sample.sourceTime ?? 'Missing')}
          </Text>
          {selected.timeIssue ? <Text>{selected.timeIssue}</Text> : null}
        </Stack>
      ) : null}
      <Box as='details' fontSize='sm' color='fg.muted'>
        <Box as='summary' cursor='pointer' fontWeight='medium' color='fg'>
          How speed is calculated
        </Box>
        <Stack gap={2} pt={3}>
          <Text>
            We calculate speed from the distance and time between recorded locations. Small GPS
            errors can make this jump around, even when you move steadily.
          </Text>
          <Text>
            The blue trend line averages speed over the previous 5 minutes to show sustained
            changes. It restarts after gaps and uses the available time at the start of a section.
          </Text>
          <Text>
            The dashed line shows the average speed for the selected track or section, including
            recorded stops. Sections without usable times are left out. Changing smoothing does not
            change this average.
          </Text>
          <Text>
            The smoothing slider averages speed over the number of seconds you choose. Higher values
            make the overall pattern easier to see, but soften brief changes. Set it to 0 seconds to
            see the unsmoothed measurements.
          </Text>
          <Text>
            We restart the average after missing or unusable times. At the start of each section, we
            use the time available. Pace is the time it takes to cover one kilometre or mile, shown
            as minutes:seconds.
          </Text>
          <Text>
            Distance and duration are calculated from the recording. Elevation and recorded times
            come from your file. Totals saved by your device may differ; we don’t read those totals
            yet. Your original file is unchanged.
          </Text>
          <Text>
            {analysis.timedIntervalCount} of {analysis.intervalCount} pairs of recorded locations
            have usable times.
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};
