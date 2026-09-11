import { useMemo } from 'react';
import { Chart, useChart } from '@chakra-ui/charts';
import { Box, Flex, Heading, Stack, Switch, Text } from '@chakra-ui/react';
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
import type { ChartMeasurement } from '../measurementDisplay';
import { formatChartValue, formatChartMeasurement } from '../measurementDisplay';
import { ChartSelection } from './ChartSelection';

type MeasurementChartProps = Readonly<{
  data: ChartMeasurement[];
  metric: 'elevation' | 'motion';
  title: string;
  description?: string;
  maximum?: number;
  elevationOverlay?: Readonly<{
    enabled: boolean;
    unit: string;
    onToggle: (enabled: boolean) => void;
  }>;
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
  elevationOverlay,
  unit,
  distanceUnit,
  selectedId,
  onSelect
}: MeasurementChartProps) => {
  const plottedData = useMemo(() => {
    return data.map((point) => {
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
  const selected = plottedData.find((point) => {
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
      <Flex align='center' justify='space-between' gap={2} wrap='wrap'>
        <Heading as='h3' size='lg'>
          {title}
        </Heading>
        {elevationOverlay ? (
          <Switch.Root
            checked={elevationOverlay.enabled}
            onCheckedChange={(details) => {
              elevationOverlay.onToggle(details.checked);
            }}
            colorPalette='green'
          >
            <Switch.HiddenInput />
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
            <Switch.Label>Show elevation</Switch.Label>
          </Switch.Root>
        ) : null}
      </Flex>
      {description ? (
        <Text fontSize='sm' color='fg.muted'>
          {description}
        </Text>
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
      <Stack direction='row' justify='space-between' fontSize='sm' color='fg.muted'>
        <Text>{unit}</Text>
        {elevationOverlay?.enabled ? <Text>Elevation ({elevationOverlay.unit})</Text> : null}
      </Stack>
      <Chart.Root chart={chart} h={{ base: '48', md: '56' }} maxH='sm' minW={0}>
        <ComposedChart
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
            tickFormatter={(value) => {
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
            tickFormatter={(value) => {
              return formatChartValue(Number(value), unit);
            }}
          />
          {elevationOverlay?.enabled ? (
            <YAxis
              yAxisId='backgroundElevation'
              orientation='right'
              width={44}
              tickCount={4}
              domain={['auto', 'auto']}
              tickFormatter={(value) => {
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
              stroke={chart.color('blue.solid')}
              strokeOpacity={0.25}
              fill={chart.color('blue.solid')}
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
          {isolated.map((point) => {
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
    </Stack>
  );
};
