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
    <>
      <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={3}>
        <Stat.Root>
          <Stat.Label>Calculated distance</Stat.Label>
          <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
            {formatMeasurement(analysis.distanceMetres / labels.metresPerDistance, labels.distance)}
          </Stat.ValueText>
          <Stat.HelpText fontSize='xs'>
            {!plannedRoute
              ? 'Based on the recorded GPS points'
              : 'Based on straight lines between route points'}
          </Stat.HelpText>
        </Stat.Root>
        <Stat.Root>
          <Stat.Label>Duration</Stat.Label>
          <Stat.ValueText fontSize={{ base: 'xl', md: '2xl' }}>
            {formatDuration(analysis.elapsedDurationSeconds)}
          </Stat.ValueText>
          <Stat.HelpText fontSize='xs'>
            {analysis.elapsedDurationSeconds === null
              ? 'Needs valid start and finish times'
              : 'From start to finish, including pauses and gaps'}
          </Stat.HelpText>
        </Stat.Root>
      </Grid>
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
    </>
  );
};
