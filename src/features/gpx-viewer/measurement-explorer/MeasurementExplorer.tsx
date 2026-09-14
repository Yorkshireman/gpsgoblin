import { Box, Button, Flex, Grid, Heading, Stack, Text, useBreakpointValue } from '@chakra-ui/react';
import { useMemo, useRef, useState } from 'react';
import { SPEED_AVERAGE_SECONDS } from '@/analysis/measurements';
import type { Route, Track, TrackSegment } from '@/domain/activityDocument';
import { RouteMap } from '../RouteMap';
import { displayUnits, formatDuration } from '../measurementDisplay';
import type { DisplayUnits, MotionDisplay } from '../measurementDisplay';
import { MeasurementChart } from './chart';
import { RecordingGapControl } from './RecordingGapControl';
import { CalculationBasis } from './CalculationBasis';
import { StopDialog } from './StopDialog';
import { StopOptions } from './StopOptions';
import { StopReview, SelectedStop, StopSearchResult } from './StopReview';
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
  const [axis, setAxis] = useState<'distance' | 'time'>('distance');
  const [stopMode, setStopMode] = useState<'include' | 'exclude'>('include');
  const [confirmedStopIds, setConfirmedStopIds] = useState<readonly string[]>([]);
  const [showElevation, setShowElevation] = useState(false);
  const [paceRange, setPaceRange] = useState<'suggested' | 'full' | 'custom'>('suggested');
  const [paceMaximumPerKm, setPaceMaximumPerKm] = useState<number>();
  const [hasChosenCustomMaximum, setHasChosenCustomMaximum] = useState(false);
  const [smoothingSeconds, setSmoothingSeconds] = useState(SPEED_AVERAGE_SECONDS);
  const segments = useMemo(() => {
    return track ? (segment ? [segment] : track.segments) : [{ id: route.id, samples: route.points }];
  }, [track, segment, route]);
  const settings = useMemo(() => {
    return { entityId: track ? track.id : route.id, segmentId: segment?.id,
      units, motion: requestedMotion, smoothingSeconds, stopMode, confirmedStopIds };
  }, [track, route, segment, units, requestedMotion, smoothingSeconds, stopMode, confirmedStopIds]);
  const prepared = useMeasurementView(measurements, segments, settings);
  const useTime = axis === 'time' && Boolean(prepared.snapshot?.timeAvailable) && activeChart !== 'elevation';
  const plotData = useMemo(() => {
    return prepared.snapshot?.data.map(point => { return { ...point, position: useTime ? point.timeMinutes ?? 0 : point.distance }; }) ?? [];
  }, [prepared.snapshot?.data, useTime]);
  const [selection, setSelection] = useState<{ segments: typeof segments; id: string; kind: 'point' | 'stop' }>();
  const selectedId = selection?.segments === segments ? selection.id : undefined;
  const setSelectedId = (id: string | undefined) => {
    setSelection(id === undefined ? undefined : { segments, id, kind: 'point' });
    return;
  };
  const stopTrigger = useRef<HTMLElement | null>(null);
  const chartRegion = useRef<HTMLDivElement | null>(null);
  const setSelectedStopId = (id: string | undefined, trigger?: HTMLElement) => {
    if (id && selection?.kind !== 'stop') stopTrigger.current = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setSelection(id === undefined ? undefined : { segments, id, kind: 'stop' });
    return;
  };
  if (!prepared.snapshot) {
    return <Stack gap={2} role='status'>
      <Text>{prepared.error ?? 'Preparing your charts…'}</Text>
      {prepared.error ? <Button onClick={prepared.retry} alignSelf='start'>Try again</Button> : null}
    </Stack>;
  }
  const { analysis, data, hasMotion, hasElevation, basis } = prepared.snapshot;
  const motion = prepared.snapshot.settings.motion;
  const labels = displayUnits(prepared.snapshot.settings.units);
  const selectedIndex = analysis.points.findIndex(point => {
    return point.sample.id === selectedId;
  });
  const selected = analysis.points[selectedIndex];
  const selectedStop = selection?.kind === 'stop' ? analysis.stops.candidates.find(candidate => { return selectedIndex >= candidate.startIndex && selectedIndex <= candidate.endIndex; }) : undefined;
  const isMoving = basis.mode === 'exclude';
  const options = <>
    <StopOptions mode={stopMode} onModeChange={setStopMode} axis={useTime ? 'time' : 'distance'}
      onAxisChange={setAxis} recorded={analysis.recorded} timeAvailable={prepared.snapshot.timeAvailable} />
    {analysis.recorded && !analysis.stops.candidates.length ? <StopReview evidence={analysis.stops} onSelect={setSelectedStopId} /> : null}
  </>;
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
  const axisMaximum = chart === 'pace' ? paceRange === 'suggested' ? prepared.snapshot.suggestedPaceMaximum : paceRange === 'custom' ? paceMaximum : undefined : undefined;
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

  const activeBasis = <Stack gap={1} fontSize='xs' aria-label='Active calculation'>
            <CalculationBasis mode={motion} excludedSeconds={basis.excludedSeconds} onInclude={() => { setStopMode('include'); }} />
            {analysis.stops.candidates.length > 0 && !selectedStop ? <Text>A stop is left out only when you tick its box.</Text> : null}
            {basis.partialCoverage ? <Text>Some of the trip is missing from this average.</Text> : null}
            {!analysis.stops.candidates.length ? <StopSearchResult evidence={analysis.stops} /> : null}
            {basis.gapSeconds > 0 ? <Text>Recording gaps: {formatDuration(basis.gapSeconds)} left out. Their time and distance don&apos;t count towards the average.</Text> : null}
          </Stack>;
  const motionChart = <MeasurementChart
                    data={plotData}
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
                    title={isMoving ? `Moving ${motion}` : motion === 'speed' ? 'Speed' : 'Pace'}
                    basisLabel={!isMoving && analysis.recorded ? 'Includes stops' : undefined}
                    onStopSelect={setSelectedStopId}
                    axisLabel={useTime ? `${isMoving ? 'Estimated moving time' : 'Elapsed time'} (min)` : undefined}
                    reference={(motion === 'speed' || isMoving) && basis.averageSpeedMetresPerSecond !== null && (motion === 'speed' || basis.averageSpeedMetresPerSecond > 0)
                      ? { value: motion === 'speed' ? basis.averageSpeedMetresPerSecond * 3600 / labels.metresPerDistance
                        : labels.metresPerDistance / basis.averageSpeedMetresPerSecond / 60,
                        label: `Average ${isMoving ? 'moving ' : ''}${motion}${!isMoving && basis.gapSeconds > 0 ? ' (including gaps)' : ''}` }
                      : undefined}
                    axisMaximum={axisMaximum}
                    unit={motionUnit}
                    distanceUnit={labels.distance}
                    selectedId={selected?.sample.id}
                    onSelect={setSelectedId}
                  />;

  return (
    <Stack gap={3} width='full' minW={0}>
      <MeasurementSummary analysis={analysis} labels={labels} plannedRoute={Boolean(route)} />
      <Grid
        templateColumns={{ base: 'minmax(0, 1fr)', lg: 'minmax(0, 3fr) minmax(0, 2fr)' }}
        gap={5}
        alignItems='start'
      >
        <Stack ref={chartRegion} tabIndex={-1} gap={1.5} minW={0} as='section' aria-label='Measurement chart' aria-busy={prepared.pending}>
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
          {prepared.error ? <Button size='sm' onClick={prepared.retry}>Try again</Button> : null}
          {!selectedStop && chart !== 'elevation' && isMoving ? activeBasis : null}
          {activeChart === 'pace' && hasTimedMotion ? (
            <PaceRangeControls mode={paceRange} onModeChange={mode => {
              if (mode === 'custom' && !hasChosenCustomMaximum) {
                const suggested = prepared.snapshot?.suggestedPaceMaximum;
                setPaceMaximumPerKm(suggested === undefined ? undefined : suggested / (labels.metresPerDistance / 1000));
                setHasChosenCustomMaximum(true);
              }
              setPaceRange(mode);
            }} suggestedMaximum={prepared.snapshot.suggestedPaceMaximum}
              maximum={paceMaximum} unit={labels.pace} onMaximumChange={value => {
                setPaceMaximumPerKm(value === undefined ? undefined : value / (labels.metresPerDistance / 1000));
              }}>{options}</PaceRangeControls>
          ) : chart !== 'elevation' ? <Flex gap={3} wrap='wrap' align='start'>
            <Box as='details' fontSize='sm' css={{ '&[open]': { width: '100%' } }}><Box as='summary' cursor='pointer'>Chart options</Box>{options}</Box>
            <RecordingGapControl points={analysis.points} selectedId={selectedId} onSelect={setSelectedId} />
          </Flex> : null}
          {activeChart === 'pace' ? <RecordingGapControl points={analysis.points} selectedId={selectedId} onSelect={setSelectedId} /> : null}
          {chart !== 'elevation' && analysis.recorded && analysis.stops.candidates.length > 0 ? <StopReview evidence={analysis.stops} selected={selectedStop} onSelect={setSelectedStopId} /> : null}
          {chart !== 'elevation' && selectedStop ? <StopDialog onClose={() => { setSelectedId(undefined); }} returnFocus={() => {
            return stopTrigger.current?.isConnected ? stopTrigger.current : chartRegion.current;
          }}>
            <SelectedStop candidate={selectedStop} points={analysis.points} labels={labels}
            confirmed={confirmedStopIds.includes(selectedStop.id)} excluded={isMoving && confirmedStopIds.includes(selectedStop.id)} pending={prepared.pending}
            onClear={() => { setSelectedId(undefined); }} onConfirm={confirmed => {
              setConfirmedStopIds(ids => { return confirmed ? [...ids.filter(id => { return id !== selectedStop.id; }), selectedStop.id] : ids.filter(id => { return id !== selectedStop.id; }); });
              if (confirmed) setStopMode('exclude');
            }} />
            {prepared.error ? <Text role='status' fontSize='xs'>{prepared.error}<Button size='xs' onClick={prepared.retry}>Try again</Button></Text> : null}
            {isMoving ? activeBasis : null}
            {motionChart}
          </StopDialog> : selected ? <SelectedMeasurement
            onClear={() => {
              setSelectedId(undefined);
              chartRegion.current?.focus({ preventScroll: true });
            }}
            selected={selected}
            labels={labels}
            selectedMotion={selectedMotion}
            axisMaximum={axisMaximum}
            motion={motion}
            motionUnit={motionUnit}
            smoothingSeconds={prepared.snapshot.settings.smoothingSeconds}
          /> : null}
          {chart === 'elevation' ? (
            <>
              {' '}
              {hasElevation ? (
                <MeasurementChart
                  data={plotData}
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
                  {motionChart}
                  <MotionControls
                    pending={prepared.pending}
                    smoothingSeconds={smoothingSeconds}
                    setSmoothingSeconds={setSmoothingSeconds}
                  />
                </Stack>
              ) : (
                <Text>
                  {isMoving ? 'Nothing is left to show with these stops excluded. Choose Include stops to see the chart again.' : motion === 'pace' && analysis.timedIntervalCount
                    ? "Pace can’t be calculated when no distance is covered."
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
        <Text aria-label={!selected ? 'Chart selection tip' : undefined} fontSize='sm' color='fg.muted'>
          Select a point on the chart to see its location on the map. Breaks in the line show missing readings or stops you chose to leave out.
        </Text>
      ) : null}
      <SpeedExplanation moving={isMoving} />
    </Stack>
  );
};
