import { Box, Flex, Grid, Icon, Stack, Text } from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';
import {
  displayUnits,
  formatMeasurement,
  formatChartMeasurement,
  formatRecordedTime,
  formatSmoothingDuration
} from '../measurementDisplay';
import type { MotionDisplay } from '../measurementDisplay';

type SelectedMeasurementProps = Readonly<{
  selected: MeasurementPoint | undefined;
  labels: ReturnType<typeof displayUnits>;
  selectedMotion: number | null;
  motion: MotionDisplay;
  motionUnit: string;
  smoothingSeconds: number;
}>;

export const SelectedMeasurement = ({
  selected,
  labels,
  selectedMotion,
  motion,
  motionUnit,
  smoothingSeconds
}: SelectedMeasurementProps) => {
  return (
    <Flex
      as='section'
      aria-label={selected ? 'Selected measurement' : 'Chart selection tip'}
      width='full'
      align='start'
      position='relative'
      gap={3}
      p={4}
      rounded='l3'
      textStyle='sm'
      colorPalette='blue'
      bg='colorPalette.subtle'
      color='colorPalette.fg'
    >
      {selected ? null : (
        <Icon asChild boxSize={5} flexShrink={0} aria-hidden='true'>
          <svg viewBox='0 0 24 24' fill='currentColor'>
            <path d='M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z' />
          </svg>
        </Icon>
      )}
      <Box flex='1' minW={0}>
        {selected ? (
          <Stack gap={3}>
            <Text fontWeight='semibold'>
              At{' '}
              {formatMeasurement(
                selected.distanceMetres / labels.metresPerDistance,
                labels.distance
              )}
            </Text>
            <Grid as='dl' templateColumns='repeat(2, minmax(0, 1fr))' gap={3}>
              <Box>
                <Text as='dt'>{motion === 'speed' ? 'Speed' : 'Pace'}</Text>
                <Text as='dd' fontSize='lg' fontWeight='semibold'>
                  {selectedMotion === null
                    ? 'Unavailable'
                    : formatChartMeasurement(selectedMotion, motionUnit)}
                </Text>
              </Box>
              <Box>
                <Text as='dt'>Elevation</Text>
                <Text as='dd' fontSize='lg' fontWeight='semibold'>
                  {formatMeasurement(
                    selected.elevationMetres === null
                      ? null
                      : selected.elevationMetres / labels.metresPerElevation,
                    labels.elevation
                  )}
                </Text>
              </Box>
            </Grid>
            <Text fontSize='xs'>
              Recorded time: <span>{formatRecordedTime(selected.sample.sourceTime)}</span>
            </Text>
            {selected.timeIssue ? <Text fontSize='xs'>{selected.timeIssue}</Text> : null}
            <Box as='details' fontSize='xs'>
              <Box as='summary' cursor='pointer' fontWeight='medium'>
                Source details
              </Box>
              <Stack gap={1} pt={2}>
                <Text>
                  Latitude: {selected.sample.latitudeDegrees}°; Longitude:{' '}
                  {selected.sample.longitudeDegrees}°
                </Text>
                <Text>
                  Elevation and time come from the file. Speed and pace are calculated
                  {smoothingSeconds
                    ? ` and averaged over ${formatSmoothingDuration(smoothingSeconds)}`
                    : ''}
                  .
                </Text>
              </Stack>
            </Box>
          </Stack>
        ) : (
          <Text>Select a point on the chart to see its details.</Text>
        )}
      </Box>
    </Flex>
  );
};
