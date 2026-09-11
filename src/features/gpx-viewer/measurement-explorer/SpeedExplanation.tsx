import { Box, Stack, Text } from '@chakra-ui/react';

type SpeedExplanationProps = Readonly<{
  timedIntervalCount: number;
  intervalCount: number;
}>;

export const SpeedExplanation = ({ timedIntervalCount, intervalCount }: SpeedExplanationProps) => {
  return (
    <Box as='details' fontSize='sm' color='fg.muted'>
      <Box as='summary' cursor='pointer' fontWeight='medium' color='fg'>
        How speed is calculated
      </Box>
      <Stack gap={2} pt={3}>
        <Text>
          We calculate speed from the distance and time between recorded locations. Small GPS errors
          can make this jump around, even when you move steadily.
        </Text>
        <Text>
          The dashed line shows the average speed for the selected track or section, including
          recorded stops. Sections without usable times are left out. Changing smoothing does not
          change this average.
        </Text>
        <Text>
          The smoothing slider averages speed over the number of seconds you choose. Higher values
          make the overall pattern easier to see, but soften brief changes. Set it to 0 seconds to
          see the unsmoothed measurements.
        </Text>
        <Text>
          We restart the average after missing or unusable times. At the start of each section, we
          use the time available. Pace is the time it takes to cover one kilometre or mile, shown as
          minutes:seconds.
        </Text>
        <Text>
          Distance and duration are calculated from the recording. Elevation and recorded times come
          from your file. Totals saved by your device may differ; we don’t read those totals yet.
          Your original file is unchanged.
        </Text>
        <Text>
          {timedIntervalCount} of {intervalCount} pairs of recorded locations have usable times.
        </Text>
      </Stack>
    </Box>
  );
};
