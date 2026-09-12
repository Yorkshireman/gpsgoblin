import { useMemo } from 'react';
import { IconButton } from '@chakra-ui/react';
import { DefaultZIndexes, ZIndexLayer, useXAxisScale, useYAxisScale } from 'recharts';
import { formatChartMeasurement } from '../../measurementDisplay';
import type { ChartMeasurement } from '../../measurementDisplay';

type OverflowMarkersProps = Readonly<{
  data: readonly ChartMeasurement[];
  maximum: number;
  unit: string;
  distanceUnit: string;
  selected: ChartMeasurement | undefined;
  onSelect: (id: string) => void;
  onHover: (id: string | undefined) => void;
}>;

export const OverflowMarkers = ({ data, maximum, unit, distanceUnit, selected, onSelect, onHover }: OverflowMarkersProps) => {
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  const peaks = useMemo(() => {
    const result: ChartMeasurement[] = [];
    let peak: ChartMeasurement | undefined;
    // Mark the highest original sample in each continuous visible overflow run.
    for (const point of data) {
      if (point.sampleId && point.motion !== null && point.motion > maximum) {
        if (!peak || point.motion > (peak.motion ?? 0)) peak = point;
      } else if (peak) {
        result.push(peak);
        peak = undefined;
      }
    }
    if (peak) result.push(peak);
    return result;
  }, [data, maximum]);
  // Keep touch targets separate when several overflow runs share a narrow area.
  // Every source sample remains accessible through the route position control.
  const markers = useMemo(() => {
    if (!xScale) return [];
    const result: ChartMeasurement[] = [];
    for (const peak of peaks) {
      const previous = result.at(-1);
      if (previous && Math.abs((xScale(peak.distance) ?? 0) - (xScale(previous.distance) ?? 0)) < 32) {
        if ((peak.motion ?? 0) > (previous.motion ?? 0)) result[result.length - 1] = peak;
      } else {
        result.push(peak);
      }
    }
    if (selected?.motion != null && selected.motion > maximum) {
      return [...result.filter(point => {
        return Math.abs((xScale(point.distance) ?? 0) - (xScale(selected.distance) ?? 0)) >= 32;
      }), selected];
    }
    return result;
  }, [peaks, selected, maximum, xScale]);
  const y = yScale?.(maximum);
  if (!xScale || y === undefined) return null;
  return (
    <ZIndexLayer zIndex={DefaultZIndexes.label + 2}>
      {markers.map(point => {
        const x = xScale(point.distance);
        if (x === undefined || !point.sampleId || point.motion === null) return null;
        const label = `Above range: ${formatChartMeasurement(point.motion, unit)} at ${point.distance.toFixed(2)} ${distanceUnit}`;
        return (
          <foreignObject key={point.sampleId} x={x - 14} y={Math.max(0, y - 10)} width={28} height={28} overflow='visible'>
            <IconButton type='button' aria-label={label} title={label} size='2xs' width='28px' height='28px'
              colorPalette='green' variant={point.sampleId === selected?.sampleId ? 'solid' : 'outline'}
              bg={point.sampleId === selected?.sampleId ? 'green.solid' : 'bg.panel'} rounded='full'
              onPointerEnter={() => {
                onHover(point.sampleId ?? undefined);
              }}
              onPointerLeave={() => {
                onHover(undefined);
              }}
              onClick={() => {
                if (point.sampleId) onSelect(point.sampleId);
              }}>
              <svg viewBox='0 0 16 16' width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true'>
                <path d='M3 8L8 3L13 8M8 3V14' />
              </svg>
            </IconButton>
          </foreignObject>
        );
      })}
    </ZIndexLayer>
  );
};
