import { useState } from 'react';
import { Field, Grid, Input, NativeSelect } from '@chakra-ui/react';

type PaceRangeControlsProps = Readonly<{
  custom: boolean;
  onCustomChange: (custom: boolean) => void;
  maximum: number | undefined;
  onMaximumChange: (maximum: number | undefined) => void;
  unit: string;
}>;

// Remount on unit changes so the draft reflects the converted maximum.
export const PaceRangeControls = ({ custom, onCustomChange, maximum, onMaximumChange, unit }: PaceRangeControlsProps) => {
  const [draft, setDraft] = useState(maximum === undefined ? '' : String(Number(maximum.toPrecision(12))));
  const invalid = draft !== '' && (!Number.isFinite(Number(draft)) || Number(draft) <= 0);
  return (
    <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={2} alignItems='start'>
      <Field.Root>
        <Field.Label>Pace range</Field.Label>
        <NativeSelect.Root>
          <NativeSelect.Field value={custom ? 'custom' : 'automatic'} onChange={event => {
            onCustomChange(event.currentTarget.value === 'custom');
          }}>
            <option value='automatic'>Automatic</option>
            <option value='custom'>Custom maximum</option>
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>
      </Field.Root>
      {custom ? (
        <Field.Root invalid={invalid}>
          <Field.Label>Maximum ({unit})</Field.Label>
          <Input type='number' inputMode='decimal' step='any' value={draft} placeholder='Enter minutes'
            onChange={event => {
              const value = event.currentTarget.value;
              setDraft(value);
              const number = Number(value);
              onMaximumChange(value !== '' && Number.isFinite(number) && number > 0 ? number : undefined);
            }} />
          {invalid ? (
            <Field.ErrorText>Enter a number greater than zero. Showing the automatic range.</Field.ErrorText>
          ) : draft === '' ? (
            <Field.HelperText>Enter minutes to set the visible maximum.</Field.HelperText>
          ) : null}
        </Field.Root>
      ) : null}
    </Grid>
  );
};
