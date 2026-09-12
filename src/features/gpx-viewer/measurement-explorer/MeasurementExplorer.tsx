import { Box, Button, Grid, Heading, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { SPEED_AVERAGE_SECONDS } from '@/analysis/measurements';
import type { Route, Track, TrackSegment } from '@/domain/activityDocument';
import { RouteMap } from '../RouteMap';
import { displayUnits } from '../measurementDisplay';
import type { DisplayUnits, MotionDisplay } from '../measurementDisplay';
import { MeasurementChart } from './chart';
import { SelectedMeasurement } from './SelectedMeasurement';
import { MeasurementSummary } from './MeasurementSummary';
import { MobileMapDialog } from './MobileMapDialog';
import { SpeedExplanation } from './SpeedExplanation';
import { MotionControls } from './MotionControls';
import { ChartControls } from './ChartControls';
import { PaceRangeControls } from './PaceRangeControls';
import { RoutePosition } from './RoutePosition';
import type { MeasurementSession } from '../import-processing';
import { useMeasurementView } from './useMeasurementView';

type MeasurementExplorerProps = (
  | Readonly<{ track: Track; segment?: TrackSegment; route?: never }>
  | Readonly<{ route: Route; track?: never; segment?: never }>
) &
  Readonly<{ measurements: MeasurementSession; units: DisplayUnits; onUnitsChange: (units: DisplayUnits) => void }>;

export const MeasurementExplorer = ({
  track,
  measurements,
  segment,
  route,
  units,
  onUnitsChange
}: MeasurementExplorerProps) => {
  const showDesktopMap = useBreakpointValue({ base: false, lg: true });
  const [activeChart, setActiveChart] = useState<'speed' | 'pace' | 'elevation'>('speed');
  const requestedMotion: MotionDisplay = activeChart === 'pace' ? 'pace' : 'speed';
  const [showElevation, setShowElevation] = useState(false);
  const [customPaceRange, setCustomPaceRange] = useState(false);
  const [paceMaximumPerKm, setPaceMaximumPerKm] = useState<number>();
  const [smoothingSeconds, setSmoothingSeconds] = useState(SPEED_AVERAGE_SECONDS);
  const segments = useMemo(() => {
    return track ? (segment ? [segment] : track.segments) : [{ id: route.id, samples: route.points }];
  }, [track, segment, route]);
  const settings = useMemo(() => {
    return { entityId: track ? track.id : route.id, segmentId: segment?.id,
      units, motion: requestedMotion, smoothingSeconds };
  }, [track, route, segment, units, requestedMotion, smoothingSeconds]);
  const prepared = useMeasurementView(measurements, segments, settings);
  const [selection, setSelection] = useState<{ segments: typeof segments; id: string }>();
  const selectedId = selection?.segments === segments ? selection.id : undefined;
  const setSelectedId = (id: string) => {
    setSelection({ segments, id });
    return;
  };
  if (!prepared.snapshot) {
    return <Stack gap={2} role='status'>
      <Text>{prepared.error ?? 'Preparing measurements…'}</Text>
      {prepared.error ? <Button onClick={prepared.retry} alignSelf='start'>Retry measurements</Button> : null}
    </Stack>;
  }
  const { analysis, data, hasMotion, hasElevation } = prepared.snapshot;
  const motion = prepared.snapshot.settings.motion;
  const labels = displayUnits(prepared.snapshot.settings.units);
  const selectedIndex = analysis.points.findIndex(point => {
    return point.sample.id === selectedId;
  });
  const selected = analysis.points[selectedIndex];
  const selectedChartPoint = data.find(point => {
    return point.sampleId === selectedId;
  });
  const selectedMotion = selectedChartPoint?.motion ?? null;
  const motionUnit = motion === 'speed' ? labels.speed : labels.pace;

  const hasTimedMotion = analysis.averageSpeedMetresPerSecond !== null;
  const chart =
    !hasTimedMotion && hasElevation
      ? 'elevation'
      : activeChart === 'elevation' && !hasElevation
        ? 'speed'
        : activeChart === 'elevation' ? 'elevation' : motion;
  const paceMaximum = paceMaximumPerKm === undefined ? undefined : paceMaximumPerKm * (labels.metresPerDistance / 1000);
  const axisMaximum = chart === 'pace' && customPaceRange ? paceMaximum : undefined;
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
      <MeasurementSummary analysis={analysis} labels={labels} plannedRoute={Boolean(route)} />
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }}
        gap={5}
        alignItems='start'
      >
        <Stack gap={2} minW={0} as='section' aria-label='Measurement chart' aria-busy={prepared.pending}>
          <ChartControls
            chart={activeChart === 'elevation' && !hasElevation ? chart : !hasTimedMotion ? chart : activeChart}
            setActiveChart={setActiveChart}
            hasTimedMotion={hasTimedMotion}
            hasElevation={hasElevation}
            units={units}
            onUnitsChange={onUnitsChange}
            pending={prepared.pending}
          />
          {prepared.error ? (
            <Text role='status' fontSize='xs'>{prepared.error}</Text>
          ) : null}
          {prepared.error ? <Button size='sm' onClick={prepared.retry}>Retry measurements</Button> : null}
          {activeChart === 'pace' && hasTimedMotion ? (
            <PaceRangeControls key={labels.pace} custom={customPaceRange} onCustomChange={setCustomPaceRange}
              maximum={paceMaximum} unit={labels.pace} onMaximumChange={value => {
                setPaceMaximumPerKm(value === undefined ? undefined : value / (labels.metresPerDistance / 1000));
              }} />
          ) : null}
          <SelectedMeasurement
            selected={selected}
            labels={labels}
            selectedMotion={selectedMotion}
            axisMaximum={axisMaximum}
            motion={motion}
            motionUnit={motionUnit}
            smoothingSeconds={prepared.snapshot.settings.smoothingSeconds}
          />
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
                      hasElevation
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
                    axisMaximum={axisMaximum}
                    unit={motionUnit}
                    distanceUnit={labels.distance}
                    selectedId={selected?.sample.id}
                    onSelect={setSelectedId}
                  />
                  <MotionControls
                    pending={prepared.pending}
                    smoothingSeconds={smoothingSeconds}
                    setSmoothingSeconds={setSmoothingSeconds}
                  />
                </Stack>
              ) : (
                <Text>
                  {motion === 'pace' && analysis.timedIntervalCount
                    ? 'Pace is unavailable while stopped.'
                    : "Speed and pace need recorded times. This section doesn't have enough usable times."}
                </Text>
              )}
            </>
          )}
          {!showDesktopMap ? <MobileMapDialog mapView={mapView} selected={selected} /> : null}
          <RoutePosition
            points={analysis.points}
            selectedIndex={selectedIndex}
            labels={labels}
            onSelect={setSelectedId}
          />
        </Stack>
        <Box hideBelow='lg' minW={0}>
          {showDesktopMap ? mapView : null}
        </Box>
      </Grid>
      {!hasTimedMotion && hasElevation ? (
        <Text fontSize='sm'>
          Speed and pace need recorded times. This section doesn&apos;t have enough usable times.
        </Text>
      ) : null}
      {!hasElevation ? <Text fontSize='sm'>No elevation measurements available.</Text> : null}
      {hasElevation || hasMotion ? (
        <Text fontSize='sm' color='fg.muted'>
          Select a point on the chart to see its location on the map. Gaps show where measurements
          are missing.
        </Text>
      ) : null}
      <SpeedExplanation
        timedIntervalCount={analysis.timedIntervalCount}
        intervalCount={analysis.intervalCount}
      />
    </Stack>
  );
};
