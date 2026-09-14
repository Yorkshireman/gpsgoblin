import { Box, Stack, Text } from '@chakra-ui/react';

export const SpeedExplanation = ({ moving }: Readonly<{ moving: boolean }>) => {
  return (
    <Box as='details' fontSize='sm' color='fg.muted'>
      <Box as='summary' cursor='pointer' fontWeight='medium' color='fg'>
        How speed is calculated
      </Box>
      <Stack gap={2} pt={3}>
        <Text>
          Speed comes from the distance and time between GPS readings. Small GPS errors can make
          it jump around, even when you move steadily.
        </Text>
        <Text>
          {moving
            ? 'The average leaves out the stops you chose and any recording gaps. Stops you have not chosen still count.'
            : 'The average includes stops and time in recording gaps. You can choose stops to leave out under Chart options.'}
          {' '}Parts with missing or unreliable times cannot be included.
        </Text>
        <Text>
          Smoothing averages nearby speed readings to make the line less jumpy. A longer setting
          shows the overall pattern; a shorter one shows more detail. Set it to 0 to turn it off.
          It does not change your overall average.
        </Text>
        <Text>
          Breaks in the line mean readings are missing or you chose to leave out a stop. We do
          not guess your speed across a break. Your original file and the distance and duration
          totals stay unchanged.
        </Text>
        <Text>
          Distance is calculated from GPS positions, so it may differ from the total on your device.
          Pace is the time it takes to cover a kilometre or mile. A higher pace number means you
          were going more slowly.
        </Text>
      </Stack>
    </Box>
  );
};
