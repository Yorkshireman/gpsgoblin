import { useState } from 'react';
import type { ReactNode } from 'react';
import { formatChartMeasurement } from '../measurementDisplay';
import { Box, Button, Field, Flex, Grid, Input, NativeSelect, Stack, Text } from '@chakra-ui/react';

type PaceRangeControlsProps = Readonly<{
  mode: 'suggested' | 'full' | 'custom';
  onModeChange: (mode: 'suggested' | 'full' | 'custom') => void;
  suggestedMaximum: number | undefined;
  maximum: number | undefined;
  onMaximumChange: (maximum: number | undefined) => void;
  unit: string;
  children?: ReactNode;
}>;

// Preserve disclosure state on unit changes; display the converted maximum.
export const PaceRangeControls = ({ mode, onModeChange, suggestedMaximum, maximum, onMaximumChange, unit, children }: PaceRangeControlsProps) => {
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
        {children}
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
                <Field.HelperText>Set the top of the chart. Use decimals: 7.5 means 7:30.</Field.HelperText>
              ) : null}
            </Field.Root>
          ) : null}
        </Grid>
        <Box as='details' mt={2}>
          <Box as='summary' cursor='pointer'>How suggested range works</Box>
          <Text color='fg.muted' fontSize='xs' mt={1}>Suggested range makes the pace for most of your route easier to see. Select an arrow to see a reading above the chart limit.</Text>
        </Box>
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
            Stopping or moving slowly can create tall spikes because you cover very little distance
            while time passes. GPS errors can also show small movements when you are standing still.
          </Text>
          <Text>
            Smoothing can soften brief changes, but a longer stop may still produce a large spike.
            Open Chart options and choose <Text as='strong' fontWeight='semibold'>Custom maximum</Text> to adjust how much of the graph is visible. Select an arrow to see a reading above the chart limit. Choose <Text as='strong' fontWeight='semibold'>Show full range</Text> to show the full
            range again. Your measurements and totals stay the same.
          </Text>
        </Stack>
      </Box>
    </Stack>
  );
};
