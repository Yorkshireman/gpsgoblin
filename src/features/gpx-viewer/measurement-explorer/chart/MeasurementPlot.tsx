import { useMemo } from 'react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Stack, Text } from '@chakra-ui/react';
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
import type { MeasurementChartProps } from './chartTypes';

export const MeasurementPlot = ({
  data,
  metric,
  title,
  maximum,
  reference,
  elevationOverlay,
  unit,
  distanceUnit,
  selectedId,
  onSelect
}: MeasurementChartProps) => {
  const plottedData = useMemo(() => {
    return data.map(point => {
      return {
        ...point,
        originalValue: point[metric],
        [metric]: point[metric] === null ? null : Math.min(point[metric], maximum ?? Infinity)
      };
    });
  }, [data, metric, maximum]);
  const chart = useChart({
    data: plottedData,
    series: [{ name: metric, color: 'green.solid', label: `${title} (${unit})` }]
  });
  const selected = plottedData.find(point => {
    return point.sampleId === selectedId;
  });
  const isolated = plottedData.filter((point, index) => {
    return (
      point.sampleId &&
      point.sampleId !== selectedId &&
      point[metric] !== null &&
      data[index - 1]?.[metric] == null &&
      data[index + 1]?.[metric] == null
    );
  });
  return (
    <Chart.Root chart={chart} h={{ base: '48', md: '56' }} maxH='sm' minW={0}>
      <ComposedChart
        responsive
        style={{ width: '100%', height: '100%' }}
        data={chart.data}
        margin={{ top: 12, right: 8, bottom: 28, left: 0 }}
        accessibilityLayer
      >
        <CartesianGrid stroke={chart.color('border.muted')} vertical={false} />
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
            maximum !== undefined
              ? [0, maximum]
              : metric === 'motion'
                ? [0, 'auto']
                : ['auto', 'auto']
          }
          allowDataOverflow={maximum !== undefined}
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
            if (!active || !point || typeof point.originalValue !== 'number') {
              return null;
            }
            return (
              <Stack bg='bg.panel' rounded='l2' shadow='md' px={3} py={2} gap={1} fontSize='xs'>
                <Text>
                  Distance: {Number(label).toFixed(2)} {distanceUnit}
                </Text>
                <Text>
                  {title}: {formatChartMeasurement(point.originalValue, unit)}
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
        <ChartSelection data={plottedData} metric={metric} onSelect={onSelect} />
      </ComposedChart>
    </Chart.Root>
  );
};
