import { Field, Input, Text } from '@chakra-ui/react';
import { smoothingDurations, formatSmoothingDuration } from '../measurementDisplay';

type MotionControlsProps = Readonly<{
  smoothingSeconds: number;
  setSmoothingSeconds: (seconds: number) => void;
  pending?: boolean;
}>;

export const MotionControls = ({ smoothingSeconds, setSmoothingSeconds, pending }: MotionControlsProps) => {
  return (
    <Field.Root gap={0}>
      <Field.Label>
        Smoothing · <span>{formatSmoothingDuration(smoothingSeconds)}</span>
        {smoothingSeconds === 0 ? ' (unsmoothed)' : ''}
        {pending ? <Text as='span' role='status' fontSize='xs' color='fg.muted'>Updating…</Text> : null}
      </Field.Label>
      <Input
        aria-label='Smoothing'
        type='range'
        appearance='auto'
        accentColor='green.solid'
        borderWidth={0}
        p={0}
        min={0}
        max={smoothingDurations.length - 1}
        step={1}
        value={smoothingDurations.indexOf(smoothingSeconds)}
        aria-valuetext={
          smoothingSeconds ? formatSmoothingDuration(smoothingSeconds) : '0 seconds (unsmoothed)'
        }
        onChange={event => {
          setSmoothingSeconds(smoothingDurations[Number(event.currentTarget.value)]);
        }}
      />
    </Field.Root>
  );
};
