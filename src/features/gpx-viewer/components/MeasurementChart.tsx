import { Chart, useChart } from '@chakra-ui/charts';
import { Heading, Stack } from '@chakra-ui/react';
import { CartesianGrid, Line, LineChart, ReferenceDot, Tooltip, XAxis, YAxis } from 'recharts';
import type { ChartMeasurement } from '../measurementDisplay';

type MeasurementChartProps = Readonly<{
  data: ChartMeasurement[];
  metric: 'elevation' | 'motion';
  title: string;
  unit: string;
  distanceUnit: string;
  selectedId?: string;
  onSelect: (id: string) => void;
}>;

export const MeasurementChart = ({
  data,
  metric,
  title,
  unit,
  distanceUnit,
  selectedId,
  onSelect
}: MeasurementChartProps) => {
  const chart = useChart({
    data,
    series: [{ name: metric, color: 'green.solid', label: `${title} (${unit})` }]
  });
  const selected = data.find(point => {
    return point.sampleId === selectedId;
  });
  return (
    <Stack gap={2} minW={0}>
      <Heading as='h3' size='lg'>
        {title}
      </Heading>
      <Chart.Root chart={chart} h={{ base: '64', md: '72' }} maxH='sm' minW={0}>
        <LineChart
          responsive
          style={{ width: '100%', height: '100%' }}
          data={chart.data}
          margin={{ top: 12, right: 20, bottom: 28, left: 18 }}
          accessibilityLayer
        >
          <CartesianGrid stroke={chart.color('border.muted')} vertical={false} />
          <XAxis
            type='number'
            dataKey='distance'
            domain={['dataMin', 'dataMax']}
            tickFormatter={value => {
              return Number(value).toFixed(1);
            }}
            label={{
              value: `Calculated distance (${distanceUnit})`,
              position: 'bottom',
              offset: 10
            }}
          />
          <YAxis
            type='number'
            domain={metric === 'motion' ? [0, 'auto'] : ['auto', 'auto']}
            tickFormatter={value => {
              return Number(value).toFixed(1);
            }}
            label={{ value: unit, angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            content={<Chart.Tooltip />}
            labelFormatter={value => {
              return `Distance: ${Number(value).toFixed(2)} ${distanceUnit}`;
            }}
            formatter={value => {
              return [`${Number(value).toFixed(2)} ${unit}`, title];
            }}
          />
          <Line
            type='linear'
            dataKey={metric}
            stroke={chart.color('green.solid')}
            connectNulls={false}
            activeDot={false}
            isAnimationActive={false}
            dot={props => {
              const point = data[props.index];
              if (!point?.sampleId || point[metric] === null) {
                return <g key={props.key} />;
              }
              const id = point.sampleId;
              return (
                <circle
                  key={props.key}
                  cx={props.cx}
                  cy={props.cy}
                  r={4}
                  fill={chart.color('green.solid')}
                  stroke={chart.color('bg')}
                  role='button'
                  tabIndex={-1}
                  aria-label={`Inspect ${title}: ${point[metric]?.toFixed(1)} ${unit}`}
                  onClick={() => {
                    onSelect(id);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onSelect(id);
                    }
                  }}
                />
              );
            }}
          />
          {selected && selected[metric] !== null ? (
            <ReferenceDot
              x={selected.distance}
              y={selected[metric]}
              r={6}
              fill={chart.color('green.solid')}
              stroke={chart.color('fg')}
            />
          ) : null}
        </LineChart>
      </Chart.Root>
    </Stack>
  );
};
