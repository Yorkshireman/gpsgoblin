import {
  Box,
  Button,
  Field,
  Grid,
  Dialog,
  Portal,
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
  smoothingDurations,
  formatSmoothingDuration,
  displayUnits,
  formatMeasurement,
  formatDuration,
  formatChartValue,
  formatChartMeasurement
} from '../measurementDisplay';
import type { DisplayUnits, MotionDisplay } from '../measurementDisplay';
import { MeasurementChart } from './MeasurementChart';

type MeasurementExplorerProps = (
  | Readonly<{ track: Track; segment?: TrackSegment; route?: never }>
  | Readonly<{ route: Route; track?: never; segment?: never }>
) &
  Readonly<{ units: DisplayUnits; onUnitsChange: (units: DisplayUnits) => void }>;

export const MeasurementExplorer = ({
  track,
  segment,
  route,
  units,
  onUnitsChange
}: MeasurementExplorerProps) => {
  const [activeChart, setActiveChart] = useState<'speed' | 'pace' | 'elevation'>('speed');
  const motion: MotionDisplay = activeChart === 'pace' ? 'pace' : 'speed';
  const [showElevation, setShowElevation] = useState(false);
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
  const selectedIndex = analysis.points.findIndex((point) => {
    return point.sample.id === selectedId;
  });
  const selected = analysis.points[selectedIndex];
  const selectedChartPoint = data.find((point) => {
    return point.sampleId === selectedId;
  });
  const selectedMotion = selectedChartPoint?.motion ?? null;
  const hasElevation = data.some((point) => {
    return point.elevation !== null;
  });
  const hasMotion = data.some((point) => {
    return point.motion !== null;
  });
  const motionUnit = motion === 'speed' ? labels.speed : labels.pace;

  const paceLimit = (30 * labels.metresPerDistance) / 1000;
  const hasSlowPace =
    motion === 'pace' &&
    data.some((point) => {
      return point.motion !== null && point.motion > paceLimit;
    });

  const hasTimedMotion = analysis.averageSpeedMetresPerSecond !== null;
  const chart =
    !hasTimedMotion && hasElevation
      ? 'elevation'
      : activeChart === 'elevation' && !hasElevation
        ? 'speed'
        : activeChart;
  const mapView = (
    <>
      {' '}
      {track ? (
        <RouteMap track={track} segment={segment} selectedPoint={selected?.sample} />
      ) : (
        <Stack as='section' aria-label='Planned route' gap={3}>
          <Heading as='h3' size='lg'>
            Planned route
          </Heading>
          <RouteMap route={route} selectedPoint={selected?.sample} />
        </Stack>
      )}
    </>
  );

  return (
    <Stack gap={3} width='full' minW={0}>
      <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={3}>
        <Stat.Root>
          <Stat.Label>Calculated distance</Stat.Label>
          <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
            {formatMeasurement(analysis.distanceMetres / labels.metresPerDistance, labels.distance)}
          </Stat.ValueText>
          <Stat.HelpText fontSize='xs'>
            {track
              ? 'Based on the recorded GPS points'
              : 'Based on straight lines between route points'}
          </Stat.HelpText>
        </Stat.Root>
        <Stat.Root>
          <Stat.Label>Calculated duration</Stat.Label>
          <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
            {formatDuration(analysis.timedDurationSeconds)}
          </Stat.ValueText>
          <Stat.HelpText fontSize='xs'>
            Calculated from the recorded times. Gaps and unusable times aren’t counted.
          </Stat.HelpText>
        </Stat.Root>
      </Grid>
      {route ? <Text>This is a planned route. Its times may be estimates.</Text> : null}
      {analysis.warnings.length ? (
        <Box as='details' fontSize='sm'>
          <Box as='summary' cursor='pointer' fontWeight='medium'>
            Measurement warnings ({analysis.warnings.length})
          </Box>
          <Stack as='section' aria-label='Measurement warnings' gap={1} pt={2}>
            {analysis.warnings.map((warning) => {
              return (
                <Text key={warning} fontSize='sm'>
                  {warning}
                </Text>
              );
            })}
          </Stack>
        </Box>
      ) : null}
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }}
        gap={5}
        alignItems='start'
      >
        <Stack gap={2} minW={0} as='section' aria-label='Measurement chart'>
          <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2}>
            <Field.Root>
              <Field.Label>Chart</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={chart}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setActiveChart(
                      value === 'elevation' ? 'elevation' : value === 'pace' ? 'pace' : 'speed'
                    );
                  }}
                >
                  {hasTimedMotion ? (
                    <>
                      <option value='speed'>Speed</option>
                      <option value='pace'>Pace</option>
                    </>
                  ) : null}
                  {hasElevation ? <option value='elevation'>Elevation</option> : null}
                  {!hasTimedMotion && !hasElevation ? (
                    <option value='speed'>No measurements</option>
                  ) : null}
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
            <Field.Root>
              <Field.Label>Display units</Field.Label>
              <NativeSelect.Root>
                <NativeSelect.Field
                  value={units}
                  onChange={(event) => {
                    onUnitsChange(event.currentTarget.value === 'imperial' ? 'imperial' : 'metric');
                  }}
                >
                  <option value='metric'>Metric</option>
                  <option value='imperial'>Imperial</option>
                </NativeSelect.Field>
                <NativeSelect.Indicator />
              </NativeSelect.Root>
            </Field.Root>
          </Grid>
          <Box
            as='section'
            aria-label='Selected measurement'
            aria-live='polite'
            minH='12'
            fontSize='sm'
            bg='bg.subtle'
            rounded='md'
            px={2}
            py={1}
          >
            {selected ? (
              <>
                <Text>
                  Point {selectedIndex + 1} of {analysis.points.length} ·{' '}
                  {formatMeasurement(
                    selected.distanceMetres / labels.metresPerDistance,
                    labels.distance
                  )}
                </Text>
                <Text>
                  Elevation:{' '}
                  <span>
                    {formatMeasurement(
                      selected.elevationMetres === null
                        ? null
                        : selected.elevationMetres / labels.metresPerElevation,
                      labels.elevation
                    )}
                  </span>{' '}
                  · {motion === 'speed' ? 'Speed' : 'Pace'}:{' '}
                  <span>
                    {selectedMotion === null
                      ? 'Unavailable'
                      : formatChartMeasurement(selectedMotion, motionUnit)}
                  </span>
                </Text>
              </>
            ) : (
              <Text>Select a chart point or use Position on route to inspect it.</Text>
            )}
          </Box>
          {chart === 'elevation' ? (
            <>
              {' '}
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
            </>
          ) : (
            <>
              {' '}
              {hasMotion ? (
                <Stack gap={2}>
                  <MeasurementChart
                    data={data}
                    metric='motion'
                    elevationOverlay={
                      motion === 'speed' && hasElevation
                        ? {
                            enabled: showElevation,
                            unit: labels.elevation,
                            onToggle: setShowElevation
                          }
                        : undefined
                    }
                    title={motion === 'speed' ? 'Speed' : 'Pace'}

                    reference={
                      motion === 'speed' && analysis.averageSpeedMetresPerSecond !== null
                        ? {
                            value:
                              (analysis.averageSpeedMetresPerSecond * 3600) /
                              labels.metresPerDistance,
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
                  <Field.Root gap={0}>
                    <Field.Label>
                      Smoothing · <span>{formatSmoothingDuration(smoothingSeconds)}</span>
                      {smoothingSeconds === 0 ? ' (unsmoothed)' : ''}
                    </Field.Label>
                    <Input
                      aria-label='Smoothing'
                      type='range'
                      appearance='auto'
                      accentColor='green.solid'
                      borderWidth={0}
                      p={0}
                      min={0}
                      max={smoothingDurations.length - 1}
                      step={1}
                      value={smoothingDurations.indexOf(smoothingSeconds)}
                      aria-valuetext={
                        smoothingSeconds
                          ? formatSmoothingDuration(smoothingSeconds)
                          : '0 seconds (unsmoothed)'
                      }
                      onChange={(event) => {
                        setSmoothingSeconds(smoothingDurations[Number(event.currentTarget.value)]);
                      }}
                    />
                  </Field.Root>
                  {hasSlowPace ? (
                    <Stack align='start' gap={2}>
                      {!fullPaceRange ? (
                        <Text fontSize='sm' color='fg.muted'>
                          Paces slower than {formatChartValue(paceLimit, motionUnit)} {motionUnit}{' '}
                          are shown at the top. Select a point to see its value.
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
            </>
          )}
          <Dialog.Root placement='center' size='full' motionPreset='none' lazyMount unmountOnExit>
            <Dialog.Trigger asChild>
              <Button display={{ base: 'inline-flex', lg: 'none' }} variant='outline'>
                View on map
              </Button>
            </Dialog.Trigger>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Selected location</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body>
                    {mapView}
                    {selected ? (
                      <Text fontSize='sm'>
                        Point {selectedIndex + 1} · {selected.sample.latitudeDegrees}°,{' '}
                        {selected.sample.longitudeDegrees}°
                      </Text>
                    ) : null}
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Dialog.CloseTrigger asChild position='static'>
                      <Button>Back to chart</Button>
                    </Dialog.CloseTrigger>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
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
                onChange={(event) => {
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
            </Field.Root>
          ) : null}
        </Stack>
        <Box hideBelow='lg' minW={0}>
          {mapView}
        </Box>
      </Grid>
      {!hasTimedMotion && hasElevation ? (
        <Text fontSize='sm'>
          Speed and pace need recorded times. This section doesn’t have enough usable times.
        </Text>
      ) : null}
      {!hasElevation ? <Text fontSize='sm'>No elevation measurements available.</Text> : null}
      {hasElevation || hasMotion ? (
        <Text fontSize='sm' color='fg.muted'>
          Select a point on the chart to see its location on the map. Gaps show where measurements
          are missing.
        </Text>
      ) : null}
      {selected ? (
        <Box as='details' fontSize='sm'>
          <Box as='summary' cursor='pointer' fontWeight='medium'>
            Selected point details
          </Box>
          <Stack gap={1} pt={2}>
            <Text>
              Latitude: {selected.sample.latitudeDegrees}°; Longitude:{' '}
              {selected.sample.longitudeDegrees}°
            </Text>
            <Text>
              Recorded time:{' '}
              <span>
                {selected.sample.sourceTime === ''
                  ? '(empty)'
                  : (selected.sample.sourceTime ?? 'Missing')}
              </span>
            </Text>
            {selected.timeIssue ? <Text>{selected.timeIssue}</Text> : null}
            <Text>
              Elevation and time come from the file. Speed and pace are calculated
              {smoothingSeconds
                ? ` and averaged over ${formatSmoothingDuration(smoothingSeconds)}`
                : ''}
              .
            </Text>
          </Stack>
        </Box>
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
