import {
  Box,
  Flex,
  Grid,
  Icon,
  IconButton,
  Stack,
  Text
} from '@chakra-ui/react';
import type { MeasurementPoint } from '@/analysis/measurements';
import {
  displayUnits,
  formatDuration,
  formatMeasurement,
  formatChartMeasurement,
  formatRecordedTime,
  formatSmoothingDuration
} from '../measurementDisplay';
import type { MotionDisplay } from '../measurementDisplay';

type SelectedMeasurementProps = Readonly<{
  selected: MeasurementPoint | undefined;
  onClear: () => void;
  labels: ReturnType<typeof displayUnits>;
  selectedMotion: number | null;
  axisMaximum?: number;
  motion: MotionDisplay;
  motionUnit: string;
  smoothingSeconds: number;
}>;

export const SelectedMeasurement = ({
  selected,
  onClear,
  labels,
  selectedMotion,
  axisMaximum,
  motion,
  motionUnit,
  smoothingSeconds
}: SelectedMeasurementProps) => {
  if (selected?.recordingGap) {
    return (
      <Stack
        as="section"
        aria-label="Selected measurement"
        role="status"
        gap={1}
        p={2}
        rounded="l3"
        bg="blue.subtle"
        color="blue.fg"
        fontSize="sm"
      >
        <Flex align="center" justify="space-between" gap={2} minH="36px">
          <Text fontWeight="semibold">
            Recording gap at{' '}
            {formatMeasurement(
              selected.distanceMetres / labels.metresPerDistance,
              labels.distance
            )}
          </Text>
          <IconButton
            aria-label="Close gap details"
            title="Close gap details"
            variant="ghost"
            colorPalette="blue"
            size="sm"
            minW="44px"
            minH="44px"
            my={-1}
            onClick={onClear}
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="m4 4 8 8M12 4l-8 8" />
            </svg>
          </IconButton>
        </Flex>
        <Box as="details">
          <Box as="summary" cursor="pointer">
            No GPS readings for {formatDuration(selected.recordingGap.seconds)}
          </Box>
          <Stack gap={1} pt={2}>
            <Text>
              The last and next positions are{' '}
              {formatMeasurement(
                selected.recordingGap.distanceMetres /
                  (labels.elevation === 'ft' ? 0.3048 : 1),
                labels.elevation
              )}{' '}
              apart.
            </Text>
            <Text fontSize="xs">
              We can’t tell how you moved during this gap. The map shows where
              recording resumed.
            </Text>
          </Stack>
        </Box>
      </Stack>
    );
  }
  return (
    <Flex
      as="section"
      aria-label={selected ? 'Selected measurement' : 'Chart selection tip'}
      width="full"
      align="start"
      position="relative"
      gap={1}
      p={2}
      rounded="l3"
      textStyle="sm"
      colorPalette="blue"
      bg="colorPalette.subtle"
      color="colorPalette.fg"
    >
      {selected ? null : (
        <Icon asChild boxSize={5} flexShrink={0} aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM11 7H13V9H11V7ZM11 11H13V17H11V11Z" />
          </svg>
        </Icon>
      )}
      <Box flex="1" minW={0}>
        {selected ? (
          <Stack gap={1}>
            <Flex align="center" justify="space-between" gap={2} minH="36px">
              <Text fontWeight="semibold">
                At{' '}
                {formatMeasurement(
                  selected.distanceMetres / labels.metresPerDistance,
                  labels.distance
                )}
              </Text>
              <IconButton
                aria-label="Close point details"
                title="Close point details"
                variant="ghost"
                colorPalette="blue"
                size="sm"
                minW="44px"
                minH="44px"
                my={-1}
                onClick={onClear}
              >
                <svg
                  aria-hidden="true"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="m4 4 8 8M12 4l-8 8" />
                </svg>
              </IconButton>
            </Flex>
            <Grid as="dl" templateColumns="repeat(2, minmax(0, 1fr))" gap={1}>
              <Box>
                <Text as="dt">{motion === 'speed' ? 'Speed' : 'Pace'}</Text>
                <Text as="dd" fontSize="md" fontWeight="semibold">
                  {selectedMotion === null
                    ? 'Unavailable'
                    : formatChartMeasurement(selectedMotion, motionUnit)}
                </Text>
              </Box>
              <Box>
                <Text as="dt">Elevation</Text>
                <Text as="dd" fontSize="md" fontWeight="semibold">
                  {formatMeasurement(
                    selected.elevationMetres === null
                      ? null
                      : selected.elevationMetres / labels.metresPerElevation,
                    labels.elevation
                  )}
                </Text>
              </Box>
            </Grid>
            {axisMaximum !== undefined &&
            selectedMotion !== null &&
            selectedMotion > axisMaximum ? (
              <Text fontSize="xs">
                Above the chart limit (
                {formatChartMeasurement(axisMaximum, motionUnit)}).
              </Text>
            ) : null}
            <Text fontSize="xs">
              Recorded time:{' '}
              <span>{formatRecordedTime(selected.sample.sourceTime)}</span>
            </Text>
            {selected.timeIssue ? (
              <Text fontSize="xs">
                This GPS reading has no reliable time, so speed and pace cannot
                be calculated here.
              </Text>
            ) : null}
            <Box as="details" fontSize="xs">
              <Box as="summary" cursor="pointer" fontWeight="medium">
                GPS details
              </Box>
              <Stack gap={1} pt={2}>
                <Text>
                  Latitude: {selected.sample.latitudeDegrees}°; Longitude:{' '}
                  {selected.sample.longitudeDegrees}°
                </Text>
                <Text>
                  Elevation and time come from the file. Speed and pace are
                  calculated
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
