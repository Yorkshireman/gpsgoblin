import { Box, Grid, Stack, Stat, Text } from '@chakra-ui/react';
import { analyseMeasurements } from '@/analysis/measurements';
import { displayUnits, formatDuration, formatMeasurement } from '../measurementDisplay';

type MeasurementSummaryProps = Readonly<{
  analysis: ReturnType<typeof analyseMeasurements>;
  labels: ReturnType<typeof displayUnits>;
  plannedRoute: boolean;
}>;

export const MeasurementSummary = ({ analysis, labels, plannedRoute }: MeasurementSummaryProps) => {
  return (
    <Box mb={2} bg='bg' borderWidth='1px' borderColor='border.subtle' rounded='xl' p={{ base: 3, md: 4 }}>
      <Stack gap={1}>
        <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={3}>
          <Stat.Root>
            <Stat.Label>Calculated distance</Stat.Label>
            <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
              {formatMeasurement(
                analysis.distanceMetres / labels.metresPerDistance,
                labels.distance
              )}
            </Stat.ValueText>
          </Stat.Root>
          <Stat.Root>
            <Stat.Label>Elapsed time</Stat.Label>
            <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
              {formatDuration(analysis.elapsedDurationSeconds)}
            </Stat.ValueText>
          </Stat.Root>
        </Grid>
        <Box as='details' fontSize='sm'>
          <Box as='summary' cursor='pointer' alignContent='center'>
            About these totals
          </Box>
          <Stack gap={1} pb={2}>
            <Text>
              {!plannedRoute
                ? 'Based on the recorded GPS points'
                : 'Based on straight lines between route points'}
              . Distance may differ from your device.
            </Text>
            <Text>
              Elapsed time runs from start to finish, including stops and recording gaps. Choosing
              stops to leave out of a chart does not change these totals.
            </Text>
          </Stack>
        </Box>
      </Stack>
      {analysis.elapsedDurationSeconds === null ? (
        <Text fontSize='sm'>Elapsed time needs valid start and finish times.</Text>
      ) : null}
      {plannedRoute ? <Text>This is a planned route. Its times may be estimates.</Text> : null}
      {analysis.warnings.length ? (
        <Box as='details' fontSize='sm'>
          <Box as='summary' cursor='pointer' fontWeight='medium'>
            Measurement warnings ({analysis.warnings.length})
          </Box>
          <Stack as='section' aria-label='Measurement warnings' gap={1} pt={2}>
            {analysis.warnings.map(warning => {
              return (
                <Text key={warning} fontSize='sm'>
                  {warning}
                </Text>
              );
            })}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};
