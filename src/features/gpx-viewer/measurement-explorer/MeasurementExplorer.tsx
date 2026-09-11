import { Box, Grid, Heading, Stack, Text } from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { analyseMeasurements, SPEED_AVERAGE_SECONDS } from '@/analysis/measurements';
import type { Route, Track, TrackSegment } from '@/domain/activityDocument';
import { RouteMap } from '../RouteMap';
import { chartMeasurements, displayUnits } from '../measurementDisplay';
import type { DisplayUnits, MotionDisplay } from '../measurementDisplay';
import { MeasurementChart } from './chart';
import { SelectedMeasurement } from './SelectedMeasurement';
import { MeasurementSummary } from './MeasurementSummary';
import { MobileMapDialog } from './MobileMapDialog';
import { SpeedExplanation } from './SpeedExplanation';
import { MotionControls } from './MotionControls';
import { ChartControls } from './ChartControls';
import { RoutePosition } from './RoutePosition';

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
      <MeasurementSummary analysis={analysis} labels={labels} plannedRoute={Boolean(route)} />
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }}
        gap={5}
        alignItems='start'
      >
        <Stack gap={2} minW={0} as='section' aria-label='Measurement chart'>
          <ChartControls
            chart={chart}
            setActiveChart={setActiveChart}
            hasTimedMotion={hasTimedMotion}
            hasElevation={hasElevation}
            units={units}
            onUnitsChange={onUnitsChange}
          />
          <SelectedMeasurement
            selected={selected}
            labels={labels}
            selectedMotion={selectedMotion}
            motion={motion}
            motionUnit={motionUnit}
            smoothingSeconds={smoothingSeconds}
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
                    maximum={hasSlowPace && !fullPaceRange ? paceLimit : undefined}
                    unit={motionUnit}
                    distanceUnit={labels.distance}
                    selectedId={selected?.sample.id}
                    onSelect={setSelectedId}
                  />
                  <MotionControls
                    smoothingSeconds={smoothingSeconds}
                    setSmoothingSeconds={setSmoothingSeconds}
                    hasSlowPace={hasSlowPace}
                    fullPaceRange={fullPaceRange}
                    setFullPaceRange={setFullPaceRange}
                    paceLimit={paceLimit}
                    motionUnit={motionUnit}
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
          <MobileMapDialog mapView={mapView} selected={selected} />
          <RoutePosition
            points={analysis.points}
            selectedIndex={selectedIndex}
            labels={labels}
            onSelect={setSelectedId}
          />
        </Stack>
        <Box hideBelow='lg' minW={0}>
          {mapView}
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
