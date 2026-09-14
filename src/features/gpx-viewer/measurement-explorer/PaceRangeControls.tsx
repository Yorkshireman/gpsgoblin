import { useState } from 'react';
import { formatChartMeasurement } from '../measurementDisplay';
import { Box, Button, Field, Flex, Grid, Input, NativeSelect, Stack, Text } from '@chakra-ui/react';

type PaceRangeControlsProps = Readonly<{
  mode: 'suggested' | 'full' | 'custom';
  onModeChange: (mode: 'suggested' | 'full' | 'custom') => void;
  suggestedMaximum: number | undefined;
  maximum: number | undefined;
  onMaximumChange: (maximum: number | undefined) => void;
  unit: string;
}>;

// Preserve disclosure state on unit changes; display the converted maximum.
export const PaceRangeControls = ({ mode, onModeChange, suggestedMaximum, maximum, onMaximumChange, unit }: PaceRangeControlsProps) => {
  const [entry, setEntry] = useState<{ unit: string; value: string }>();
  const draft = entry?.unit === unit ? entry.value : maximum === undefined ? '' : String(Number(maximum.toPrecision(12)));
  const visibleMaximum = mode === 'suggested' ? suggestedMaximum : mode === 'custom' ? maximum : undefined;
  const invalid = draft !== '' && (!Number.isFinite(Number(draft)) || Number(draft) <= 0);
  return (
    <Stack gap={2}>
      <Flex align='center' justify='space-between' gap={2} wrap='wrap' fontSize='sm'>
        <Text>{mode === 'suggested' ? 'Suggested range' : mode === 'full' ? 'Full range' : 'Custom range'}
          {visibleMaximum !== undefined ? ` · ${formatChartMeasurement(visibleMaximum, unit)}` : ''}</Text>
        <Button size='xs' variant='plain' onClick={() => { onModeChange(mode === 'full' ? 'suggested' : 'full'); }}>
          {mode === 'full' ? 'Use suggested range' : 'Show full range'}
        </Button>
      </Flex>
      <Box as='details' fontSize='sm'>
        <Box as='summary' cursor='pointer' fontWeight='medium'>Chart options</Box>
        <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2} alignItems='start' pt={2}>
          <Field.Root>
            <Field.Label>Pace range</Field.Label>
            <NativeSelect.Root>
              <NativeSelect.Field value={mode} onChange={event => {
                const value = event.currentTarget.value;
                onModeChange(value === 'custom' ? 'custom' : value === 'full' ? 'full' : 'suggested');
              }}>
                <option value='suggested'>Suggested</option>
                <option value='full'>Full range</option>
                <option value='custom'>Custom maximum</option>
              </NativeSelect.Field>
              <NativeSelect.Indicator />
            </NativeSelect.Root>
          </Field.Root>
          {mode === 'custom' ? (
            <Field.Root invalid={invalid}>
              <Field.Label>Maximum ({unit})</Field.Label>
              <Input type='number' inputMode='decimal' step='any' value={draft} placeholder='Enter minutes'
                onChange={event => {
                  const value = event.currentTarget.value;
                  setEntry({ unit, value });
                  const number = Number(value);
                  onMaximumChange(value !== '' && Number.isFinite(number) && number > 0 ? number : undefined);
                }} />
              {invalid ? (
                <Field.ErrorText>Enter a number greater than zero. Showing the full range.</Field.ErrorText>
              ) : draft === '' ? (
                <Field.HelperText>Enter minutes to set the visible maximum.</Field.HelperText>
              ) : null}
            </Field.Root>
          ) : null}
        </Grid>
        <Text color='fg.muted' mt={2}>Suggested range focuses on the pace over most of your recorded distance. A short, slow section may sit above it. No measurements are removed.</Text>
      </Box>
      <Box as='details' fontSize='sm' color='fg.muted'>
        <Box as='summary' cursor='pointer' fontWeight='medium' color='fg'>
          Why does pace sometimes spike?
        </Box>
        <Stack gap={2} pt={2}>
          <Text>
            Pace is the time it takes to cover one {unit === 'min/mi' ? 'mile' : 'kilometre'}.
            A higher number means a slower pace.
          </Text>
          <Text>
            When you stop or move very slowly, a lot of time can pass while you cover very little
            distance. Small GPS position changes can register movement even while you stand still.
            This can produce a very high pace value and a tall spike on the graph.
          </Text>
          <Text>
            Smoothing can soften brief changes, but a longer stop may still produce a large spike.
            Open Chart options and choose <Text as='strong' fontWeight='semibold'>Custom maximum</Text> to adjust how much of the graph is visible. Values above your
            maximum stay available through the arrow markers. Choose <Text as='strong' fontWeight='semibold'>Show full range</Text> to show the full
            range again. Your measurements and totals stay the same.
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};
