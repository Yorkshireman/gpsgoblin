import { Field, Input } from '@chakra-ui/react';
import { smoothingDurations, formatSmoothingDuration } from '../measurementDisplay';

type MotionControlsProps = Readonly<{
  smoothingSeconds: number;
  setSmoothingSeconds: (seconds: number) => void;
}>;

export const MotionControls = ({ smoothingSeconds, setSmoothingSeconds }: MotionControlsProps) => {
  return (
    <Field.Root gap={0}>
      <Field.Label>
        Smoothing · <span>{formatSmoothingDuration(smoothingSeconds)}</span>
        {smoothingSeconds === 0 ? ' (unsmoothed)' : ''}
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
