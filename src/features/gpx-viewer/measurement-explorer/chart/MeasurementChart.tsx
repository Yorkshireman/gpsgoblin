import { Box, Flex, Heading, Stack, Switch, Text } from '@chakra-ui/react';
import { formatChartMeasurement } from '../../measurementDisplay';
import { MeasurementPlot } from './MeasurementPlot';
import type { MeasurementChartProps } from './chartTypes';

export const MeasurementChart = (props: MeasurementChartProps) => {
  const { title, description, reference, elevationOverlay, unit } = props;
  return (
    <Stack gap={2} minW={0}>
      <Flex align='center' justify='space-between' gap={2} wrap='wrap'>
        <Heading as='h3' size='lg'>
          {title}
        </Heading>
        {elevationOverlay ? (
          <Switch.Root
            checked={elevationOverlay.enabled}
            onCheckedChange={details => {
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
      {props.axisMaximum !== undefined && props.data.some(point => {
        return point.motion !== null && point.motion > (props.axisMaximum ?? Infinity);
      }) ? (
        <Text fontSize='xs'>↑ Above {formatChartMeasurement(props.axisMaximum, unit)}. Select an arrow to inspect the peak.</Text>
      ) : null}
      <Stack direction='row' justify='space-between' fontSize='sm' color='fg.muted'>
        <Text>{unit}</Text>
        {elevationOverlay?.enabled ? <Text>Elevation ({elevationOverlay.unit})</Text> : null}
      </Stack>
      <MeasurementPlot {...props} />
    </Stack>
  );
};
