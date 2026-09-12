import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Box, Stack, Text } from '@chakra-ui/react';
import {
  Area,
  CartesianGrid,
  Line,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { formatChartValue, formatChartMeasurement } from '../../measurementDisplay';
import { ChartSelection } from './ChartSelection';
import { downsampleChart } from './downsampleChart';
import type { MeasurementChartProps } from './chartTypes';

const noVerticalGrid = () => {
  return [];
};

export const MeasurementPlot = ({
  data,
  metric,
  title,
  reference,
  elevationOverlay,
  unit,
  distanceUnit,
  selectedId,
  onSelect
}: MeasurementChartProps) => {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    const element = container.current;
    if (!element) return;
    const resize = () => {
      setWidth(Math.floor(element.getBoundingClientRect().width));
      return;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const displayData = useMemo(() => {
    return downsampleChart(data, width);
  }, [data, width]);
  const chart = useChart({
    data: displayData,
    series: [{ name: metric, color: 'green.solid', label: `${title} (${unit})` }]
  });
  const selected = data.find(point => {
    return point.sampleId === selectedId;
  });
  const isolated = displayData.filter((point, index) => {
    return (
      point.sampleId &&
      point.sampleId !== selectedId &&
      point[metric] !== null &&
      displayData[index - 1]?.[metric] == null &&
      displayData[index + 1]?.[metric] == null
    );
  });
  return (
    <Box ref={container} h={{ base: '48', md: '56' }} maxH='sm' minW={0}>
      {width > 0 ? (
        <Chart.Root chart={chart} h='full' minW={0}>
          <ComposedChart
            responsive
            style={{ width: '100%', height: '100%' }}
            data={chart.data}
            margin={{ top: 12, right: 8, bottom: 28, left: 0 }}
            accessibilityLayer
          >
            <CartesianGrid
              stroke={chart.color('border.muted')}
              vertical={false}
              verticalCoordinatesGenerator={noVerticalGrid}
            />
            <XAxis
              type='number'
              dataKey='distance'
              domain={['dataMin', 'dataMax']}
              tickFormatter={value => {
                return Number(Number(value).toFixed(1)).toString();
              }}
              label={{
                value: `Distance (${distanceUnit})`,
                position: 'bottom',
                offset: 10
              }}
            />
            <YAxis
              type='number'
              domain={
                unit.startsWith('min/')
                  ? [0, 'dataMax']
                  : metric === 'motion'
                    ? [0, 'auto']
                    : ['auto', 'auto']
              }
              padding={{ top: unit.startsWith('min/') ? 3 : 0 }}
              width='auto'
              tickFormatter={value => {
                return formatChartValue(Number(value), unit);
              }}
            />
            {elevationOverlay?.enabled ? (
              <YAxis
                yAxisId='backgroundElevation'
                orientation='right'
                width='auto'
                tickCount={4}
                domain={['auto', 'auto']}
                tickFormatter={value => {
                  return formatChartValue(Number(value), elevationOverlay.unit);
                }}
              />
            ) : null}
            {elevationOverlay?.enabled ? (
              <Area
                className='elevation-background'
                yAxisId='backgroundElevation'
                type='linear'
                dataKey='elevation'
                baseValue='dataMin'
                stroke={chart.color('bg.inverted')}
                strokeOpacity={0.25}
                fill={chart.color('bg.inverted')}
                fillOpacity={0.12}
                connectNulls={false}
                activeDot={false}
                dot={false}
                isAnimationActive={false}
              />
            ) : null}
            <Tooltip
              content={({ active, payload, label }) => {
                const point = payload?.[0]?.payload;
                if (!active || !point || typeof point[metric] !== 'number') {
                  return null;
                }
                return (
                  <Stack bg='bg.panel' rounded='l2' shadow='md' px={3} py={2} gap={1} fontSize='xs'>
                    <Text>
                      Distance: {Number(label).toFixed(2)} {distanceUnit}
                    </Text>
                    <Text>
                      {title}: {formatChartMeasurement(point[metric], unit)}
                    </Text>
                    {elevationOverlay?.enabled && typeof point.elevation === 'number' ? (
                      <Text>
                        Elevation: {formatChartMeasurement(point.elevation, elevationOverlay.unit)}
                      </Text>
                    ) : null}
                  </Stack>
                );
              }}
            />
            <Line
              type='linear'
              dataKey={metric}
              stroke={chart.color('green.solid')}
              connectNulls={false}
              activeDot={false}
              isAnimationActive={false}
              dot={false}
              strokeWidth={2}
            />
            {reference ? (
              <ReferenceLine
                y={reference.value}
                stroke={chart.color('fg.muted')}
                strokeWidth={2}
                strokeDasharray='6 4'
                ifOverflow='extendDomain'
              />
            ) : null}
            {isolated.map(point => {
              return (
                <ReferenceDot
                  key={point.sampleId}
                  x={point.distance}
                  y={point[metric] ?? undefined}
                  r={3}
                  fill={chart.color('green.solid')}
                  stroke='none'
                />
              );
            })}
            {selected && selected[metric] !== null ? (
              <ReferenceDot
                x={selected.distance}
                y={selected[metric]}
                r={6}
                fill={chart.color('green.solid')}
                stroke={chart.color('fg')}
              />
            ) : null}
            <ChartSelection data={data} metric={metric} onSelect={onSelect} />
          </ComposedChart>
        </Chart.Root>
      ) : null}
    </Box>
  );
};
