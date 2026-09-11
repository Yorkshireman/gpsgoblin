import { useMemo } from 'react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Box, Heading, Stack, Text } from '@chakra-ui/react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import type { ChartMeasurement } from '../measurementDisplay';
import { formatChartValue, formatChartMeasurement } from '../measurementDisplay';
import { ChartSelection } from './ChartSelection';

type MeasurementChartProps = Readonly<{
  data: ChartMeasurement[];
  metric: 'elevation' | 'motion';
  title: string;
  description?: string;
  maximum?: number;
  reference?: Readonly<{ value: number; label: string }>;
  unit: string;
  distanceUnit: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}>;

export const MeasurementChart = ({
  data,
  metric,
  title,
  description,
  maximum,
  reference,
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
  const showTrend =
    metric === 'motion' &&
    data.some(point => {
      return point.trendSpeed !== null;
    });
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
    <Stack gap={2} minW={0}>
      <Heading as='h3' size='lg'>
        {title}
      </Heading>
      {description ? (
        <Text fontSize='sm' color='fg.muted'>
          {description}
        </Text>
      ) : null}
      {showTrend ? (
        <Stack direction='row' align='center' gap={2}>
          <Box aria-hidden='true' width='6' borderTopWidth='3px' borderColor='blue.solid' />
          <Text fontSize='sm'>Speed trend · 5-minute average</Text>
        </Stack>
      ) : null}
      {reference ? (
        <Stack direction='row' align='center' gap={2}>
          <Box
            aria-hidden='true'
            width='6'
            borderTopWidth='2px'
            borderStyle='dashed'
            borderColor='fg.muted'
          />
          <Text fontSize='sm'>
            {reference.label}: {formatChartMeasurement(reference.value, unit)}
          </Text>
        </Stack>
      ) : null}
      <Text fontSize='sm' color='fg.muted'>
        {unit}
      </Text>
      <Chart.Root chart={chart} h={{ base: '64', md: '72' }} maxH='sm' minW={0}>
        <LineChart
          responsive
          style={{ width: '100%', height: '100%' }}
          data={chart.data}
          margin={{ top: 12, right: 20, bottom: 28, left: 0 }}
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
            width={72}
            tickFormatter={value => {
              return formatChartValue(Number(value), unit);
            }}
          />
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
                  {showTrend && typeof point.trendSpeed === 'number' ? (
                    <Text>5-minute average: {formatChartMeasurement(point.trendSpeed, unit)}</Text>
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
            strokeWidth={showTrend ? 1 : 2}
            strokeOpacity={showTrend ? 0.5 : 1}
          />
          {showTrend ? (
            <Line
              className='speed-trend'
              type='linear'
              dataKey='trendSpeed'
              stroke={chart.color('blue.solid')}
              strokeWidth={3}
              connectNulls={false}
              activeDot={false}
              isAnimationActive={false}
              dot={false}
            />
          ) : null}
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
        </LineChart>
      </Chart.Root>
    </Stack>
  );
};
